// DexScreener API Service for $ORACLE 2026 Terminal
// Fetches DEX trading data, liquidity, and pair information

const DEXSCREENER_BASE_URL = 'https://api.dexscreener.com/latest';

// Token contract addresses for DexScreener lookups - EXPANDED
export const TOKEN_ADDRESSES: Record<string, { chain: string; address: string }> = {
    // === MAJORS ===
    BTC: { chain: 'ethereum', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' }, // WBTC
    ETH: { chain: 'ethereum', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' }, // WETH
    BNB: { chain: 'bsc', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' }, // WBNB
    SOL: { chain: 'solana', address: 'So11111111111111111111111111111111111111112' },
    AVAX: { chain: 'avalanche', address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' },
    MATIC: { chain: 'polygon', address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' },

    // === AI SECTOR ===
    FET: { chain: 'ethereum', address: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85' },
    TAO: { chain: 'ethereum', address: '0x77E06c9eCCf2E797fd462A92B6D7642EF85b0A44' },
    RENDER: { chain: 'ethereum', address: '0x6De037ef9aD2725EB40118Bb1702EBb27e4Aeb24' },
    OCEAN: { chain: 'ethereum', address: '0x967da4048cD07aB37855c090aAF366e4ce1b9F48' },
    AGIX: { chain: 'ethereum', address: '0x5B7533812759B45C2B44C19e320ba2cD2681b542' },
    WLD: { chain: 'ethereum', address: '0x163f8C2467924be0ae7B5347228CABF260318753' },
    ARKM: { chain: 'ethereum', address: '0x6E2a43be0B1d33b726f0CA3b8de60b3482b8b050' },

    // === RWA SECTOR ===
    ONDO: { chain: 'ethereum', address: '0xfAbA6f8e4a5E8Ab82F62fe7C39859FA577269BE3' },
    MKR: { chain: 'ethereum', address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2' },
    AAVE: { chain: 'ethereum', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9' },
    COMP: { chain: 'ethereum', address: '0xc00e94Cb662C3520282E6f5717214004A7f26888' },
    CFG: { chain: 'ethereum', address: '0xc221b7E65FfC80DE234bbB6667aBDd46593D34F0' },

    // === MEME SECTOR ===
    PEPE: { chain: 'ethereum', address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933' },
    SHIB: { chain: 'ethereum', address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE' },
    FLOKI: { chain: 'ethereum', address: '0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E' },
    BONK: { chain: 'solana', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
    WIF: { chain: 'solana', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm' },
    DOGE: { chain: 'ethereum', address: '0x4206931337dc273a630d328dA6441786BfaD668f' }, // DOGE on ETH
    BRETT: { chain: 'base', address: '0x532f27101965dd16442E59d40670FaF5eBB142E4' },
    POPCAT: { chain: 'solana', address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr' },
    MOG: { chain: 'ethereum', address: '0xaaeE1A9723aaDB7afA2810263653A34bA2C21C7a' },
    NEIRO: { chain: 'ethereum', address: '0x812Ba41e071C7b7fA4EBcFB62dF5F45f6fA853Ee' },
    TURBO: { chain: 'ethereum', address: '0xA35923162C49cF95e6BF26623385eb431ad920D3' },
    WOJAK: { chain: 'ethereum', address: '0x5026F006B85729a8b14553FAE6af249aD16c9aaB' },
    LADYS: { chain: 'ethereum', address: '0x12970E6868f88f6557B76120662c1B3E50A646bf' },

    // === DEFI ===
    UNI: { chain: 'ethereum', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
    CRV: { chain: 'ethereum', address: '0xD533a949740bb3306d119CC777fa900bA034cd52' },
    SUSHI: { chain: 'ethereum', address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2' },
    LDO: { chain: 'ethereum', address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32' },
    GMX: { chain: 'arbitrum', address: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a' },
    DYDX: { chain: 'ethereum', address: '0x92D6C1e31e14520e676a687F0a93788B716BEff5' },
    JUP: { chain: 'solana', address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' },
    RAY: { chain: 'solana', address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' },
    CAKE: { chain: 'bsc', address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82' },

    // === LAYER 2 ===
    ARB: { chain: 'arbitrum', address: '0x912CE59144191C1204E64559FE8253a0e49E6548' },
    OP: { chain: 'optimism', address: '0x4200000000000000000000000000000000000042' },
    IMX: { chain: 'ethereum', address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF' },
    STRK: { chain: 'ethereum', address: '0xCa14007Eff0dB1f8135f4C25B34De49AB0d42766' },
    MANTA: { chain: 'ethereum', address: '0x95CeF13441Be50d20cA4558CC0a27B601aC544E5' },
    METIS: { chain: 'ethereum', address: '0x9E32b13ce7f2E80A01932B42553652E053D6ed8e' },

    // === GAMING ===
    AXS: { chain: 'ethereum', address: '0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b' },
    SAND: { chain: 'ethereum', address: '0x3845badAde8e6dFF049820680d1F14bD3903a5d0' },
    MANA: { chain: 'ethereum', address: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942' },
    GALA: { chain: 'ethereum', address: '0xd1d2Eb1B1e90B638588728b4130137D262C87cae' },
    BEAM: { chain: 'ethereum', address: '0x62D0A8458eD7719FDAF978fe5929C6D342B0bFcE' },
    PRIME: { chain: 'ethereum', address: '0xb23d80f5FefcDDaa212212F028021B41DEd428CF' },

    // === OTHER ===
    LINK: { chain: 'ethereum', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA' },
    ATOM: { chain: 'ethereum', address: '0x8D983cb9388EaC77af0474fA441C4815500Cb7BB' },
};

export interface DexPair {
    chainId: string;
    dexId: string;
    pairAddress: string;
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
    quoteToken: {
        address: string;
        name: string;
        symbol: string;
    };
    priceNative: string;
    priceUsd: string;
    txns: {
        h24: { buys: number; sells: number };
        h6: { buys: number; sells: number };
        h1: { buys: number; sells: number };
        m5: { buys: number; sells: number };
    };
    volume: {
        h24: number;
        h6: number;
        h1: number;
        m5: number;
    };
    priceChange: {
        h24: number;
        h6: number;
        h1: number;
        m5: number;
    };
    liquidity: {
        usd: number;
        base: number;
        quote: number;
    };
    fdv: number;
    marketCap: number;
}

export interface DexScreenerResponse {
    schemaVersion: string;
    pairs: DexPair[];
}

export interface DexMetrics {
    ticker: string;
    priceUsd: number;
    volume24h: number;
    volume6h: number;
    volume1h: number;
    liquidityUsd: number;
    fdv: number;
    marketCap: number;
    priceChange24h: number;
    priceChange6h: number;
    priceChange1h: number;
    buys24h: number;
    sells24h: number;
    buysSellsRatio: number;
    dexId: string;
    pairAddress: string;
    topPairsCount: number;
    chain: string;
    imageUrl: string | null;
    tokenName: string;
}

// Fetch token data from DexScreener
export async function fetchDexScreenerData(ticker: string): Promise<DexMetrics | null> {
    const tokenInfo = TOKEN_ADDRESSES[ticker.toUpperCase()];

    // If no predefined address, try searching
    if (!tokenInfo) {
        return await searchAndGetDexData(ticker);
    }

    try {
        const response = await fetch(
            `${DEXSCREENER_BASE_URL}/dex/tokens/${tokenInfo.address}`,
            {
                headers: {
                    'Accept': 'application/json',
                },
                next: { revalidate: 60 },
            }
        );

        if (!response.ok) {
            throw new Error(`DexScreener API error: ${response.status}`);
        }

        const data: DexScreenerResponse = await response.json();

        if (!data.pairs || data.pairs.length === 0) {
            return getMockDexData(ticker);
        }

        // Get the pair with highest liquidity
        const topPair = data.pairs.reduce((best, current) =>
            (current.liquidity?.usd || 0) > (best.liquidity?.usd || 0) ? current : best
        );

        // Calculate aggregated metrics from all pairs
        const totalVolume24h = data.pairs.reduce((sum, p) => sum + (p.volume?.h24 || 0), 0);
        const totalBuys24h = data.pairs.reduce((sum, p) => sum + (p.txns?.h24?.buys || 0), 0);
        const totalSells24h = data.pairs.reduce((sum, p) => sum + (p.txns?.h24?.sells || 0), 0);

        return {
            ticker: ticker.toUpperCase(),
            tokenName: topPair.baseToken?.name || ticker.toUpperCase(),
            priceUsd: parseFloat(topPair.priceUsd) || 0,
            volume24h: totalVolume24h,
            volume6h: data.pairs.reduce((sum, p) => sum + (p.volume?.h6 || 0), 0),
            volume1h: data.pairs.reduce((sum, p) => sum + (p.volume?.h1 || 0), 0),
            liquidityUsd: topPair.liquidity?.usd || 0,
            fdv: topPair.fdv || 0,
            marketCap: topPair.marketCap || 0,
            priceChange24h: topPair.priceChange?.h24 || 0,
            priceChange6h: topPair.priceChange?.h6 || 0,
            priceChange1h: topPair.priceChange?.h1 || 0,
            buys24h: totalBuys24h,
            sells24h: totalSells24h,
            buysSellsRatio: totalSells24h > 0 ? totalBuys24h / totalSells24h : 1,
            dexId: topPair.dexId,
            pairAddress: topPair.pairAddress,
            topPairsCount: data.pairs.length,
            chain: tokenInfo.chain,
            imageUrl: (topPair as any).info?.imageUrl || null,
        };
    } catch (error) {
        console.error('DexScreener API error:', error);
        return getMockDexData(ticker);
    }
}

// Search for any token by name/symbol on DexScreener (for tokens not in our list)
async function searchAndGetDexData(ticker: string): Promise<DexMetrics | null> {
    try {
        const response = await fetch(
            `${DEXSCREENER_BASE_URL}/dex/search?q=${encodeURIComponent(ticker)}`,
            {
                headers: {
                    'Accept': 'application/json',
                },
                next: { revalidate: 60 },
            }
        );

        if (!response.ok) {
            return getMockDexData(ticker);
        }

        const data: DexScreenerResponse = await response.json();

        if (!data.pairs || data.pairs.length === 0) {
            return getMockDexData(ticker);
        }

        // Find exact match by symbol
        const matchingPairs = data.pairs.filter(
            p => p.baseToken.symbol.toUpperCase() === ticker.toUpperCase()
        );

        const pairsToUse = matchingPairs.length > 0 ? matchingPairs : data.pairs;

        // Get highest liquidity pair
        const topPair = pairsToUse.reduce((best, current) =>
            (current.liquidity?.usd || 0) > (best.liquidity?.usd || 0) ? current : best
        );

        const totalVolume24h = pairsToUse.reduce((sum, p) => sum + (p.volume?.h24 || 0), 0);
        const totalBuys24h = pairsToUse.reduce((sum, p) => sum + (p.txns?.h24?.buys || 0), 0);
        const totalSells24h = pairsToUse.reduce((sum, p) => sum + (p.txns?.h24?.sells || 0), 0);

        return {
            ticker: topPair.baseToken.symbol.toUpperCase(),
            tokenName: topPair.baseToken.name || topPair.baseToken.symbol.toUpperCase(),
            priceUsd: parseFloat(topPair.priceUsd) || 0,
            volume24h: totalVolume24h,
            volume6h: pairsToUse.reduce((sum, p) => sum + (p.volume?.h6 || 0), 0),
            volume1h: pairsToUse.reduce((sum, p) => sum + (p.volume?.h1 || 0), 0),
            liquidityUsd: topPair.liquidity?.usd || 0,
            fdv: topPair.fdv || 0,
            marketCap: topPair.marketCap || 0,
            priceChange24h: topPair.priceChange?.h24 || 0,
            priceChange6h: topPair.priceChange?.h6 || 0,
            priceChange1h: topPair.priceChange?.h1 || 0,
            buys24h: totalBuys24h,
            sells24h: totalSells24h,
            buysSellsRatio: totalSells24h > 0 ? totalBuys24h / totalSells24h : 1,
            dexId: topPair.dexId,
            pairAddress: topPair.pairAddress,
            topPairsCount: pairsToUse.length,
            chain: topPair.chainId,
            imageUrl: (topPair as any).info?.imageUrl || null,
        };
    } catch (error) {
        console.error('DexScreener search error:', error);
        return getMockDexData(ticker);
    }
}

// Search for any token
export async function searchDexScreener(query: string): Promise<DexPair[]> {
    try {
        const response = await fetch(
            `${DEXSCREENER_BASE_URL}/dex/search?q=${encodeURIComponent(query)}`,
            {
                headers: {
                    'Accept': 'application/json',
                },
                next: { revalidate: 60 },
            }
        );

        if (!response.ok) {
            throw new Error(`DexScreener search error: ${response.status}`);
        }

        const data: DexScreenerResponse = await response.json();
        return data.pairs || [];
    } catch (error) {
        console.error('DexScreener search error:', error);
        return [];
    }
}

// Get DEX sentiment based on buys/sells ratio
export function getDexSentiment(metrics: DexMetrics): {
    signal: 'ACCUMULATING' | 'DISTRIBUTING' | 'NEUTRAL';
    strength: number;
} {
    const ratio = metrics.buysSellsRatio;
    const volumeTrend = metrics.volume1h > 0
        ? (metrics.volume6h / 6) / metrics.volume1h
        : 1;

    if (ratio > 1.5 && volumeTrend > 0.8) {
        return { signal: 'ACCUMULATING', strength: Math.min(100, ratio * 40) };
    } else if (ratio < 0.7) {
        return { signal: 'DISTRIBUTING', strength: Math.min(100, (1 / ratio) * 40) };
    }

    return { signal: 'NEUTRAL', strength: 50 };
}

// Mock data for development/fallback - EXPANDED
function getMockDexData(ticker: string): DexMetrics {
    const mockData: Record<string, Partial<DexMetrics>> = {
        BTC: {
            priceUsd: 98500,
            volume24h: 28000000000,
            liquidityUsd: 2500000000,
            fdv: 1940000000000,
            marketCap: 1940000000000,
            priceChange24h: 2.4,
            buys24h: 450000,
            sells24h: 380000,
        },
        ETH: {
            priceUsd: 3450,
            volume24h: 12000000000,
            liquidityUsd: 1800000000,
            fdv: 415000000000,
            marketCap: 415000000000,
            priceChange24h: 3.1,
            buys24h: 320000,
            sells24h: 280000,
        },
        FET: {
            priceUsd: 2.45,
            volume24h: 125000000,
            liquidityUsd: 45000000,
            fdv: 2100000000,
            marketCap: 2100000000,
            priceChange24h: 8.5,
            buys24h: 15420,
            sells24h: 12340,
        },
        TAO: {
            priceUsd: 485.20,
            volume24h: 89000000,
            liquidityUsd: 32000000,
            fdv: 3200000000,
            marketCap: 3200000000,
            priceChange24h: 5.2,
            buys24h: 8900,
            sells24h: 7200,
        },
        PEPE: {
            priceUsd: 0.0000234,
            volume24h: 580000000,
            liquidityUsd: 125000000,
            fdv: 9800000000,
            marketCap: 9800000000,
            priceChange24h: 15.7,
            buys24h: 89000,
            sells24h: 45000,
        },
        SHIB: {
            priceUsd: 0.0000245,
            volume24h: 420000000,
            liquidityUsd: 95000000,
            fdv: 14500000000,
            marketCap: 14500000000,
            priceChange24h: 6.8,
            buys24h: 68000,
            sells24h: 52000,
        },
        DOGE: {
            priceUsd: 0.42,
            volume24h: 2800000000,
            liquidityUsd: 450000000,
            fdv: 62000000000,
            marketCap: 62000000000,
            priceChange24h: 8.2,
            buys24h: 185000,
            sells24h: 142000,
        },
        BONK: {
            priceUsd: 0.0000345,
            volume24h: 380000000,
            liquidityUsd: 65000000,
            fdv: 2400000000,
            marketCap: 2400000000,
            priceChange24h: 12.4,
            buys24h: 45000,
            sells24h: 28000,
        },
        WIF: {
            priceUsd: 2.85,
            volume24h: 650000000,
            liquidityUsd: 85000000,
            fdv: 2850000000,
            marketCap: 2850000000,
            priceChange24h: 18.5,
            buys24h: 52000,
            sells24h: 32000,
        },
        SOL: {
            priceUsd: 198.50,
            volume24h: 4500000000,
            liquidityUsd: 890000000,
            fdv: 92000000000,
            marketCap: 92000000000,
            priceChange24h: 4.2,
            buys24h: 245000,
            sells24h: 198000,
        },
    };

    const base = mockData[ticker.toUpperCase()] || {
        priceUsd: 1,
        volume24h: 10000000,
        liquidityUsd: 5000000,
        fdv: 100000000,
        marketCap: 100000000,
        priceChange24h: 0,
        buys24h: 5000,
        sells24h: 4000,
    };

    return {
        ticker: ticker.toUpperCase(),
        tokenName: ticker.toUpperCase(),
        priceUsd: base.priceUsd || 1,
        volume24h: base.volume24h || 10000000,
        volume6h: (base.volume24h || 10000000) * 0.25,
        volume1h: (base.volume24h || 10000000) * 0.04,
        liquidityUsd: base.liquidityUsd || 5000000,
        fdv: base.fdv || 100000000,
        marketCap: base.marketCap || 100000000,
        priceChange24h: base.priceChange24h || 0,
        priceChange6h: (base.priceChange24h || 0) * 0.4,
        priceChange1h: (base.priceChange24h || 0) * 0.1,
        buys24h: base.buys24h || 5000,
        sells24h: base.sells24h || 4000,
        buysSellsRatio: (base.buys24h || 5000) / (base.sells24h || 4000),
        dexId: 'uniswap',
        pairAddress: '0x...',
        topPairsCount: 5,
        chain: 'ethereum',
        imageUrl: null,  // Will be filled by token-images service
    };
}

// Format liquidity for display
export function formatLiquidity(liquidity: number): string {
    if (liquidity >= 1_000_000_000) return `$${(liquidity / 1_000_000_000).toFixed(2)}B`;
    if (liquidity >= 1_000_000) return `$${(liquidity / 1_000_000).toFixed(2)}M`;
    if (liquidity >= 1_000) return `$${(liquidity / 1_000).toFixed(2)}K`;
    return `$${liquidity.toFixed(2)}`;
}
