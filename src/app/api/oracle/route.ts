// Main Oracle API Endpoint for $ORACLE 2026 Terminal
// Returns prophecy predictions aggregating CoinGecko, DexScreener, and CoinMarketCap data

import { NextRequest, NextResponse } from 'next/server';
import { getCoinByTicker, fetchHistoricalData, COIN_IDS, SECTORS } from '@/lib/coingecko';
import { getTechnicalAnalysis, extractClosingPrices } from '@/lib/technical-analysis';
import { generateProphecy, PredictionInput } from '@/lib/gemini-brain';
import { fetchDexScreenerData, getDexSentiment } from '@/lib/dexscreener';
import { fetchCMCData, analyzeMomentum, getRankingTier } from '@/lib/coinmarketcap';
import { isContractAddress, lookupByAddress, getBestTokenImage } from '@/lib/token-images';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    let input = searchParams.get('ticker')?.trim() || '';

    if (!input) {
        return NextResponse.json(
            { error: 'Missing ticker parameter. Usage: /api/oracle?ticker=FET or /api/oracle?ticker=0x...' },
            { status: 400 }
        );
    }

    // Check if input is a contract address
    const isAddress = isContractAddress(input);
    let ticker = input.toUpperCase();
    let addressLookupResult = null;

    // If it's an address, lookup the token info first
    if (isAddress) {
        addressLookupResult = await lookupByAddress(input);
        if (addressLookupResult) {
            ticker = addressLookupResult.symbol.toUpperCase();
        } else {
            return NextResponse.json(
                {
                    error: 'Could not find token for this address.',
                    hint: 'Make sure the address is correct and has trading activity on DEX.'
                },
                { status: 404 }
            );
        }
    }

    // Get coin ID - if not in our list, we'll still try with DEX data
    const coinId = COIN_IDS[ticker];
    const isKnownCoin = !!coinId;

    try {
        // Fetch data from all sources in parallel
        // For unknown coins, we'll rely more on DEX data
        const [coinData, historicalData, dexData, cmcData] = await Promise.all([
            isKnownCoin ? getCoinByTicker(ticker) : null,
            isKnownCoin && coinId ? fetchHistoricalData(coinId, 30) : Promise.resolve({ prices: [] as [number, number][], market_caps: [], total_volumes: [] }),
            fetchDexScreenerData(ticker),  // Always try DEX
            fetchCMCData(ticker),          // Will return mock if not found
        ]);

        // If no CoinGecko data, try to use DEX data
        const effectiveCoinData = coinData || (dexData ? {
            id: ticker.toLowerCase(),
            symbol: ticker.toLowerCase(),
            name: dexData.ticker,
            current_price: dexData.priceUsd,
            market_cap: dexData.marketCap,
            total_volume: dexData.volume24h,
            price_change_percentage_24h: dexData.priceChange24h,
            high_24h: dexData.priceUsd * 1.05,
            low_24h: dexData.priceUsd * 0.95,
        } : null);

        if (!effectiveCoinData && !dexData) {
            return NextResponse.json(
                {
                    error: `Could not find data for ${ticker}. Try a different ticker.`,
                    hint: 'Supported tickers include BTC, ETH, SOL, PEPE, FET, DOGE, SHIB, ARB, and 60+ more.'
                },
                { status: 404 }
            );
        }

        // Use DEX data as fallback for price info
        const priceData = effectiveCoinData || {
            id: ticker.toLowerCase(),
            symbol: ticker.toLowerCase(),
            name: ticker,
            current_price: dexData?.priceUsd || 0,
            market_cap: dexData?.marketCap || 0,
            total_volume: dexData?.volume24h || 0,
            price_change_percentage_24h: dexData?.priceChange24h || 0,
            high_24h: 0,
            low_24h: 0,
        };

        // Calculate technical indicators (use mock if no historical data)
        const prices = historicalData.prices.length > 0
            ? extractClosingPrices(historicalData)
            : Array.from({ length: 30 }, (_, i) => priceData.current_price * (1 + (Math.random() - 0.5) * 0.1));
        const technicalAnalysis = getTechnicalAnalysis(prices);

        // Analyze DEX sentiment
        const dexSentiment = dexData ? getDexSentiment(dexData) : null;

        // Analyze CMC momentum
        const momentum = cmcData ? analyzeMomentum(cmcData) : null;
        const rankingTier = cmcData ? getRankingTier(cmcData.rank) : null;

        // Determine sector (use getSectorForTicker for expanded list)
        const sector = Object.entries(SECTORS).find(([, tickers]) =>
            tickers.includes(ticker)
        )?.[0] as 'MAJORS' | 'AI' | 'RWA' | 'MEME' | 'DEFI' | 'L2' | 'GAMING' || 'ALTCOIN';

        // Calculate composite confidence score
        const compositeConfidence = calculateCompositeScore({
            rsi: technicalAnalysis.rsi,
            bollingerPosition: technicalAnalysis.bollingerBands.percentB,
            dexBuySellRatio: dexData?.buysSellsRatio || 1,
            momentumScore: momentum?.score || 0,
            rank: cmcData?.rank || 100,
        });

        // Generate prediction with enhanced data
        const predictionInput: PredictionInput = {
            ticker,
            name: priceData.name,
            currentPrice: priceData.current_price,
            volume24h: priceData.total_volume,
            priceChange24h: priceData.price_change_percentage_24h,
            rsi: technicalAnalysis.rsi,
            bollingerPosition: technicalAnalysis.bollingerBands.percentB,
            sector: sector as 'AI' | 'RWA' | 'MEME',
        };

        const prediction = await generateProphecy(predictionInput);

        // Determine enhanced outlook based on multiple signals
        const enhancedOutlook = determineEnhancedOutlook({
            technicalSignal: technicalAnalysis.signal,
            dexSentiment: dexSentiment?.signal,
            momentumTrend: momentum?.trend,
            rsi: technicalAnalysis.rsi,
        });

        // Get token image URL - prioritize DexScreener image, then fallback to our logos
        const dexImage = dexData?.imageUrl || addressLookupResult?.imageUrl || null;
        const tokenImageUrl = getBestTokenImage(ticker, dexImage);

        // Calculate 6-month market cap prediction based on momentum and signals
        const currentMarketCap = priceData.market_cap || dexData?.marketCap || 0;
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
            ticker,
            name: dexData?.tokenName || priceData.name,
            image: tokenImageUrl,
            address: addressLookupResult?.address || null,
            chain: dexData?.chain || addressLookupResult?.chain || null,
            price: priceData.current_price,
            volume_24h: priceData.total_volume,
            price_change_24h: priceData.price_change_percentage_24h,
            market_cap: currentMarketCap,

            // 6-Month Prediction
            prediction_6m: {
                market_cap_low: sixMonthPrediction.lowEstimate,
                market_cap_mid: sixMonthPrediction.midEstimate,
                market_cap_high: sixMonthPrediction.highEstimate,
                growth_percent: sixMonthPrediction.growthPercent,
                confidence: sixMonthPrediction.confidence,
                reasoning: sixMonthPrediction.reasoning,
            },

            // Technical Analysis (from CoinGecko historical data)
            technical: {
                rsi: technicalAnalysis.rsi,
                bollinger_position: technicalAnalysis.bollingerBands.percentB,
                bollinger_upper: technicalAnalysis.bollingerBands.upper,
                bollinger_lower: technicalAnalysis.bollingerBands.lower,
                signal: technicalAnalysis.signal,
            },

            // DexScreener Data
            dex: dexData ? {
                liquidity_usd: dexData.liquidityUsd,
                volume_24h: dexData.volume24h,
                volume_6h: dexData.volume6h,
                volume_1h: dexData.volume1h,
                buys_24h: dexData.buys24h,
                sells_24h: dexData.sells24h,
                buys_sells_ratio: dexData.buysSellsRatio,
                sentiment: dexSentiment?.signal,
                sentiment_strength: dexSentiment?.strength,
                top_pairs_count: dexData.topPairsCount,
                dex_id: dexData.dexId,
            } : null,

            // CoinMarketCap Data
            cmc: cmcData ? {
                rank: cmcData.rank,
                ranking_tier: rankingTier?.tier,
                ranking_description: rankingTier?.description,
                percent_change_1h: cmcData.percentChange1h,
                percent_change_7d: cmcData.percentChange7d,
                percent_change_30d: cmcData.percentChange30d,
                volume_change_24h: cmcData.volumeChange24h,
                market_cap_dominance: cmcData.marketCapDominance,
                fdv: cmcData.fullyDilutedMarketCap,
                circulating_supply: cmcData.circulatingSupply,
                total_supply: cmcData.totalSupply,
                max_supply: cmcData.maxSupply,
                num_market_pairs: cmcData.numMarketPairs,
                momentum: momentum ? {
                    trend: momentum.trend,
                    score: momentum.score,
                    description: momentum.description,
                } : null,
                tags: cmcData.tags,
                is_ai_token: cmcData.isAIToken,
                is_rwa_token: cmcData.isRWAToken,
                is_meme_token: cmcData.isMemeToken,
            } : null,

            // Enhanced Prediction
            prediction: {
                outlook: enhancedOutlook.outlook,
                prophecy: prediction.prophecy,
                target_cap: prediction.target_cap,
                confidence: compositeConfidence,
                signals_bullish: enhancedOutlook.bullishSignals,
                signals_bearish: enhancedOutlook.bearishSignals,
            },

            sector,
            data_sources: ['coingecko', 'dexscreener', 'coinmarketcap'],
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Oracle API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate prophecy. The quantum timeline is unstable.' },
            { status: 500 }
        );
    }
}

// Calculate composite confidence score from multiple data sources
function calculateCompositeScore(params: {
    rsi: number;
    bollingerPosition: number;
    dexBuySellRatio: number;
    momentumScore: number;
    rank: number;
}): number {
    const { rsi, bollingerPosition, dexBuySellRatio, momentumScore, rank } = params;

    // RSI score (higher confidence at extremes)
    const rsiScore = rsi < 30 || rsi > 70 ? 85 : 60;

    // Bollinger score
    const bbScore = bollingerPosition < 0.2 || bollingerPosition > 0.8 ? 80 : 55;

    // DEX sentiment score
    const dexScore = Math.min(100, Math.max(40, 50 + (dexBuySellRatio - 1) * 30));

    // Momentum score
    const momentumConfidence = Math.min(100, Math.max(40, 50 + momentumScore * 2));

    // Rank bonus (higher ranked = more reliable data)
    const rankBonus = rank <= 50 ? 10 : rank <= 100 ? 5 : 0;

    // Weighted average
    const baseScore = (rsiScore * 0.25) + (bbScore * 0.2) + (dexScore * 0.3) + (momentumConfidence * 0.25);

    return Math.round(Math.min(99, baseScore + rankBonus));
}

// Determine outlook from multiple signals
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

    // Technical signal
    if (params.technicalSignal === 'OVERSOLD') {
        bullishSignals.push('RSI oversold - accumulation zone');
    } else if (params.technicalSignal === 'OVERBOUGHT') {
        bearishSignals.push('RSI overbought - distribution zone');
    }

    // DEX sentiment
    if (params.dexSentiment === 'ACCUMULATING') {
        bullishSignals.push('DEX showing accumulation (high buy/sell ratio)');
    } else if (params.dexSentiment === 'DISTRIBUTING') {
        bearishSignals.push('DEX showing distribution (high sell pressure)');
    }

    // Momentum
    if (params.momentumTrend === 'STRONG_UP' || params.momentumTrend === 'UP') {
        bullishSignals.push(`Multi-timeframe momentum: ${params.momentumTrend}`);
    } else if (params.momentumTrend === 'STRONG_DOWN' || params.momentumTrend === 'DOWN') {
        bearishSignals.push(`Multi-timeframe momentum: ${params.momentumTrend}`);
    }

    // RSI directional bias
    if (params.rsi < 40) {
        bullishSignals.push('RSI indicates potential reversal zone');
    } else if (params.rsi > 60) {
        bearishSignals.push('RSI indicates extended conditions');
    }

    const outlook = bullishSignals.length >= bearishSignals.length ? 'Bullish' : 'Bearish';

    return { outlook, bullishSignals, bearishSignals };
}

// Calculate 6-month market cap prediction
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

    // Base growth rate based on historical crypto cycles
    let baseGrowthRate = 0.15; // 15% baseline for 6 months

    // Adjust based on momentum score (-50 to +50 typical range)
    const momentumFactor = 1 + (momentum / 100);

    // RSI adjustment (30-70 neutral, <30 bullish potential, >70 bearish risk)
    let rsiFactor = 1;
    if (rsi < 30) rsiFactor = 1.3;  // Oversold = higher upside potential
    else if (rsi > 70) rsiFactor = 0.7;  // Overbought = lower upside

    // DEX sentiment adjustment
    const sentimentFactor = 1 + ((dexSentiment - 50) / 200);

    // Recent performance projection
    const recentPerformanceFactor = 1 + (priceChange30d / 200);

    // Calculate combined growth multiplier
    const growthMultiplier = baseGrowthRate * momentumFactor * rsiFactor * sentimentFactor * recentPerformanceFactor;

    // Determine prediction ranges
    const midGrowth = isBullish ? Math.max(0.1, growthMultiplier * 1.5) : Math.max(-0.2, growthMultiplier * 0.5);
    const lowGrowth = midGrowth * 0.5;
    const highGrowth = midGrowth * 2.5;

    const lowEstimate = currentMarketCap * (1 + lowGrowth);
    const midEstimate = currentMarketCap * (1 + midGrowth);
    const highEstimate = currentMarketCap * (1 + highGrowth);

    // Calculate confidence based on data quality
    const confidence = Math.min(85, 50 + Math.abs(momentum) / 2 + (dexSentiment / 4));

    // Generate reasoning
    let reasoning = '';
    if (isBullish) {
        if (midGrowth > 0.5) {
            reasoning = 'Strong bullish indicators suggest significant upside potential. Multiple signals confirm accumulation phase.';
        } else if (midGrowth > 0.2) {
            reasoning = 'Moderate bullish outlook with healthy momentum. Market conditions favor gradual appreciation.';
        } else {
            reasoning = 'Cautiously bullish. Some positive signals but limited near-term catalysts.';
        }
    } else {
        if (midGrowth < -0.1) {
            reasoning = 'Bearish pressure detected. Consider waiting for better entry points.';
        } else {
            reasoning = 'Neutral to slightly bearish. Consolidation phase expected before next major move.';
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
