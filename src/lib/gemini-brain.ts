// Gemini AI Brain for $ORACLE 2026 Terminal
// Uses Gemini to generate market predictions and sarcastic prophecies

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export interface PredictionInput {
    ticker: string;
    name: string;
    currentPrice: number;
    volume24h: number;
    priceChange24h: number;
    rsi: number;
    bollingerPosition: number;
    sector: 'AI' | 'RWA' | 'MEME';
}

export interface OraclePrediction {
    ticker: string;
    price: number;
    outlook: 'Bullish' | 'Bearish';
    prophecy: string;
    target_cap: string;
    confidence: number;
    sector: string;
}

// Generate prophecy using Gemini AI
export async function generateProphecy(input: PredictionInput): Promise<OraclePrediction> {
    // If no API key, use algorithmic prediction
    if (!GEMINI_API_KEY) {
        return generateAlgorithmicPrediction(input);
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `You are the $ORACLE 2026 - a sarcastic, all-knowing crypto oracle from the future.
    
Analyze this cryptocurrency data and provide a prediction:
- Ticker: ${input.ticker}
- Name: ${input.name}
- Current Price: $${input.currentPrice}
- 24h Volume: $${formatVolume(input.volume24h)}
- 24h Change: ${input.priceChange24h.toFixed(2)}%
- RSI (14): ${input.rsi.toFixed(1)}
- Bollinger Position: ${(input.bollingerPosition * 100).toFixed(0)}%
- Sector: ${input.sector}

Based on the data:
1. RSI above 70 = Overbought (Bearish), below 30 = Oversold (Bullish)
2. Bollinger above 90% = Overbought, below 10% = Oversold
3. Consider the sector trends for 2026 (AI agents, RWA tokenization, and meme culture)

Respond with ONLY a JSON object (no markdown, no code blocks):
{
  "outlook": "Bullish" or "Bearish",
  "prophecy": "A short, sarcastic 1-2 sentence 2026 prediction (be witty and reference future events)",
  "target_cap": "Estimated market cap target (e.g., '10B+', '50B+', '100B+')",
  "confidence": 0-100 percentage
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                ticker: input.ticker,
                price: input.currentPrice,
                outlook: parsed.outlook || (input.rsi > 50 ? 'Bearish' : 'Bullish'),
                prophecy: parsed.prophecy || getDefaultProphecy(input),
                target_cap: parsed.target_cap || getTargetCap(input),
                confidence: parsed.confidence || 75,
                sector: input.sector,
            };
        }

        return generateAlgorithmicPrediction(input);
    } catch (error) {
        console.error('Gemini API error:', error);
        return generateAlgorithmicPrediction(input);
    }
}

// Algorithmic prediction when Gemini is unavailable
function generateAlgorithmicPrediction(input: PredictionInput): OraclePrediction {
    // Determine outlook based on technical indicators
    const isOversold = input.rsi < 35 || input.bollingerPosition < 0.15;
    const isOverbought = input.rsi > 65 || input.bollingerPosition > 0.85;

    let outlook: 'Bullish' | 'Bearish';
    let confidence: number;

    if (isOversold) {
        outlook = 'Bullish';
        confidence = 70 + Math.random() * 20;
    } else if (isOverbought) {
        outlook = 'Bearish';
        confidence = 60 + Math.random() * 25;
    } else {
        // Neutral zone - use price momentum
        outlook = input.priceChange24h > 0 ? 'Bullish' : 'Bearish';
        confidence = 50 + Math.random() * 30;
    }

    return {
        ticker: input.ticker,
        price: input.currentPrice,
        outlook,
        prophecy: getDefaultProphecy(input),
        target_cap: getTargetCap(input),
        confidence: Math.round(confidence),
        sector: input.sector,
    };
}

// Get sector-specific prophecies
function getDefaultProphecy(input: PredictionInput): string {
    const bullishProphecies: Record<string, string[]> = {
        AI: [
            `${input.ticker} will be running half the world's autonomous agents by Q3 2026. You're early, anon.`,
            `In 2026, ${input.ticker} becomes the backbone of AI-to-AI transactions. Your grandkids will study this chart.`,
            `The AI revolution chose ${input.ticker}. Resistance is futile, accumulation is wise.`,
        ],
        RWA: [
            `${input.ticker} tokenizes BlackRock's entire portfolio by 2026. TradFi never saw it coming.`,
            `When boomers finally understand ${input.ticker}, you'll need a boat for your bags.`,
            `Real world assets meet blockchain. ${input.ticker} is where Wall Street meets the future.`,
        ],
        MEME: [
            `${input.ticker} transcends meme status in 2026. The prophecy was always true.`,
            `Elon tweets about ${input.ticker} exactly 47 times in 2026. Each one adds a zero.`,
            `${input.ticker} becomes legal tender in three countries. You can't make this up.`,
        ],
    };

    const bearishProphecies: Record<string, string[]> = {
        AI: [
            `${input.ticker} needs to cool off. Even AI agents know when to take profits.`,
            `The oracle sees paper hands in 2026. ${input.ticker} will shake out the weak.`,
            `Overheated silicon needs cooling. Patience, young padawan.`,
        ],
        RWA: [
            `${input.ticker} is running hot. The institutions are taking profits while you FOMO.`,
            `When everyone's bullish on RWA, smart money takes a breather. The oracle waits.`,
            `${input.ticker} will revisit lower levels. Dry powder ready.`,
        ],
        MEME: [
            `${input.ticker} is peak euphoria. The oracle has seen this movie before.`,
            `When your Uber driver talks about ${input.ticker}, it's time to touch grass.`,
            `${input.ticker} needs a cooldown arc. Every meme lord knows the pattern.`,
        ],
    };

    const prophecies = input.rsi > 50 ? bearishProphecies : bullishProphecies;
    const sectorProphecies = prophecies[input.sector] || prophecies.AI;
    return sectorProphecies[Math.floor(Math.random() * sectorProphecies.length)];
}

// Estimate target market cap
function getTargetCap(input: PredictionInput): string {
    const currentCap = input.currentPrice * (input.volume24h / input.currentPrice);

    if (input.sector === 'MEME') {
        return currentCap > 50_000_000_000 ? '100B+' : currentCap > 10_000_000_000 ? '50B+' : '10B+';
    }

    if (input.sector === 'AI') {
        return currentCap > 10_000_000_000 ? '50B+' : currentCap > 1_000_000_000 ? '25B+' : '10B+';
    }

    // RWA
    return currentCap > 5_000_000_000 ? '25B+' : currentCap > 500_000_000 ? '10B+' : '5B+';
}

// Analyze entire sector sentiment
export async function analyzeSectorSentiment(
    sectorData: { ticker: string; rsi: number; priceChange24h: number }[]
): Promise<{ sentiment: 'Bullish' | 'Bearish'; summary: string }> {
    const avgRSI = sectorData.reduce((sum, d) => sum + d.rsi, 0) / sectorData.length;
    const avgChange = sectorData.reduce((sum, d) => sum + d.priceChange24h, 0) / sectorData.length;

    const sentiment = avgRSI < 45 || avgChange > 5 ? 'Bullish' : 'Bearish';

    const summary = sentiment === 'Bullish'
        ? `Sector showing accumulation signals. Average RSI: ${avgRSI.toFixed(0)}`
        : `Sector overheated. Average RSI: ${avgRSI.toFixed(0)}. Consider taking profits.`;

    return { sentiment, summary };
}

function formatVolume(volume: number): string {
    if (volume >= 1_000_000_000) return `${(volume / 1_000_000_000).toFixed(2)}B`;
    if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(2)}M`;
    if (volume >= 1_000) return `${(volume / 1_000).toFixed(2)}K`;
    return volume.toFixed(2);
}
