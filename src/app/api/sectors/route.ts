// Sectors API Endpoint - Returns aggregated data for the Volume Heatmap

import { NextResponse } from 'next/server';
import { getAllSectorsData, fetchHistoricalData, COIN_IDS, SECTORS } from '@/lib/coingecko';
import { getTechnicalAnalysis, extractClosingPrices, getSectorSentiment } from '@/lib/technical-analysis';

export async function GET() {
    try {
        // Fetch all sector data
        const sectorsData = await getAllSectorsData();

        // Calculate technical indicators for each sector
        const processedSectors = await Promise.all(
            Object.entries(sectorsData).map(async ([key, data]) => {
                const indicators = await Promise.all(
                    data.coins.map(async (coin) => {
                        const historicalData = await fetchHistoricalData(coin.id, 14);
                        const prices = extractClosingPrices(historicalData);
                        return getTechnicalAnalysis(prices);
                    })
                );

                const sentiment = getSectorSentiment(indicators);
                const avgRSI = indicators.reduce((sum, i) => sum + i.rsi, 0) / indicators.length;

                return {
                    sector: data.sector,
                    totalVolume: data.totalVolume,
                    avgChange: data.avgChange,
                    avgRSI,
                    sentiment,
                    coins: data.coins.map((coin, index) => ({
                        symbol: coin.symbol.toUpperCase(),
                        name: coin.name,
                        price: coin.current_price,
                        volume: coin.total_volume,
                        change24h: coin.price_change_percentage_24h,
                        rsi: indicators[index]?.rsi || 50,
                    })),
                };
            })
        );

        // Calculate relative sizes for heatmap (based on volume)
        const totalVolume = processedSectors.reduce((sum, s) => sum + s.totalVolume, 0);
        const sectorsWithSize = processedSectors.map((sector) => ({
            ...sector,
            relativeSize: (sector.totalVolume / totalVolume) * 100,
        }));

        // Overall market sentiment
        const bullishCount = sectorsWithSize.filter((s) => s.sentiment === 'BULLISH').length;
        const overallSentiment = bullishCount >= 2 ? 'BULLISH' : bullishCount === 0 ? 'BEARISH' : 'MIXED';

        return NextResponse.json({
            sectors: {
                ai: sectorsWithSize.find((s) => s.sector === 'AI'),
                rwa: sectorsWithSize.find((s) => s.sector === 'RWA'),
                meme: sectorsWithSize.find((s) => s.sector === 'MEME'),
            },
            totalVolume,
            overallSentiment,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Sectors API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sector data' },
            { status: 500 }
        );
    }
}
