'use client';

import { motion } from 'framer-motion';

interface SectorData {
    sector: string;
    totalVolume: number;
    avgChange: number;
    sentiment: string;
    relativeSize: number;
    coins: {
        symbol: string;
        name: string;
        price: number;
        volume: number;
        change24h: number;
    }[];
}

interface VolumeHeatmapProps {
    sectors: {
        ai?: SectorData;
        rwa?: SectorData;
        meme?: SectorData;
    };
    isLoading?: boolean;
}

function formatVolume(volume: number): string {
    if (volume >= 1_000_000_000) return `$${(volume / 1_000_000_000).toFixed(1)}B`;
    if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(0)}M`;
    return `$${(volume / 1_000).toFixed(0)}K`;
}

function SectorBox({
    sector,
    data,
    delay,
}: {
    sector: 'AI' | 'RWA' | 'MEME';
    data?: SectorData;
    delay: number;
}) {
    const sectorConfig = {
        AI: {
            icon: '🤖',
            gradient: 'from-purple-600 to-violet-800',
            glowColor: 'rgba(139, 92, 246, 0.4)',
            label: 'AI AGENTS',
        },
        RWA: {
            icon: '🏛️',
            gradient: 'from-amber-500 to-orange-700',
            glowColor: 'rgba(245, 158, 11, 0.4)',
            label: 'REAL WORLD ASSETS',
        },
        MEME: {
            icon: '🐸',
            gradient: 'from-cyan-500 to-teal-700',
            glowColor: 'rgba(6, 182, 212, 0.4)',
            label: 'MEMECOINS',
        },
    };

    const config = sectorConfig[sector];
    const isBullish = data?.sentiment === 'BULLISH';
    const size = data?.relativeSize || 33;

    // Scale between 250px and 400px based on relative size
    const boxSize = Math.max(250, Math.min(400, 250 + (size / 100) * 150));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ scale: 1.05, y: -10 }}
            className="sector-box glass cursor-pointer"
            style={{
                width: boxSize,
                height: boxSize,
                boxShadow: `0 0 60px ${config.glowColor}, inset 0 0 30px ${config.glowColor}`,
            }}
        >
            <div className="relative h-full p-6 flex flex-col">
                {/* Scanning line effect */}
                <div className="scanning-line" />

                {/* Header */}
                <div className="flex items-center justify-between">
                    <span className="text-4xl">{config.icon}</span>
                    <motion.div
                        className={`px-3 py-1 rounded-full text-xs font-bold ${isBullish
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {isBullish ? '● BULLISH' : '● BEARISH'}
                    </motion.div>
                </div>

                {/* Sector Label */}
                <div className="mt-4">
                    <h3 className={`text-2xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                        {config.label}
                    </h3>
                    <p className="text-sm text-white/40 mt-1 terminal-text">
                        SECTOR_ID: {sector.toLowerCase()}_2026
                    </p>
                </div>

                {/* Volume Display */}
                <div className="mt-auto">
                    <p className="text-xs text-white/50 mb-1">24H VOLUME</p>
                    <p className="text-3xl font-bold font-mono tracking-tight">
                        {data ? formatVolume(data.totalVolume) : '---'}
                    </p>

                    {/* Change Indicator */}
                    <div className={`flex items-center gap-2 mt-2 ${(data?.avgChange || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                        <span className="text-lg">
                            {(data?.avgChange || 0) >= 0 ? '↑' : '↓'}
                        </span>
                        <span className="font-mono text-sm">
                            {data ? `${Math.abs(data.avgChange).toFixed(2)}%` : '0.00%'}
                        </span>
                    </div>
                </div>

                {/* Coin Pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {data?.coins?.map((coin, i) => (
                        <motion.span
                            key={coin.symbol}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: delay + 0.1 * i }}
                            className="px-2 py-1 bg-white/5 rounded text-xs font-mono text-white/60"
                        >
                            ${coin.symbol}
                        </motion.span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

export function VolumeHeatmap({ sectors, isLoading }: VolumeHeatmapProps) {
    if (isLoading) {
        return (
            <div className="flex flex-wrap justify-center gap-8">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="w-[300px] h-[300px] rounded-2xl skeleton"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h2 className="text-3xl font-bold gradient-text mb-2">
                    2026 GLOBAL VOLUME HEATMAP
                </h2>
                <p className="text-white/40 terminal-text">
                    LIVE_FEED :: SECTOR_ANALYSIS_V2.6
                </p>
            </motion.div>

            {/* Heatmap Grid */}
            <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
                <SectorBox sector="AI" data={sectors.ai} delay={0.2} />
                <SectorBox sector="RWA" data={sectors.rwa} delay={0.4} />
                <SectorBox sector="MEME" data={sectors.meme} delay={0.6} />
            </div>

            {/* Legend */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex justify-center gap-8 mt-8 text-xs text-white/40"
            >
                <span>📊 Box size = Relative 24h volume</span>
                <span>🟢 Bullish = Accumulation</span>
                <span>🔴 Bearish = Overheated</span>
            </motion.div>
        </div>
    );
}
