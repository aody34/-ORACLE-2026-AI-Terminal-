// CoinMarketCap API Service for $ORACLE 2026 Terminal
// Fetches comprehensive market data, rankings, and global metrics

const CMC_BASE_URL = 'https://pro-api.coinmarketcap.com/v1';
const CMC_API_KEY = process.env.CMC_API_KEY || '';

// CoinMarketCap IDs for tracked tokens - EXPANDED LIST
export const CMC_IDS: Record<string, number> = {
    // === MAJORS ===
    BTC: 1,        // Bitcoin
    ETH: 1027,    // Ethereum
    BNB: 1839,    // Binance Coin
    XRP: 52,      // Ripple
    ADA: 2010,    // Cardano
    SOL: 5426,    // Solana
    DOGE: 74,     // Dogecoin
    DOT: 6636,    // Polkadot
    AVAX: 5805,   // Avalanche
    MATIC: 3890,  // Polygon
    LINK: 1975,   // Chainlink
    ATOM: 3794,   // Cosmos
    LTC: 2,       // Litecoin
    UNI: 7083,    // Uniswap
    TRX: 1958,    // Tron

    // === AI SECTOR ===
    FET: 3773,      // Fetch.ai
    TAO: 22974,     // Bittensor
    RENDER: 5690,   // Render
    OCEAN: 3911,    // Ocean Protocol
    AGIX: 2424,     // SingularityNET
    NMR: 1732,      // Numeraire
    AKT: 7431,      // Akash Network
    ARKM: 27565,    // Arkham
    WLD: 13502,     // Worldcoin

    // === RWA SECTOR ===
    ONDO: 21159,    // Ondo Finance
    PROPC: 23656,   // PropChain
    MKR: 1518,      // Maker
    AAVE: 7278,     // Aave
    COMP: 5692,     // Compound
    SNX: 2586,      // Synthetix
    POLYX: 16951,   // Polymesh
    CFG: 6748,      // Centrifuge
    MPL: 13648,     // Maple

    // === MEME SECTOR ===
    PEPE: 24478,    // Pepe
    SHIB: 5994,     // Shiba Inu
    FLOKI: 10804,   // Floki
    BONK: 23095,    // Bonk
    WIF: 28752,     // dogwifhat
    MEME: 28301,    // Memecoin
    TURBO: 24911,   // Turbo
    BRETT: 29743,   // Brett
    POPCAT: 28782,  // Popcat
    MOG: 27659,     // Mog Coin
    NEIRO: 32441,   // Neiro
    WOJAK: 24613,   // Wojak
    LADYS: 25023,   // Milady Meme Coin

    // === DEFI ===
    CRV: 6538,      // Curve DAO
    SUSHI: 6758,    // SushiSwap
    CAKE: 7186,     // PancakeSwap
    '1INCH': 8104,  // 1inch
    LDO: 8000,      // Lido DAO
    RPL: 2943,      // Rocket Pool
    GMX: 11857,     // GMX
    DYDX: 11156,    // dYdX
    JUP: 29210,     // Jupiter
    RAY: 8526,      // Raydium

    // === LAYER 2 ===
    ARB: 11841,     // Arbitrum
    OP: 11840,      // Optimism
    IMX: 10603,     // Immutable X
    STRK: 22691,    // Starknet
    MANTA: 13631,   // Manta Network
    METIS: 9640,    // Metis
    ZK: 24091,      // zkSync

    // === GAMING ===
    AXS: 6783,      // Axie Infinity
    SAND: 6210,     // The Sandbox
    MANA: 1966,     // Decentraland
    GALA: 7080,     // Gala
    ENJ: 2130,      // Enjin Coin
    BEAM: 28298,    // Beam
    PRIME: 23711,   // Echelon Prime
    PIXEL: 29335,   // Pixels
    RONIN: 14101,   // Ronin
};

export interface CMCQuote {
    price: number;
    volume_24h: number;
    volume_change_24h: number;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    percent_change_30d: number;
    market_cap: number;
    market_cap_dominance: number;
    fully_diluted_market_cap: number;
    last_updated: string;
}

export interface CMCData {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    cmc_rank: number;
    num_market_pairs: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number | null;
    infinite_supply: boolean;
    date_added: string;
    tags: string[];
    platform: {
        id: number;
        name: string;
        symbol: string;
    } | null;
    quote: {
        USD: CMCQuote;
    };
}

export interface CMCMetrics {
    ticker: string;
    name: string;
    rank: number;
    price: number;
    volume24h: number;
    volumeChange24h: number;
    percentChange1h: number;
    percentChange24h: number;
    percentChange7d: number;
    percentChange30d: number;
    marketCap: number;
    marketCapDominance: number;
    fullyDilutedMarketCap: number;
    circulatingSupply: number;
    totalSupply: number;
    maxSupply: number | null;
    numMarketPairs: number;
    tags: string[];
    isAIToken: boolean;
    isRWAToken: boolean;
    isMemeToken: boolean;
}

// Fetch data from CoinMarketCap
export async function fetchCMCData(ticker: string): Promise<CMCMetrics | null> {
    const cmcId = CMC_IDS[ticker.toUpperCase()];

    if (!cmcId) {
        return getMockCMCData(ticker);
    }

    // If no API key, use mock data
    if (!CMC_API_KEY) {
        console.log('CMC: No API key, using mock data');
        return getMockCMCData(ticker);
    }

    try {
        const response = await fetch(
            `${CMC_BASE_URL}/cryptocurrency/quotes/latest?id=${cmcId}`,
            {
                headers: {
                    'X-CMC_PRO_API_KEY': CMC_API_KEY,
                    'Accept': 'application/json',
                },
                next: { revalidate: 60 },
            }
        );

        if (!response.ok) {
            throw new Error(`CMC API error: ${response.status}`);
        }

        const result = await response.json();
        const data: CMCData = result.data[cmcId];

        if (!data) {
            return getMockCMCData(ticker);
        }

        const quote = data.quote.USD;
        const tags = data.tags || [];

        return {
            ticker: data.symbol,
            name: data.name,
            rank: data.cmc_rank,
            price: quote.price,
            volume24h: quote.volume_24h,
            volumeChange24h: quote.volume_change_24h,
            percentChange1h: quote.percent_change_1h,
            percentChange24h: quote.percent_change_24h,
            percentChange7d: quote.percent_change_7d,
            percentChange30d: quote.percent_change_30d,
            marketCap: quote.market_cap,
            marketCapDominance: quote.market_cap_dominance,
            fullyDilutedMarketCap: quote.fully_diluted_market_cap,
            circulatingSupply: data.circulating_supply,
            totalSupply: data.total_supply,
            maxSupply: data.max_supply,
            numMarketPairs: data.num_market_pairs,
            tags,
            isAIToken: tags.some(t => t.toLowerCase().includes('ai') || t.toLowerCase().includes('artificial-intelligence')),
            isRWAToken: tags.some(t => t.toLowerCase().includes('rwa') || t.toLowerCase().includes('real-world-assets')),
            isMemeToken: tags.some(t => t.toLowerCase().includes('meme')),
        };
    } catch (error) {
        console.error('CMC API error:', error);
        return getMockCMCData(ticker);
    }
}

// Fetch global market metrics
export async function fetchGlobalMetrics(): Promise<{
    totalMarketCap: number;
    totalVolume24h: number;
    btcDominance: number;
    ethDominance: number;
    altcoinMarketCap: number;
    defiMarketCap: number;
    stablecoinVolume: number;
} | null> {
    if (!CMC_API_KEY) {
        return {
            totalMarketCap: 2800000000000,
            totalVolume24h: 95000000000,
            btcDominance: 52.3,
            ethDominance: 17.8,
            altcoinMarketCap: 840000000000,
            defiMarketCap: 85000000000,
            stablecoinVolume: 45000000000,
        };
    }

    try {
        const response = await fetch(
            `${CMC_BASE_URL}/global-metrics/quotes/latest`,
            {
                headers: {
                    'X-CMC_PRO_API_KEY': CMC_API_KEY,
                    'Accept': 'application/json',
                },
                next: { revalidate: 300 },
            }
        );

        if (!response.ok) {
            throw new Error(`CMC Global Metrics error: ${response.status}`);
        }

        const result = await response.json();
        const data = result.data;

        return {
            totalMarketCap: data.quote.USD.total_market_cap,
            totalVolume24h: data.quote.USD.total_volume_24h,
            btcDominance: data.btc_dominance,
            ethDominance: data.eth_dominance,
            altcoinMarketCap: data.quote.USD.altcoin_market_cap,
            defiMarketCap: data.quote.USD.defi_market_cap,
            stablecoinVolume: data.quote.USD.stablecoin_volume_24h,
        };
    } catch (error) {
        console.error('CMC Global Metrics error:', error);
        return null;
    }
}

// Analyze momentum based on multi-timeframe changes
export function analyzeMomentum(metrics: CMCMetrics): {
    trend: 'STRONG_UP' | 'UP' | 'NEUTRAL' | 'DOWN' | 'STRONG_DOWN';
    score: number;
    description: string;
} {
    const { percentChange1h, percentChange24h, percentChange7d, percentChange30d } = metrics;

    // Weight recent changes more heavily
    const weightedScore =
        (percentChange1h * 0.1) +
        (percentChange24h * 0.3) +
        (percentChange7d * 0.35) +
        (percentChange30d * 0.25);

    // Count positive timeframes
    const positiveCount = [
        percentChange1h > 0,
        percentChange24h > 0,
        percentChange7d > 0,
        percentChange30d > 0,
    ].filter(Boolean).length;

    let trend: 'STRONG_UP' | 'UP' | 'NEUTRAL' | 'DOWN' | 'STRONG_DOWN';
    let description: string;

    if (weightedScore > 15 && positiveCount >= 3) {
        trend = 'STRONG_UP';
        description = 'Explosive momentum across all timeframes. Caution advised at these levels.';
    } else if (weightedScore > 5 && positiveCount >= 2) {
        trend = 'UP';
        description = 'Positive momentum building. Smart money accumulating.';
    } else if (weightedScore < -15 && positiveCount <= 1) {
        trend = 'STRONG_DOWN';
        description = 'Heavy selling pressure. Potential capitulation zone.';
    } else if (weightedScore < -5 && positiveCount <= 2) {
        trend = 'DOWN';
        description = 'Bearish pressure mounting. Watch for reversal signals.';
    } else {
        trend = 'NEUTRAL';
        description = 'Consolidation phase. Awaiting breakout direction.';
    }

    return {
        trend,
        score: Math.round(weightedScore * 10) / 10,
        description,
    };
}

// Get ranking tier
export function getRankingTier(rank: number): {
    tier: 'MEGA_CAP' | 'LARGE_CAP' | 'MID_CAP' | 'SMALL_CAP' | 'MICRO_CAP';
    description: string;
} {
    if (rank <= 10) {
        return { tier: 'MEGA_CAP', description: 'Top 10 - Elite institutional grade' };
    } else if (rank <= 50) {
        return { tier: 'LARGE_CAP', description: 'Top 50 - Proven market leaders' };
    } else if (rank <= 100) {
        return { tier: 'MID_CAP', description: 'Top 100 - Established projects' };
    } else if (rank <= 300) {
        return { tier: 'SMALL_CAP', description: 'Top 300 - Growth potential' };
    } else {
        return { tier: 'MICRO_CAP', description: 'Micro-cap - High risk/reward' };
    }
}

// Mock data for development
function getMockCMCData(ticker: string): CMCMetrics {
    const mockData: Record<string, Partial<CMCMetrics>> = {
        FET: {
            name: 'Fetch.ai',
            rank: 45,
            price: 2.45,
            volume24h: 450000000,
            volumeChange24h: 12.5,
            percentChange1h: 1.2,
            percentChange24h: 8.5,
            percentChange7d: 22.4,
            percentChange30d: 45.2,
            marketCap: 2100000000,
            marketCapDominance: 0.075,
            fullyDilutedMarketCap: 2800000000,
            circulatingSupply: 857000000,
            totalSupply: 1152997575,
            maxSupply: 1152997575,
            numMarketPairs: 156,
            tags: ['ai', 'artificial-intelligence', 'smart-contracts', 'platform'],
            isAIToken: true,
        },
        TAO: {
            name: 'Bittensor',
            rank: 28,
            price: 485.20,
            volume24h: 89000000,
            volumeChange24h: 8.3,
            percentChange1h: 0.8,
            percentChange24h: 5.2,
            percentChange7d: 15.6,
            percentChange30d: 38.9,
            marketCap: 3200000000,
            marketCapDominance: 0.114,
            fullyDilutedMarketCap: 10200000000,
            circulatingSupply: 6600000,
            totalSupply: 21000000,
            maxSupply: 21000000,
            numMarketPairs: 45,
            tags: ['ai', 'machine-learning', 'decentralized-ai'],
            isAIToken: true,
        },
        ONDO: {
            name: 'Ondo Finance',
            rank: 52,
            price: 1.85,
            volume24h: 180000000,
            volumeChange24h: 25.4,
            percentChange1h: 2.1,
            percentChange24h: 12.4,
            percentChange7d: 28.7,
            percentChange30d: 65.2,
            marketCap: 2800000000,
            marketCapDominance: 0.1,
            fullyDilutedMarketCap: 18500000000,
            circulatingSupply: 1500000000,
            totalSupply: 10000000000,
            maxSupply: 10000000000,
            numMarketPairs: 78,
            tags: ['rwa', 'real-world-assets', 'defi', 'treasury'],
            isRWAToken: true,
        },
        PEPE: {
            name: 'Pepe',
            rank: 18,
            price: 0.0000234,
            volume24h: 2100000000,
            volumeChange24h: 45.6,
            percentChange1h: 3.5,
            percentChange24h: 15.7,
            percentChange7d: 42.1,
            percentChange30d: 89.5,
            marketCap: 9800000000,
            marketCapDominance: 0.35,
            fullyDilutedMarketCap: 9800000000,
            circulatingSupply: 420690000000000,
            totalSupply: 420690000000000,
            maxSupply: 420690000000000,
            numMarketPairs: 324,
            tags: ['meme', 'ethereum', 'community'],
            isMemeToken: true,
        },
        SOL: {
            name: 'Solana',
            rank: 5,
            price: 198.50,
            volume24h: 4500000000,
            volumeChange24h: 15.2,
            percentChange1h: 0.5,
            percentChange24h: 4.2,
            percentChange7d: 12.8,
            percentChange30d: 35.6,
            marketCap: 92000000000,
            marketCapDominance: 3.28,
            fullyDilutedMarketCap: 116000000000,
            circulatingSupply: 463000000,
            totalSupply: 584000000,
            maxSupply: null,
            numMarketPairs: 892,
            tags: ['smart-contracts', 'layer-1', 'defi', 'nft'],
            isMemeToken: false,
        },
        BTC: {
            name: 'Bitcoin',
            rank: 1,
            price: 98500,
            volume24h: 48000000000,
            volumeChange24h: 12.5,
            percentChange1h: 0.3,
            percentChange24h: 2.4,
            percentChange7d: 8.5,
            percentChange30d: 25.2,
            marketCap: 1940000000000,
            marketCapDominance: 52.3,
            fullyDilutedMarketCap: 2070000000000,
            circulatingSupply: 19600000,
            totalSupply: 21000000,
            maxSupply: 21000000,
            numMarketPairs: 11245,
            tags: ['store-of-value', 'pow', 'bitcoin-ecosystem'],
            isMemeToken: false,
        },
        ETH: {
            name: 'Ethereum',
            rank: 2,
            price: 3450,
            volume24h: 18000000000,
            volumeChange24h: 15.8,
            percentChange1h: 0.5,
            percentChange24h: 3.1,
            percentChange7d: 12.4,
            percentChange30d: 28.6,
            marketCap: 415000000000,
            marketCapDominance: 17.8,
            fullyDilutedMarketCap: 415000000000,
            circulatingSupply: 120000000,
            totalSupply: 120000000,
            maxSupply: null,
            numMarketPairs: 8234,
            tags: ['smart-contracts', 'layer-1', 'defi', 'nft', 'pos'],
            isMemeToken: false,
        },
        DOGE: {
            name: 'Dogecoin',
            rank: 8,
            price: 0.42,
            volume24h: 3200000000,
            volumeChange24h: 35.4,
            percentChange1h: 1.8,
            percentChange24h: 8.2,
            percentChange7d: 28.5,
            percentChange30d: 65.8,
            marketCap: 62000000000,
            marketCapDominance: 2.21,
            fullyDilutedMarketCap: 62000000000,
            circulatingSupply: 147000000000,
            totalSupply: 147000000000,
            maxSupply: null,
            numMarketPairs: 892,
            tags: ['meme', 'pow', 'payments'],
            isMemeToken: true,
        },
        SHIB: {
            name: 'Shiba Inu',
            rank: 12,
            price: 0.0000245,
            volume24h: 890000000,
            volumeChange24h: 22.5,
            percentChange1h: 2.1,
            percentChange24h: 6.8,
            percentChange7d: 18.5,
            percentChange30d: 42.3,
            marketCap: 14500000000,
            marketCapDominance: 0.52,
            fullyDilutedMarketCap: 14500000000,
            circulatingSupply: 589000000000000,
            totalSupply: 589000000000000,
            maxSupply: null,
            numMarketPairs: 456,
            tags: ['meme', 'ethereum', 'dog'],
            isMemeToken: true,
        },
        BONK: {
            name: 'Bonk',
            rank: 58,
            price: 0.0000345,
            volume24h: 580000000,
            volumeChange24h: 45.2,
            percentChange1h: 3.5,
            percentChange24h: 12.4,
            percentChange7d: 35.8,
            percentChange30d: 85.2,
            marketCap: 2400000000,
            marketCapDominance: 0.086,
            fullyDilutedMarketCap: 3400000000,
            circulatingSupply: 69000000000000,
            totalSupply: 100000000000000,
            maxSupply: 100000000000000,
            numMarketPairs: 124,
            tags: ['meme', 'solana', 'dog'],
            isMemeToken: true,
        },
        WIF: {
            name: 'dogwifhat',
            rank: 32,
            price: 2.85,
            volume24h: 890000000,
            volumeChange24h: 52.8,
            percentChange1h: 4.2,
            percentChange24h: 18.5,
            percentChange7d: 45.2,
            percentChange30d: 125.8,
            marketCap: 2850000000,
            marketCapDominance: 0.102,
            fullyDilutedMarketCap: 2850000000,
            circulatingSupply: 998000000,
            totalSupply: 998000000,
            maxSupply: 998000000,
            numMarketPairs: 85,
            tags: ['meme', 'solana', 'dog'],
            isMemeToken: true,
        },
        ARB: {
            name: 'Arbitrum',
            rank: 42,
            price: 1.25,
            volume24h: 680000000,
            volumeChange24h: 18.5,
            percentChange1h: 0.8,
            percentChange24h: 5.6,
            percentChange7d: 15.2,
            percentChange30d: 32.5,
            marketCap: 4800000000,
            marketCapDominance: 0.171,
            fullyDilutedMarketCap: 12500000000,
            circulatingSupply: 3840000000,
            totalSupply: 10000000000,
            maxSupply: 10000000000,
            numMarketPairs: 312,
            tags: ['layer-2', 'ethereum', 'scaling', 'rollup'],
            isMemeToken: false,
        },
        LINK: {
            name: 'Chainlink',
            rank: 14,
            price: 24.50,
            volume24h: 1200000000,
            volumeChange24h: 22.4,
            percentChange1h: 1.2,
            percentChange24h: 7.8,
            percentChange7d: 18.5,
            percentChange30d: 42.5,
            marketCap: 15200000000,
            marketCapDominance: 0.54,
            fullyDilutedMarketCap: 24500000000,
            circulatingSupply: 620000000,
            totalSupply: 1000000000,
            maxSupply: 1000000000,
            numMarketPairs: 1245,
            tags: ['oracle', 'defi', 'web3'],
            isMemeToken: false,
        },
        UNI: {
            name: 'Uniswap',
            rank: 22,
            price: 14.85,
            volume24h: 580000000,
            volumeChange24h: 18.2,
            percentChange1h: 0.9,
            percentChange24h: 6.4,
            percentChange7d: 16.8,
            percentChange30d: 38.5,
            marketCap: 8900000000,
            marketCapDominance: 0.32,
            fullyDilutedMarketCap: 14850000000,
            circulatingSupply: 600000000,
            totalSupply: 1000000000,
            maxSupply: 1000000000,
            numMarketPairs: 856,
            tags: ['dex', 'defi', 'ethereum', 'amm'],
            isMemeToken: false,
        },
    };

    const base = mockData[ticker.toUpperCase()] || mockData.FET;

    return {
        ticker: ticker.toUpperCase(),
        name: base.name || ticker,
        rank: base.rank || 100,
        price: base.price || 1,
        volume24h: base.volume24h || 10000000,
        volumeChange24h: base.volumeChange24h || 0,
        percentChange1h: base.percentChange1h || 0,
        percentChange24h: base.percentChange24h || 0,
        percentChange7d: base.percentChange7d || 0,
        percentChange30d: base.percentChange30d || 0,
        marketCap: base.marketCap || 100000000,
        marketCapDominance: base.marketCapDominance || 0.01,
        fullyDilutedMarketCap: base.fullyDilutedMarketCap || 150000000,
        circulatingSupply: base.circulatingSupply || 100000000,
        totalSupply: base.totalSupply || 100000000,
        maxSupply: base.maxSupply || null,
        numMarketPairs: base.numMarketPairs || 20,
        tags: base.tags || [],
        isAIToken: base.isAIToken || false,
        isRWAToken: base.isRWAToken || false,
        isMemeToken: base.isMemeToken || false,
    };
}
