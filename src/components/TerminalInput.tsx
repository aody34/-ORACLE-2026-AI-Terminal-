'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Expanded ticker list with categories
const TICKER_CATEGORIES = {
    MAJORS: ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA'],
    AI: ['FET', 'TAO', 'RENDER', 'OCEAN', 'AGIX', 'WLD'],
    RWA: ['ONDO', 'MKR', 'AAVE', 'COMP'],
    MEME: ['PEPE', 'SHIB', 'DOGE', 'BONK', 'WIF', 'FLOKI'],
    DEFI: ['UNI', 'LINK', 'CRV', 'LDO', 'GMX'],
    L2: ['ARB', 'OP', 'IMX', 'STRK'],
    GAMING: ['AXS', 'SAND', 'GALA', 'BEAM'],
};

// Flatten for autocomplete
const ALL_TICKERS = Object.values(TICKER_CATEGORIES).flat();

// Quick access tickers (shown as buttons)
const QUICK_TICKERS = ['BTC', 'ETH', 'SOL', 'PEPE', 'FET', 'ONDO', 'ARB', 'DOGE'];

const SCANNING_MESSAGES = [
    'Initializing quantum timeline access...',
    'Synchronizing with 2026 market data...',
    'Analyzing cross-dimensional price vectors...',
    'Consulting the oracle...',
    'Decrypting future market signals...',
    'Calibrating prophecy algorithms...',
    'Aggregating CEX & DEX data...',
    'Computing RSI across timelines...',
];

interface TerminalInputProps {
    onSearch: (ticker: string) => void;
    isScanning: boolean;
}

export function TerminalInput({ onSearch, isScanning }: TerminalInputProps) {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [scanMessage, setScanMessage] = useState('');
    const [messageIndex, setMessageIndex] = useState(0);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle scanning animation messages
    useEffect(() => {
        if (isScanning) {
            const interval = setInterval(() => {
                setMessageIndex((prev) => (prev + 1) % SCANNING_MESSAGES.length);
            }, 1500);
            return () => clearInterval(interval);
        }
    }, [isScanning]);

    useEffect(() => {
        setScanMessage(SCANNING_MESSAGES[messageIndex]);
    }, [messageIndex]);

    // Filter suggestions
    useEffect(() => {
        if (input.length > 0) {
            const filtered = ALL_TICKERS.filter((t) =>
                t.toLowerCase().includes(input.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 8));
        } else {
            setSuggestions([]);
        }
    }, [input]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isScanning) {
            onSearch(input.trim().toUpperCase());
            setActiveCategory(null);
        }
    };

    const handleSuggestionClick = (ticker: string) => {
        setInput(ticker);
        setSuggestions([]);
        onSearch(ticker);
    };

    const handleCategoryClick = (category: string) => {
        setActiveCategory(activeCategory === category ? null : category);
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* Terminal Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-3"
            >
                <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="terminal-text text-white/40 ml-2">
                    oracle_terminal_v3.0.0 — 70+ tokens supported (BTC, ETH, memes, DeFi, L2)
                </span>
            </motion.div>

            {/* Input Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
            >
                <form onSubmit={handleSubmit}>
                    <div className="relative">
                        {/* Prompt Symbol */}
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-mono text-xl">
                            $
                        </span>

                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value.toUpperCase())}
                            placeholder="ENTER ANY TICKER (BTC, ETH, PEPE, SHIB, FET...)"
                            disabled={isScanning}
                            className="oracle-input pl-10 pr-32 uppercase"
                        />

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={isScanning || !input.trim()}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 rounded-lg font-semibold text-sm transition-all ${isScanning
                                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                    : 'bg-emerald-500 text-black hover:bg-emerald-400'
                                }`}
                        >
                            {isScanning ? 'SCANNING...' : 'DIVINE'}
                        </motion.button>
                    </div>
                </form>

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                    {suggestions.length > 0 && !isScanning && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 glass-heavy overflow-hidden z-20"
                        >
                            {suggestions.map((ticker, i) => (
                                <motion.button
                                    key={ticker}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    onClick={() => handleSuggestionClick(ticker)}
                                    className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center justify-between transition-colors"
                                >
                                    <span className="font-mono text-white">${ticker}</span>
                                    <span className="text-xs text-white/40">
                                        {getSectorForTicker(ticker)}
                                    </span>
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Scanning Animation */}
            <AnimatePresence>
                {isScanning && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6"
                    >
                        <div className="glass p-6 relative overflow-hidden">
                            {/* Scanning line */}
                            <div className="absolute inset-0">
                                <motion.div
                                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                                    animate={{ top: ['0%', '100%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-4">
                                <motion.div
                                    className="w-4 h-4 rounded-full bg-emerald-400"
                                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                                <div>
                                    <p className="terminal-text text-emerald-400">
                                        ACCESSING 2026 QUANTUM TIMELINES...
                                    </p>
                                    <motion.p
                                        key={scanMessage}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="terminal-text text-white/50 text-sm mt-1"
                                    >
                                        {scanMessage}
                                    </motion.p>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 3, ease: 'linear' }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Buttons */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center gap-2 mt-6"
            >
                {Object.keys(TICKER_CATEGORIES).map((category) => (
                    <motion.button
                        key={category}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCategoryClick(category)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeCategory === category
                                ? 'bg-emerald-500 text-black'
                                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                            }`}
                    >
                        {category}
                    </motion.button>
                ))}
            </motion.div>

            {/* Category Tickers */}
            <AnimatePresence>
                {activeCategory && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                    >
                        <div className="flex flex-wrap justify-center gap-2">
                            {TICKER_CATEGORIES[activeCategory as keyof typeof TICKER_CATEGORIES].map((ticker) => (
                                <motion.button
                                    key={ticker}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setInput(ticker);
                                        inputRef.current?.focus();
                                    }}
                                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-all"
                                >
                                    ${ticker}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Access Tickers */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-2 mt-4"
            >
                <span className="text-xs text-white/30 mr-2">Quick:</span>
                {QUICK_TICKERS.map((ticker) => (
                    <motion.button
                        key={ticker}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setInput(ticker);
                            inputRef.current?.focus();
                        }}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs font-mono text-white/50 hover:text-white transition-all"
                    >
                        ${ticker}
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
}

function getSectorForTicker(ticker: string): string {
    const sectors: Record<string, string> = {
        // Majors
        BTC: 'MAJOR', ETH: 'MAJOR', SOL: 'MAJOR', BNB: 'MAJOR', XRP: 'MAJOR', ADA: 'MAJOR',
        DOT: 'MAJOR', AVAX: 'MAJOR', MATIC: 'MAJOR', LINK: 'MAJOR', ATOM: 'MAJOR', LTC: 'MAJOR',
        // AI
        FET: 'AI', TAO: 'AI', RENDER: 'AI', OCEAN: 'AI', AGIX: 'AI', WLD: 'AI', ARKM: 'AI', AKT: 'AI',
        // RWA
        ONDO: 'RWA', MKR: 'RWA', AAVE: 'RWA', COMP: 'RWA', PROPC: 'RWA', CFG: 'RWA',
        // Meme
        PEPE: 'MEME', SHIB: 'MEME', DOGE: 'MEME', BONK: 'MEME', WIF: 'MEME', FLOKI: 'MEME',
        BRETT: 'MEME', POPCAT: 'MEME', MOG: 'MEME', NEIRO: 'MEME', TURBO: 'MEME',
        // DeFi
        UNI: 'DEFI', CRV: 'DEFI', SUSHI: 'DEFI', LDO: 'DEFI', GMX: 'DEFI', DYDX: 'DEFI', JUP: 'DEFI',
        // L2
        ARB: 'L2', OP: 'L2', IMX: 'L2', STRK: 'L2', MANTA: 'L2', METIS: 'L2',
        // Gaming
        AXS: 'GAMING', SAND: 'GAMING', MANA: 'GAMING', GALA: 'GAMING', BEAM: 'GAMING', PRIME: 'GAMING',
    };
    return sectors[ticker] || 'ALTCOIN';
}
