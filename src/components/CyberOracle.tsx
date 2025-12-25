'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CyberOracleProps {
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    isActive?: boolean;
}

export function CyberOracle({ sentiment, isActive = false }: CyberOracleProps) {
    const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });

    // Subtle eye movement
    useEffect(() => {
        const interval = setInterval(() => {
            setEyePosition({
                x: (Math.random() - 0.5) * 4,
                y: (Math.random() - 0.5) * 4,
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const getMaskColor = () => {
        switch (sentiment) {
            case 'BULLISH':
                return {
                    primary: '#10B981',
                    glow: 'rgba(16, 185, 129, 0.5)',
                    gradient: 'from-emerald-500 to-cyan-500',
                };
            case 'BEARISH':
                return {
                    primary: '#EF4444',
                    glow: 'rgba(239, 68, 68, 0.5)',
                    gradient: 'from-red-500 to-orange-500',
                };
            default:
                return {
                    primary: '#8B5CF6',
                    glow: 'rgba(139, 92, 246, 0.5)',
                    gradient: 'from-purple-500 to-pink-500',
                };
        }
    };

    const colors = getMaskColor();
    const isHappy = sentiment === 'BULLISH';

    return (
        <motion.div
            className="relative w-48 h-48"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
                opacity: 1,
                scale: 1,
                y: isActive ? [0, -10, 0] : 0,
            }}
            transition={{
                duration: 0.5,
                y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }}
        >
            {/* Outer Glow */}
            <motion.div
                className="absolute inset-0 rounded-full blur-3xl"
                style={{ backgroundColor: colors.glow }}
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Main Mask */}
            <motion.div
                className="relative w-full h-full"
                style={{
                    filter: `drop-shadow(0 0 30px ${colors.glow})`,
                }}
            >
                {/* Mask Base */}
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    <defs>
                        {/* Metallic Gradient */}
                        <linearGradient id="maskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1a1a2e" />
                            <stop offset="50%" stopColor="#0f0f1a" />
                            <stop offset="100%" stopColor="#1a1a2e" />
                        </linearGradient>

                        {/* Eye Glow */}
                        <filter id="eyeGlow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        {/* Circuit Pattern */}
                        <pattern id="circuit" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path
                                d="M0 20h15M25 20h15M20 0v15M20 25v15"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="0.5"
                                fill="none"
                            />
                            <circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.03)" />
                        </pattern>
                    </defs>

                    {/* Mask Shape */}
                    <motion.ellipse
                        cx="100"
                        cy="100"
                        rx="85"
                        ry="90"
                        fill="url(#maskGradient)"
                        stroke={colors.primary}
                        strokeWidth="2"
                        animate={{
                            strokeOpacity: [0.5, 1, 0.5],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />

                    {/* Circuit Overlay */}
                    <ellipse
                        cx="100"
                        cy="100"
                        rx="85"
                        ry="90"
                        fill="url(#circuit)"
                    />

                    {/* Forehead Lines */}
                    <path
                        d="M40 70 Q60 55 100 55 Q140 55 160 70"
                        stroke={colors.primary}
                        strokeWidth="1"
                        fill="none"
                        opacity="0.5"
                    />
                    <path
                        d="M50 60 Q75 48 100 48 Q125 48 150 60"
                        stroke={colors.primary}
                        strokeWidth="0.5"
                        fill="none"
                        opacity="0.3"
                    />

                    {/* Left Eye */}
                    <motion.g transform={`translate(${eyePosition.x}, ${eyePosition.y})`}>
                        <ellipse
                            cx="65"
                            cy="95"
                            rx="20"
                            ry="12"
                            fill="#000"
                            stroke={colors.primary}
                            strokeWidth="2"
                        />
                        <motion.ellipse
                            cx="65"
                            cy="95"
                            rx="8"
                            ry="8"
                            fill={colors.primary}
                            filter="url(#eyeGlow)"
                            animate={{
                                opacity: [0.8, 1, 0.8],
                                scale: isActive ? [1, 1.2, 1] : 1,
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </motion.g>

                    {/* Right Eye */}
                    <motion.g transform={`translate(${eyePosition.x}, ${eyePosition.y})`}>
                        <ellipse
                            cx="135"
                            cy="95"
                            rx="20"
                            ry="12"
                            fill="#000"
                            stroke={colors.primary}
                            strokeWidth="2"
                        />
                        <motion.ellipse
                            cx="135"
                            cy="95"
                            rx="8"
                            ry="8"
                            fill={colors.primary}
                            filter="url(#eyeGlow)"
                            animate={{
                                opacity: [0.8, 1, 0.8],
                                scale: isActive ? [1, 1.2, 1] : 1,
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </motion.g>

                    {/* Nose Bridge */}
                    <path
                        d="M100 90 L100 115"
                        stroke={colors.primary}
                        strokeWidth="1"
                        opacity="0.3"
                    />

                    {/* Mouth */}
                    <motion.path
                        d={
                            isHappy
                                ? 'M70 140 Q100 160 130 140' // Smile
                                : sentiment === 'BEARISH'
                                    ? 'M70 150 Q100 135 130 150' // Frown
                                    : 'M70 145 L130 145' // Neutral
                        }
                        stroke={colors.primary}
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        animate={{
                            pathLength: [0, 1],
                            opacity: [0.5, 1],
                        }}
                        transition={{ duration: 1, delay: 0.5 }}
                    />

                    {/* Cheek Lines */}
                    <path
                        d="M35 110 Q25 120 30 135"
                        stroke={colors.primary}
                        strokeWidth="1"
                        fill="none"
                        opacity="0.3"
                    />
                    <path
                        d="M165 110 Q175 120 170 135"
                        stroke={colors.primary}
                        strokeWidth="1"
                        fill="none"
                        opacity="0.3"
                    />

                    {/* Status Indicator */}
                    <motion.circle
                        cx="100"
                        cy="175"
                        r="4"
                        fill={colors.primary}
                        animate={{
                            opacity: [0.3, 1, 0.3],
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                </svg>
            </motion.div>

            {/* Status Text */}
            <motion.div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <span
                    className={`text-xs terminal-text bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}
                >
                    {sentiment === 'BULLISH' && '✧ MARKET FAVORS THE BOLD ✧'}
                    {sentiment === 'BEARISH' && '⚠ CAUTION ADVISED ⚠'}
                    {sentiment === 'NEUTRAL' && '◈ AWAITING SIGNALS ◈'}
                </span>
            </motion.div>
        </motion.div>
    );
}
