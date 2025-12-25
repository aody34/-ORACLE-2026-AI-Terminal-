// Main Oracle API Endpoint for $ORACLE 2026 Terminal
// Returns prophecy predictions aggregating DexScreener, CoinGecko, and CoinMarketCap data

import { NextRequest, NextResponse } from 'next/server';
import { getCoinByTicker, fetchHistoricalData, COIN_IDS, SECTORS } from '@/lib/coingecko';
import { getTechnicalAnalysis, extractClosingPrices } from '@/lib/technical-analysis';
import { generateProphecy, PredictionInput } from '@/lib/gemini-brain';
import { fetchDexScreenerData, getDexSentiment } from '@/lib/dexscreener';
import { fetchCMCData, analyzeMomentum, getRankingTier } from '@/lib/coinmarketcap';
import {
    lookupToken,
    isContractAddress,
    detectCategory,
    getCategoryEmoji,
    formatMarketCap,
    TokenLookupResult
} from '@/lib/token-lookup';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const input = searchParams.get('ticker')?.trim() || '';

    if (!input) {
        return NextResponse.json(
            { error: 'Missing ticker parameter. Usage: /api/oracle?ticker=FET or /api/oracle?ticker=0x...' },
            { status: 400 }
        );
    }

    try {
        // First, lookup the token (works for both addresses and symbols)
        console.log('Oracle API: Looking up input:', input);
        const tokenInfo = await lookupToken(input);

        // Check if we found the token
        if (!tokenInfo) {
            return NextResponse.json(
                {
                    error: `Could not find token for "${input}".`,
                    hint: isContractAddress(input)
                        ? 'Make sure the contract address is correct and has trading activity on DEX.'
                        : 'Try a different ticker or paste a contract address from DexScreener.',
                },
                { status: 404 }
            );
        }

        console.log('Oracle API: Found token:', tokenInfo.symbol, 'Image:', tokenInfo.imageUrl);

        const ticker = tokenInfo.symbol;

        // Get coin ID for CoinGecko historical data
        const coinId = COIN_IDS[ticker];
        const isKnownCoin = !!coinId;

        // Fetch additional data in parallel
        const [coinData, historicalData, cmcData] = await Promise.all([
            isKnownCoin ? getCoinByTicker(ticker) : null,
            isKnownCoin && coinId ? fetchHistoricalData(coinId, 30) : Promise.resolve({ prices: [] as [number, number][], market_caps: [], total_volumes: [] }),
            fetchCMCData(ticker),
        ]);

        // Use token info from DexScreener as primary source
        const priceData = {
            id: ticker.toLowerCase(),
            symbol: ticker.toLowerCase(),
            name: tokenInfo.name,
            current_price: tokenInfo.price,
            market_cap: tokenInfo.marketCap,
            total_volume: tokenInfo.volume24h,
            price_change_percentage_24h: tokenInfo.priceChange24h,
            high_24h: tokenInfo.price * 1.05,
            low_24h: tokenInfo.price * 0.95,
        };

        // Calculate technical indicators
        const prices = historicalData.prices.length > 0
            ? extractClosingPrices(historicalData)
            : Array.from({ length: 30 }, (_, i) => priceData.current_price * (1 + (Math.random() - 0.5) * 0.1));
        const technicalAnalysis = getTechnicalAnalysis(prices);

        // Analyze DEX sentiment from token info
        const dexSentiment = tokenInfo.buys24h > 0 || tokenInfo.sells24h > 0
            ? getDexSentiment({
                ticker,
                tokenName: tokenInfo.name,
                priceUsd: tokenInfo.price,
                volume24h: tokenInfo.volume24h,
                volume6h: tokenInfo.volume24h * 0.25,
                volume1h: tokenInfo.volume24h * 0.04,
                liquidityUsd: tokenInfo.liquidity,
                fdv: tokenInfo.fdv,
                marketCap: tokenInfo.marketCap,
                priceChange24h: tokenInfo.priceChange24h,
                priceChange6h: tokenInfo.priceChange24h * 0.4,
                priceChange1h: tokenInfo.priceChange24h * 0.1,
                buys24h: tokenInfo.buys24h,
                sells24h: tokenInfo.sells24h,
                buysSellsRatio: tokenInfo.sells24h > 0 ? tokenInfo.buys24h / tokenInfo.sells24h : 1,
                dexId: tokenInfo.dexId || 'unknown',
                pairAddress: tokenInfo.pairAddress || '',
                topPairsCount: 1,
                chain: tokenInfo.chain || 'ethereum',
                imageUrl: tokenInfo.imageUrl,
            })
            : null;

        // Analyze CMC momentum
        const momentum = cmcData ? analyzeMomentum(cmcData) : null;
        const rankingTier = cmcData ? getRankingTier(cmcData.rank) : null;

        // Determine sector/category
        const category = tokenInfo.category;

        // Calculate composite confidence score
        const compositeConfidence = calculateCompositeScore({
            rsi: technicalAnalysis.rsi,
            bollingerPosition: technicalAnalysis.bollingerBands.percentB,
            dexBuySellRatio: tokenInfo.sells24h > 0 ? tokenInfo.buys24h / tokenInfo.sells24h : 1,
            momentumScore: momentum?.score || 0,
            rank: cmcData?.rank || 100,
        });

        // Generate prediction with enhanced data
        const predictionInput: PredictionInput = {
            ticker,
            name: tokenInfo.name,
            currentPrice: tokenInfo.price,
            volume24h: tokenInfo.volume24h,
            priceChange24h: tokenInfo.priceChange24h,
            rsi: technicalAnalysis.rsi,
            bollingerPosition: technicalAnalysis.bollingerBands.percentB,
            sector: category as 'AI' | 'RWA' | 'MEME',
        };

        const prediction = await generateProphecy(predictionInput);

        // Determine enhanced outlook based on multiple signals
        const enhancedOutlook = determineEnhancedOutlook({
            technicalSignal: technicalAnalysis.signal,
            dexSentiment: dexSentiment?.signal,
            momentumTrend: momentum?.trend,
            rsi: technicalAnalysis.rsi,
        });

        // Calculate 6-month market cap prediction
        const currentMarketCap = tokenInfo.marketCap || 0;
        const sixMonthPrediction = calculate6MonthPrediction({
            currentMarketCap,
            momentum: momentum?.score || 0,
            rsi: technicalAnalysis.rsi,
            dexSentiment: dexSentiment?.strength || 50,
            priceChange30d: cmcData?.percentChange30d || 0,
            isBullish: enhancedOutlook.outlook === 'Bullish',
        });

        // Return comprehensive oracle response
        return NextResponse.json({
            // Token Identity (FROM DEXSCREENER)
            ticker,
            name: tokenInfo.name,
            image: tokenInfo.imageUrl,  // Direct from DexScreener
            address: tokenInfo.address,
            chain: tokenInfo.chain,
            category: category,
            category_emoji: getCategoryEmoji(category),

            // Current Price Data
            price: tokenInfo.price,
            price_formatted: formatPrice(tokenInfo.price),
            volume_24h: tokenInfo.volume24h,
            volume_24h_formatted: formatMarketCap(tokenInfo.volume24h),
            price_change_24h: tokenInfo.priceChange24h,

            // Market Cap
            market_cap: currentMarketCap,
            market_cap_formatted: formatMarketCap(currentMarketCap),
            fdv: tokenInfo.fdv,
            fdv_formatted: formatMarketCap(tokenInfo.fdv),

            // 6-Month Prediction
            prediction_6m: {
                market_cap_low: sixMonthPrediction.lowEstimate,
                market_cap_low_formatted: formatMarketCap(sixMonthPrediction.lowEstimate),
                market_cap_mid: sixMonthPrediction.midEstimate,
                market_cap_mid_formatted: formatMarketCap(sixMonthPrediction.midEstimate),
                market_cap_high: sixMonthPrediction.highEstimate,
                market_cap_high_formatted: formatMarketCap(sixMonthPrediction.highEstimate),
                growth_percent: sixMonthPrediction.growthPercent,
                confidence: sixMonthPrediction.confidence,
                reasoning: sixMonthPrediction.reasoning,
            },

            // Technical Analysis
            technical: {
                rsi: technicalAnalysis.rsi,
                bollinger_position: technicalAnalysis.bollingerBands.percentB,
                bollinger_upper: technicalAnalysis.bollingerBands.upper,
                bollinger_lower: technicalAnalysis.bollingerBands.lower,
                signal: technicalAnalysis.signal,
            },

            // DexScreener Data
            dex: {
                liquidity_usd: tokenInfo.liquidity,
                liquidity_formatted: formatMarketCap(tokenInfo.liquidity),
                buys_24h: tokenInfo.buys24h,
                sells_24h: tokenInfo.sells24h,
                buys_sells_ratio: tokenInfo.sells24h > 0 ? (tokenInfo.buys24h / tokenInfo.sells24h).toFixed(2) : 'N/A',
                sentiment: dexSentiment?.signal || 'NEUTRAL',
                sentiment_strength: dexSentiment?.strength || 50,
                dex_id: tokenInfo.dexId,
                pair_address: tokenInfo.pairAddress,
            },

            // CoinMarketCap Data
            cmc: cmcData ? {
                rank: cmcData.rank,
                ranking_tier: rankingTier?.tier || 'UNKNOWN',
                ranking_description: rankingTier?.description || '',
                percent_change_1h: cmcData.percentChange1h,
                percent_change_7d: cmcData.percentChange7d,
                percent_change_30d: cmcData.percentChange30d,
                momentum: momentum,
                num_market_pairs: cmcData.numMarketPairs,
            } : null,

            // Oracle Prediction
            prediction: {
                outlook: enhancedOutlook.outlook,
                prophecy: prediction.prophecy,
                target_cap: prediction.target_cap,
                confidence: compositeConfidence,
                signals_bullish: enhancedOutlook.bullishSignals,
                signals_bearish: enhancedOutlook.bearishSignals,
            },

            // Data source info
            sector: category,
            data_sources: ['DexScreener', isKnownCoin ? 'CoinGecko' : null, 'CoinMarketCap'].filter(Boolean),
            source: tokenInfo.source,
        });

    } catch (error) {
        console.error('Oracle API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch prediction data. Please try again.' },
            { status: 500 }
        );
    }
}

// Helper functions

function formatPrice(price: number): string {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    if (price >= 0.0001) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(10)}`;
}

function calculateCompositeScore(params: {
    rsi: number;
    bollingerPosition: number;
    dexBuySellRatio: number;
    momentumScore: number;
    rank: number;
}): number {
    const { rsi, bollingerPosition, dexBuySellRatio, momentumScore, rank } = params;

    // RSI score (oversold = bullish, overbought = bearish)
    let rsiScore = 50;
    if (rsi < 30) rsiScore = 80;
    else if (rsi < 40) rsiScore = 65;
    else if (rsi > 70) rsiScore = 30;
    else if (rsi > 60) rsiScore = 45;

    // Bollinger position score
    let bollingerScore = 50;
    if (bollingerPosition < 0.2) bollingerScore = 75;
    else if (bollingerPosition > 0.8) bollingerScore = 35;

    // DEX buy/sell ratio score
    const ratioScore = Math.min(80, 40 + (dexBuySellRatio - 1) * 20);

    // Momentum score (already -50 to +50 range, normalize to 0-100)
    const normalizedMomentum = 50 + momentumScore;

    // Weighted average
    const baseScore = (rsiScore * 0.25) + (bollingerScore * 0.2) + (ratioScore * 0.3) + (normalizedMomentum * 0.25);

    // Bonus for high ranking tokens
    const rankBonus = rank <= 50 ? 10 : rank <= 100 ? 5 : 0;

    return Math.round(Math.min(99, baseScore + rankBonus));
}

function determineEnhancedOutlook(params: {
    technicalSignal: string;
    dexSentiment?: string;
    momentumTrend?: string;
    rsi: number;
}): {
    outlook: 'Bullish' | 'Bearish';
    bullishSignals: string[];
    bearishSignals: string[];
} {
    const bullishSignals: string[] = [];
    const bearishSignals: string[] = [];

    if (params.technicalSignal === 'OVERSOLD') {
        bullishSignals.push('RSI oversold - accumulation zone');
    } else if (params.technicalSignal === 'OVERBOUGHT') {
        bearishSignals.push('RSI overbought - distribution zone');
    }

    if (params.dexSentiment === 'ACCUMULATING') {
        bullishSignals.push('DEX showing accumulation (high buy/sell ratio)');
    } else if (params.dexSentiment === 'DISTRIBUTING') {
        bearishSignals.push('DEX showing distribution (high sell pressure)');
    }

    if (params.momentumTrend === 'STRONG_UP' || params.momentumTrend === 'UP') {
        bullishSignals.push(`Multi-timeframe momentum: ${params.momentumTrend}`);
    } else if (params.momentumTrend === 'STRONG_DOWN' || params.momentumTrend === 'DOWN') {
        bearishSignals.push(`Multi-timeframe momentum: ${params.momentumTrend}`);
    }

    if (params.rsi < 40) {
        bullishSignals.push('RSI indicates potential reversal zone');
    } else if (params.rsi > 60) {
        bearishSignals.push('RSI indicates extended conditions');
    }

    const outlook = bullishSignals.length >= bearishSignals.length ? 'Bullish' : 'Bearish';

    return { outlook, bullishSignals, bearishSignals };
}

function calculate6MonthPrediction(params: {
    currentMarketCap: number;
    momentum: number;
    rsi: number;
    dexSentiment: number;
    priceChange30d: number;
    isBullish: boolean;
}): {
    lowEstimate: number;
    midEstimate: number;
    highEstimate: number;
    growthPercent: number;
    confidence: number;
    reasoning: string;
} {
    const { currentMarketCap, momentum, rsi, dexSentiment, priceChange30d, isBullish } = params;

    let baseGrowthRate = 0.15;
    const momentumFactor = 1 + (momentum / 100);

    let rsiFactor = 1;
    if (rsi < 30) rsiFactor = 1.3;
    else if (rsi > 70) rsiFactor = 0.7;

    const sentimentFactor = 1 + ((dexSentiment - 50) / 200);
    const recentPerformanceFactor = 1 + (priceChange30d / 200);

    const growthMultiplier = baseGrowthRate * momentumFactor * rsiFactor * sentimentFactor * recentPerformanceFactor;

    const midGrowth = isBullish ? Math.max(0.1, growthMultiplier * 1.5) : Math.max(-0.2, growthMultiplier * 0.5);
    const lowGrowth = midGrowth * 0.5;
    const highGrowth = midGrowth * 2.5;

    const lowEstimate = currentMarketCap * (1 + lowGrowth);
    const midEstimate = currentMarketCap * (1 + midGrowth);
    const highEstimate = currentMarketCap * (1 + highGrowth);

    const confidence = Math.min(85, 50 + Math.abs(momentum) / 2 + (dexSentiment / 4));

    let reasoning = '';
    if (isBullish) {
        if (midGrowth > 0.5) {
            reasoning = 'Strong bullish indicators suggest significant upside potential.';
        } else if (midGrowth > 0.2) {
            reasoning = 'Moderate bullish outlook with healthy momentum.';
        } else {
            reasoning = 'Cautiously bullish with limited near-term catalysts.';
        }
    } else {
        if (midGrowth < -0.1) {
            reasoning = 'Bearish pressure detected. Consider waiting for better entry.';
        } else {
            reasoning = 'Neutral to slightly bearish. Consolidation expected.';
        }
    }

    return {
        lowEstimate: Math.round(lowEstimate),
        midEstimate: Math.round(midEstimate),
        highEstimate: Math.round(highEstimate),
        growthPercent: Math.round(midGrowth * 100),
        confidence: Math.round(confidence),
        reasoning,
    };
}
