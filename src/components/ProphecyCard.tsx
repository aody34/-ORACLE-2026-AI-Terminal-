'use client';

import { motion } from 'framer-motion';

interface DexData {
    liquidity_usd: number;
    volume_24h: number;
    buys_24h: number;
    sells_24h: number;
    buys_sells_ratio: number;
    sentiment: string;
    sentiment_strength: number;
    top_pairs_count: number;
}

interface CMCData {
    rank: number;
    ranking_tier: string;
    ranking_description: string;
    percent_change_1h: number;
    percent_change_7d: number;
    percent_change_30d: number;
    momentum: {
        trend: string;
        score: number;
        description: string;
    } | null;
    fdv: number;
    num_market_pairs: number;
}

interface PredictionData {
    ticker: string;
    name: string;
    price: number;
    volume_24h: number;
    price_change_24h: number;
    market_cap: number;
    technical: {
        rsi: number;
        bollinger_position: number;
        signal: string;
    };
    dex?: DexData | null;
    cmc?: CMCData | null;
    prediction: {
        outlook: 'Bullish' | 'Bearish';
        prophecy: string;
        target_cap: string;
        confidence: number;
        signals_bullish?: string[];
        signals_bearish?: string[];
    };
    sector: string;
    image?: string;
    address?: string | null;
    chain?: string | null;
    prediction_6m?: {
        market_cap_low: number;
        market_cap_mid: number;
        market_cap_high: number;
        growth_percent: number;
        confidence: number;
        reasoning: string;
    };
    data_sources?: string[];
}

interface ProphecyCardProps {
    data: PredictionData;
    onClose: () => void;
}

function formatNumber(num: number): string {
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
    if (num < 0.01) return `$${num.toFixed(8)}`;
    return `$${num.toFixed(2)}`;
}

function formatPrice(price: number): string {
    if (price >= 1000) return `$${price.toFixed(0)}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(8)}`;
}

export function ProphecyCard({ data, onClose }: ProphecyCardProps) {
    const isBullish = data.prediction.outlook === 'Bullish';
    const sectorEmojis: Record<string, string> = {
        AI: '🤖',
        RWA: '🏛️',
        MEME: '🐸',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="prophecy-card w-full max-w-3xl mx-auto"
        >
            <div
                className={`glass-heavy relative overflow-hidden ${isBullish ? 'glow-emerald' : 'glow-crimson'
                    }`}
            >
                {/* Background Gradient */}
                <div
                    className={`absolute inset-0 opacity-10 ${isBullish
                        ? 'bg-gradient-to-br from-emerald-500 to-transparent'
                        : 'bg-gradient-to-br from-red-500 to-transparent'
                        }`}
                />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                >
                    <span className="text-white/60">×</span>
                </button>

                <div className="relative p-8">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6">
                        {/* Token Image or Sector Emoji */}
                        <div
                            className={`relative w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center ${isBullish ? 'bg-emerald-500/20' : 'bg-red-500/20'
                                }`}
                        >
                            {data.image ? (
                                <img
                                    src={data.image}
                                    alt={data.ticker}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-4xl">{sectorEmojis[data.sector] || '🔮'}</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-3xl font-bold">${data.ticker}</h2>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-bold ${isBullish
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-red-500/20 text-red-400'
                                        }`}
                                >
                                    {data.prediction.outlook.toUpperCase()}
                                </span>
                                {data.cmc?.rank && (
                                    <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-bold">
                                        #{data.cmc.rank}
                                    </span>
                                )}
                            </div>
                            <p className="text-white/50 text-sm mt-1">{data.name}</p>
                            <p className="text-xs text-white/30 terminal-text mt-1">
                                SECTOR: {data.sector} | CONFIDENCE: {data.prediction.confidence}%
                                {data.data_sources && ` | SOURCES: ${data.data_sources.length}`}
                            </p>
                        </div>
                    </div>

                    {/* Price Display */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/5 rounded-xl p-4">
                            <p className="text-xs text-white/40 mb-1">CURRENT PRICE</p>
                            <p className="text-2xl font-bold font-mono">
                                {formatPrice(data.price)}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <p className="text-xs text-white/40 mb-1">24H CHANGE</p>
                            <p
                                className={`text-2xl font-bold font-mono ${data.price_change_24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}
                            >
                                {data.price_change_24h >= 0 ? '+' : ''}
                                {data.price_change_24h.toFixed(2)}%
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <p className="text-xs text-white/40 mb-1">24H VOLUME</p>
                            <p className="text-2xl font-bold font-mono">
                                {formatNumber(data.volume_24h)}
                            </p>
                        </div>
                    </div>

                    {/* Multi-Timeframe Changes (from CMC) */}
                    {data.cmc && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="grid grid-cols-4 gap-2 mb-6"
                        >
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                                <p className="text-xs text-white/40">1H</p>
                                <p className={`font-bold font-mono ${data.cmc.percent_change_1h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {data.cmc.percent_change_1h >= 0 ? '+' : ''}{data.cmc.percent_change_1h.toFixed(1)}%
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                                <p className="text-xs text-white/40">24H</p>
                                <p className={`font-bold font-mono ${data.price_change_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {data.price_change_24h >= 0 ? '+' : ''}{data.price_change_24h.toFixed(1)}%
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                                <p className="text-xs text-white/40">7D</p>
                                <p className={`font-bold font-mono ${data.cmc.percent_change_7d >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {data.cmc.percent_change_7d >= 0 ? '+' : ''}{data.cmc.percent_change_7d.toFixed(1)}%
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                                <p className="text-xs text-white/40">30D</p>
                                <p className={`font-bold font-mono ${data.cmc.percent_change_30d >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {data.cmc.percent_change_30d >= 0 ? '+' : ''}{data.cmc.percent_change_30d.toFixed(1)}%
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* 6-Month Market Cap Prediction */}
                    {data.prediction_6m && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12 }}
                            className={`mb-6 p-4 rounded-xl border ${isBullish
                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                    : 'bg-red-500/5 border-red-500/20'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">🔮</span>
                                <span className="terminal-text text-sm text-white">6-MONTH MARKET CAP PREDICTION</span>
                                <span className={`ml-auto px-2 py-0.5 rounded text-xs font-bold ${data.prediction_6m.growth_percent >= 0
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {data.prediction_6m.growth_percent >= 0 ? '+' : ''}{data.prediction_6m.growth_percent}% GROWTH
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-3">
                                <div className="text-center">
                                    <p className="text-xs text-white/40 mb-1">CONSERVATIVE</p>
                                    <p className="font-bold font-mono text-yellow-400">
                                        {formatNumber(data.prediction_6m.market_cap_low)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-white/40 mb-1">EXPECTED</p>
                                    <p className={`font-bold font-mono text-xl ${isBullish ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatNumber(data.prediction_6m.market_cap_mid)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-white/40 mb-1">OPTIMISTIC</p>
                                    <p className="font-bold font-mono text-cyan-400">
                                        {formatNumber(data.prediction_6m.market_cap_high)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-white/50">
                                <span>Confidence: {data.prediction_6m.confidence}%</span>
                                <span className="text-white/20">|</span>
                                <span>{data.prediction_6m.reasoning}</span>
                            </div>
                        </motion.div>
                    )}

                    {/* DEX Data Section */}
                    {data.dex && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="mb-6 p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/20"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">📊</span>
                                <span className="terminal-text text-sm text-cyan-400">DEXSCREENER DATA</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-white/40">LIQUIDITY</p>
                                    <p className="font-bold font-mono text-cyan-400">
                                        {formatNumber(data.dex.liquidity_usd)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-white/40">BUYS / SELLS (24H)</p>
                                    <p className="font-bold font-mono">
                                        <span className="text-emerald-400">{data.dex.buys_24h.toLocaleString()}</span>
                                        <span className="text-white/30"> / </span>
                                        <span className="text-red-400">{data.dex.sells_24h.toLocaleString()}</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-white/40">DEX SENTIMENT</p>
                                    <p className={`font-bold ${data.dex.sentiment === 'ACCUMULATING' ? 'text-emerald-400' :
                                        data.dex.sentiment === 'DISTRIBUTING' ? 'text-red-400' : 'text-white/60'
                                        }`}>
                                        {data.dex.sentiment || 'NEUTRAL'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* RSI Gauge */}
                    <div className="mb-6">
                        <div className="flex justify-between text-xs text-white/40 mb-2">
                            <span>OVERSOLD (30)</span>
                            <span>RSI ({data.technical.rsi.toFixed(0)})</span>
                            <span>OVERBOUGHT (70)</span>
                        </div>
                        <div className="rsi-gauge">
                            <motion.div
                                className="rsi-marker"
                                initial={{ left: '50%' }}
                                animate={{ left: `${Math.min(Math.max(data.technical.rsi, 0), 100)}%` }}
                                transition={{ type: 'spring', damping: 15 }}
                            />
                        </div>
                        <p className="text-center text-xs text-white/30 mt-2">
                            Technical Signal: {data.technical.signal}
                        </p>
                    </div>

                    {/* CMC Momentum */}
                    {data.cmc?.momentum && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-6 p-4 bg-amber-500/5 rounded-xl border border-amber-500/20"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">📈</span>
                                    <span className="terminal-text text-sm text-amber-400">MOMENTUM</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${data.cmc.momentum.trend.includes('UP') ? 'bg-emerald-500/20 text-emerald-400' :
                                    data.cmc.momentum.trend.includes('DOWN') ? 'bg-red-500/20 text-red-400' :
                                        'bg-white/10 text-white/60'
                                    }`}>
                                    {data.cmc.momentum.trend}
                                </span>
                            </div>
                            <p className="text-sm text-white/60 mt-2">{data.cmc.momentum.description}</p>
                        </motion.div>
                    )}

                    {/* Bullish/Bearish Signals */}
                    {(data.prediction.signals_bullish?.length || data.prediction.signals_bearish?.length) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="grid grid-cols-2 gap-4 mb-6"
                        >
                            {data.prediction.signals_bullish && data.prediction.signals_bullish.length > 0 && (
                                <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20">
                                    <p className="text-xs text-emerald-400 font-bold mb-2">🟢 BULLISH SIGNALS</p>
                                    <ul className="text-xs text-white/60 space-y-1">
                                        {data.prediction.signals_bullish.map((signal, i) => (
                                            <li key={i}>• {signal}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {data.prediction.signals_bearish && data.prediction.signals_bearish.length > 0 && (
                                <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                                    <p className="text-xs text-red-400 font-bold mb-2">🔴 BEARISH SIGNALS</p>
                                    <ul className="text-xs text-white/60 space-y-1">
                                        {data.prediction.signals_bearish.map((signal, i) => (
                                            <li key={i}>• {signal}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Prophecy */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className={`p-6 rounded-xl border ${isBullish
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : 'bg-red-500/5 border-red-500/20'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">🔮</span>
                            <span className="terminal-text text-sm text-white/60">
                                THE ORACLE SPEAKS:
                            </span>
                        </div>
                        <p className="text-lg leading-relaxed italic text-white/80">
                            &quot;{data.prediction.prophecy}&quot;
                        </p>
                    </motion.div>

                    {/* Target Cap Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex justify-center mt-6"
                    >
                        <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10">
                            <span className="text-white/50">2026 Target Cap:</span>
                            <span
                                className={`text-xl font-bold ${isBullish ? 'gradient-text' : 'gradient-text-crimson'
                                    }`}
                            >
                                {data.prediction.target_cap}
                            </span>
                        </div>
                    </motion.div>

                    {/* Data Sources & Timestamp */}
                    <div className="flex justify-between items-center mt-6 text-xs text-white/20 terminal-text">
                        <span>
                            DATA: {data.data_sources?.map(s => s.toUpperCase()).join(' + ') || 'COINGECKO'}
                        </span>
                        <span>
                            {new Date().toISOString()}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
