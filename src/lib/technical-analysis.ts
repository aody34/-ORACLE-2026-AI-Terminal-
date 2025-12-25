// Technical Analysis Module for $ORACLE 2026 Terminal
// Calculates RSI (14) and Bollinger Bands for market analysis

import { RSI, BollingerBands } from 'technicalindicators';

export interface TechnicalIndicators {
    rsi: number;
    bollingerBands: {
        upper: number;
        middle: number;
        lower: number;
        percentB: number; // Position within bands (0 = at lower, 1 = at upper)
    };
    signal: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL';
}

// Calculate RSI (Relative Strength Index) with period 14
export function calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) {
        return 50; // Neutral RSI if insufficient data
    }

    const rsiValues = RSI.calculate({
        values: prices,
        period: period,
    });

    return rsiValues[rsiValues.length - 1] || 50;
}

// Calculate Bollinger Bands (20-period, 2 std deviations)
export function calculateBollingerBands(
    prices: number[],
    period: number = 20,
    stdDev: number = 2
): { upper: number; middle: number; lower: number; percentB: number } {
    if (prices.length < period) {
        const lastPrice = prices[prices.length - 1] || 100;
        return {
            upper: lastPrice * 1.1,
            middle: lastPrice,
            lower: lastPrice * 0.9,
            percentB: 0.5,
        };
    }

    const bbValues = BollingerBands.calculate({
        values: prices,
        period: period,
        stdDev: stdDev,
    });

    const lastBB = bbValues[bbValues.length - 1];
    const currentPrice = prices[prices.length - 1];

    if (!lastBB) {
        return {
            upper: currentPrice * 1.1,
            middle: currentPrice,
            lower: currentPrice * 0.9,
            percentB: 0.5,
        };
    }

    // Calculate %B (position within bands)
    const percentB = (currentPrice - lastBB.lower) / (lastBB.upper - lastBB.lower);

    return {
        upper: lastBB.upper,
        middle: lastBB.middle,
        lower: lastBB.lower,
        percentB: Math.max(0, Math.min(1, percentB)),
    };
}

// Get comprehensive technical analysis for a price series
export function getTechnicalAnalysis(prices: number[]): TechnicalIndicators {
    const rsi = calculateRSI(prices);
    const bollingerBands = calculateBollingerBands(prices);

    // Determine signal based on RSI and Bollinger position
    let signal: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL' = 'NEUTRAL';

    if (rsi > 70 || bollingerBands.percentB > 0.95) {
        signal = 'OVERBOUGHT';
    } else if (rsi < 30 || bollingerBands.percentB < 0.05) {
        signal = 'OVERSOLD';
    }

    return {
        rsi,
        bollingerBands,
        signal,
    };
}

// Determine sector sentiment based on multiple coins
export function getSectorSentiment(
    indicators: TechnicalIndicators[]
): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    if (indicators.length === 0) return 'NEUTRAL';

    const avgRSI = indicators.reduce((sum, i) => sum + i.rsi, 0) / indicators.length;
    const oversoldCount = indicators.filter(i => i.signal === 'OVERSOLD').length;
    const overboughtCount = indicators.filter(i => i.signal === 'OVERBOUGHT').length;

    // Oversold = accumulation phase = bullish
    if (avgRSI < 40 || oversoldCount > indicators.length / 2) {
        return 'BULLISH';
    }

    // Overbought = distribution phase = bearish
    if (avgRSI > 60 || overboughtCount > indicators.length / 2) {
        return 'BEARISH';
    }

    return 'NEUTRAL';
}

// Extract closing prices from historical data
export function extractClosingPrices(historicalData: { prices: [number, number][] }): number[] {
    return historicalData.prices.map(([, price]) => price);
}

// Format RSI for display
export function formatRSI(rsi: number): string {
    if (rsi >= 70) return `${rsi.toFixed(1)} (Overbought)`;
    if (rsi <= 30) return `${rsi.toFixed(1)} (Oversold)`;
    return `${rsi.toFixed(1)} (Neutral)`;
}

// Get RSI color class
export function getRSIColor(rsi: number): string {
    if (rsi >= 70) return 'text-red-500';
    if (rsi <= 30) return 'text-emerald-500';
    return 'text-yellow-500';
}
