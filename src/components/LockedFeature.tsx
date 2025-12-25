'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface LockedFeatureProps {
    title: string;
    description: string;
    unlockThreshold: string;
    previewContent?: React.ReactNode;
}

export function LockedFeature({
    title,
    description,
    unlockThreshold,
    previewContent,
}: LockedFeatureProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative overflow-hidden"
        >
            <div className="glass-heavy p-8">
                {/* Lock Icon */}
                <motion.div
                    className="absolute top-4 right-4 text-4xl"
                    animate={{
                        rotate: isHovered ? [0, -10, 10, 0] : 0,
                    }}
                    transition={{ duration: 0.5 }}
                >
                    🔒
                </motion.div>

                {/* Content */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">💎</span>
                        <h3 className="text-xl font-bold">{title}</h3>
                    </div>
                    <p className="text-white/60 mb-6">{description}</p>

                    {/* Preview (blurred) */}
                    {previewContent && (
                        <div className="relative mb-6">
                            <div className="blur-sm select-none pointer-events-none">
                                {previewContent}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
                        </div>
                    )}

                    {/* Unlock Badge */}
                    <motion.div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
                        animate={{
                            boxShadow: isHovered
                                ? '0 0 30px rgba(245, 158, 11, 0.3)'
                                : '0 0 10px rgba(245, 158, 11, 0.1)',
                        }}
                    >
                        <span className="text-amber-400">🔓</span>
                        <span className="text-sm font-medium text-amber-300">
                            Unlocks when $ORACLE hits {unlockThreshold}
                        </span>
                    </motion.div>
                </div>

                {/* Background Animation */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent"
                    animate={{
                        opacity: isHovered ? 0.2 : 0.05,
                    }}
                />

                {/* Scanning Line */}
                <motion.div
                    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
                    animate={{
                        top: ['0%', '100%'],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            </div>
        </motion.div>
    );
}

// Example preview content for RWA institutional flow
export function RWAFlowPreview() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-white/40">BlackRock Inflow</p>
                <p className="text-xl font-bold text-emerald-400">+$847M</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-white/40">Goldman Outflow</p>
                <p className="text-xl font-bold text-red-400">-$234M</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-white/40">Fidelity Net</p>
                <p className="text-xl font-bold text-emerald-400">+$512M</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-white/40">JP Morgan</p>
                <p className="text-xl font-bold text-emerald-400">+$1.2B</p>
            </div>
        </div>
    );
}
