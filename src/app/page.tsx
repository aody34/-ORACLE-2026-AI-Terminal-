'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VolumeHeatmap } from '@/components/VolumeHeatmap';
import { TerminalInput } from '@/components/TerminalInput';
import { ProphecyCard } from '@/components/ProphecyCard';
import { CyberOracle } from '@/components/CyberOracle';
import { LockedFeature, RWAFlowPreview } from '@/components/LockedFeature';

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
  prediction: {
    outlook: 'Bullish' | 'Bearish';
    prophecy: string;
    target_cap: string;
    confidence: number;
  };
  sector: string;
}

export default function Home() {
  const [sectors, setSectors] = useState<{
    ai?: SectorData;
    rwa?: SectorData;
    meme?: SectorData;
  }>({});
  const [isLoadingSectors, setIsLoadingSectors] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [overallSentiment, setOverallSentiment] = useState<'BULLISH' | 'BEARISH' | 'NEUTRAL'>('NEUTRAL');

  // Fetch sector data on mount
  useEffect(() => {
    async function fetchSectors() {
      try {
        const response = await fetch('/api/sectors');
        const data = await response.json();
        setSectors(data.sectors);
        setOverallSentiment(data.overallSentiment || 'NEUTRAL');
      } catch (err) {
        console.error('Failed to fetch sectors:', err);
      } finally {
        setIsLoadingSectors(false);
      }
    }
    fetchSectors();
  }, []);

  // Handle ticker search
  const handleSearch = useCallback(async (ticker: string) => {
    setIsScanning(true);
    setError(null);
    setPrediction(null);

    try {
      // Simulate minimum scanning time for effect
      const [response] = await Promise.all([
        fetch(`/api/oracle?ticker=${ticker}`),
        new Promise((resolve) => setTimeout(resolve, 3000)), // Min 3 seconds
      ]);

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to generate prophecy');
      } else {
        setPrediction(data);
        // Update overall sentiment based on prediction
        setOverallSentiment(data.prediction.outlook === 'Bullish' ? 'BULLISH' : 'BEARISH');
      }
    } catch (err) {
      setError('Network error. The quantum timeline is unstable.');
      console.error('Search error:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="flex justify-center mb-6">
              <CyberOracle sentiment={overallSentiment} isActive={isScanning} />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="gradient-text">$ORACLE</span>
              <span className="text-white/80"> 2026</span>
            </h1>

            <p className="text-xl text-white/50 max-w-2xl mx-auto terminal-text">
              THE QUANTUM PROPHECY TERMINAL
            </p>
            <p className="text-sm text-white/30 mt-2">
              AI-Powered Predictions for the Next Bull Run
            </p>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-8 mt-8 flex-wrap"
            >
              <div className="text-center">
                <p className="text-2xl font-bold gradient-text">7</p>
                <p className="text-xs text-white/40">COINS TRACKED</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold gradient-text">3</p>
                <p className="text-xs text-white/40">SECTORS</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold gradient-text">24/7</p>
                <p className="text-xs text-white/40">LIVE DATA</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold gradient-text">∞</p>
                <p className="text-xs text-white/40">PROPHECIES</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Volume Heatmap */}
          <VolumeHeatmap sectors={sectors} isLoading={isLoadingSectors} />
        </div>
      </section>

      {/* Terminal Section */}
      <section className="py-20 px-4" id="terminal">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-2">CONSULT THE ORACLE</h2>
            <p className="text-white/40">
              Enter any supported ticker to receive your 2026 prophecy
            </p>
          </motion.div>

          <TerminalInput onSearch={handleSearch} isScanning={isScanning} />

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center"
              >
                <p className="text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prediction Result */}
          <AnimatePresence mode="wait">
            {prediction && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-12"
              >
                <ProphecyCard
                  data={prediction}
                  onClose={() => setPrediction(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-20 px-4" id="premium">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-2">
              <span className="gradient-text">PREMIUM</span> FEATURES
            </h2>
            <p className="text-white/40">
              Exclusive tools unlocked at key milestones
            </p>
          </motion.div>

          <LockedFeature
            title="Institutional RWA Flow Tracker"
            description="Real-time tracking of BlackRock, Goldman Sachs, Fidelity, and JP Morgan positions in tokenized real-world assets. Know where the smart money is flowing before everyone else."
            unlockThreshold="10K Market Cap"
            previewContent={<RWAFlowPreview />}
          />
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">THE 2026 TRINITY</h2>
            <p className="text-lg text-white/60 mb-8 leading-relaxed">
              The next bull run will be defined by three interconnected forces:
              {' '}<span className="text-purple-400 font-semibold">AI Agents</span> transforming how we interact with DeFi,
              {' '}<span className="text-amber-400 font-semibold">Real World Assets</span> bridging TradFi with blockchain,
              and <span className="text-cyan-400 font-semibold">Memecoins</span> driving retail adoption and culture.
            </p>
            <p className="text-white/40 terminal-text">
              $ORACLE gives you the edge to navigate all three.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/30 text-sm mb-4">
            $ORACLE 2026 — The Future is Computable
          </p>
          <div className="flex justify-center gap-6 text-white/20 text-xs">
            <span>AI AGENTS</span>
            <span>•</span>
            <span>RWA</span>
            <span>•</span>
            <span>MEMES</span>
          </div>
          <p className="text-white/10 text-xs mt-6">
            Disclaimer: This is not financial advice. Predictions are for entertainment purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
