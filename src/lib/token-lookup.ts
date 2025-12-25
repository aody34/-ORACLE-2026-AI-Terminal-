// Token Lookup Service for $ORACLE 2026 Terminal
// Fetches complete token info from DexScreener including name, image, and category

const DEXSCREENER_BASE_URL = 'https://api.dexscreener.com/latest';

// Token categories for classification
export const TOKEN_CATEGORIES = {
    MAJORS: ['BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'ADA', 'DOT', 'AVAX', 'MATIC', 'LTC'],
    AI: ['FET', 'TAO', 'RENDER', 'OCEAN', 'AGIX', 'WLD', 'ARKM', 'AKT', 'NMR', 'RNDR'],
    RWA: ['ONDO', 'MKR', 'AAVE', 'COMP', 'SNX', 'POLYX', 'CFG', 'MPL', 'PROPC'],
    MEME: ['PEPE', 'SHIB', 'DOGE', 'FLOKI', 'BONK', 'WIF', 'BRETT', 'POPCAT', 'MOG', 'NEIRO', 'TURBO', 'WOJAK', 'LADYS', 'COQ', 'MEME'],
    DEFI: ['UNI', 'CRV', 'SUSHI', 'CAKE', '1INCH', 'LDO', 'RPL', 'GMX', 'DYDX', 'JUP', 'RAY', 'LINK'],
    L2: ['ARB', 'OP', 'IMX', 'STRK', 'ZK', 'MANTA', 'METIS', 'BOBA'],
    GAMING: ['AXS', 'SAND', 'MANA', 'GALA', 'ENJ', 'BEAM', 'PRIME', 'PIXEL', 'RONIN'],
};

// Get token category
export function getTokenCategory(symbol: string): string {
    const upperSymbol = symbol.toUpperCase();

    for (const [category, tokens] of Object.entries(TOKEN_CATEGORIES)) {
        if (tokens.includes(upperSymbol)) {
            return category;
        }
    }

    return 'ALTCOIN';
}

// Complete token info interface
export interface TokenLookupResult {
    symbol: string;
    name: string;
    imageUrl: string | null;
    address: string | null;
    chain: string | null;
    price: number;
    priceChange24h: number;
    marketCap: number;
    fdv: number;
    volume24h: number;
    liquidity: number;
    category: string;
    buys24h: number;
    sells24h: number;
    pairAddress: string | null;
    dexId: string | null;
    source: 'dexscreener' | 'address_lookup' | 'mock';
}

// Check if input is a contract address
export function isContractAddress(input: string): boolean {
    // Clean the input
    const cleaned = input.trim();

    // Ethereum-style address (0x followed by 40 hex chars)
    if (/^0x[a-fA-F0-9]{40}$/i.test(cleaned)) {
        return true;
    }

    // Solana address (32-44 base58 characters, no 0, O, I, l)
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(cleaned)) {
        return true;
    }

    return false;
}

// Lookup token by contract address - returns full info with image
export async function lookupTokenByAddress(address: string): Promise<TokenLookupResult | null> {
    try {
        console.log('Looking up address:', address);

        const response = await fetch(
            `${DEXSCREENER_BASE_URL}/dex/tokens/${address}`,
            {
                headers: { 'Accept': 'application/json' },
                cache: 'no-store', // Always get fresh data
            }
        );

        if (!response.ok) {
            console.error('DexScreener API error:', response.status);
            return null;
        }

        const data = await response.json();
        console.log('DexScreener response pairs:', data.pairs?.length || 0);

        if (!data.pairs || data.pairs.length === 0) {
            console.log('No pairs found for address');
            return null;
        }

        // Get the pair with highest liquidity
        const topPair = data.pairs.reduce((best: any, current: any) =>
            (current.liquidity?.usd || 0) > (best.liquidity?.usd || 0) ? current : best
        );

        const baseToken = topPair.baseToken;
        const symbol = baseToken.symbol.toUpperCase();

        // Get image URL from pair info
        const imageUrl = topPair.info?.imageUrl || null;
        console.log('Found token:', symbol, 'Image:', imageUrl);

        return {
            symbol,
            name: baseToken.name || symbol,
            imageUrl,
            address: baseToken.address,
            chain: topPair.chainId,
            price: parseFloat(topPair.priceUsd) || 0,
            priceChange24h: topPair.priceChange?.h24 || 0,
            marketCap: topPair.marketCap || topPair.fdv || 0,
            fdv: topPair.fdv || 0,
            volume24h: topPair.volume?.h24 || 0,
            liquidity: topPair.liquidity?.usd || 0,
            category: getTokenCategory(symbol),
            buys24h: topPair.txns?.h24?.buys || 0,
            sells24h: topPair.txns?.h24?.sells || 0,
            pairAddress: topPair.pairAddress,
            dexId: topPair.dexId,
            source: 'address_lookup',
        };
    } catch (error) {
        console.error('Address lookup error:', error);
        return null;
    }
}

// Search for token by symbol - returns full info with image
export async function searchTokenBySymbol(symbol: string): Promise<TokenLookupResult | null> {
    try {
        console.log('Searching for symbol:', symbol);

        const response = await fetch(
            `${DEXSCREENER_BASE_URL}/dex/search?q=${encodeURIComponent(symbol)}`,
            {
                headers: { 'Accept': 'application/json' },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            console.error('DexScreener search error:', response.status);
            return null;
        }

        const data = await response.json();
        console.log('Search results:', data.pairs?.length || 0, 'pairs');

        if (!data.pairs || data.pairs.length === 0) {
            return null;
        }

        // Find exact symbol match with highest liquidity
        const exactMatches = data.pairs.filter(
            (p: any) => p.baseToken.symbol.toUpperCase() === symbol.toUpperCase()
        );

        const pairsToUse = exactMatches.length > 0 ? exactMatches : data.pairs;

        // Get highest liquidity pair
        const topPair = pairsToUse.reduce((best: any, current: any) =>
            (current.liquidity?.usd || 0) > (best.liquidity?.usd || 0) ? current : best
        );

        const baseToken = topPair.baseToken;
        const tokenSymbol = baseToken.symbol.toUpperCase();

        // Get image URL from pair info
        const imageUrl = topPair.info?.imageUrl || null;
        console.log('Found token:', tokenSymbol, 'Image:', imageUrl);

        return {
            symbol: tokenSymbol,
            name: baseToken.name || tokenSymbol,
            imageUrl,
            address: baseToken.address,
            chain: topPair.chainId,
            price: parseFloat(topPair.priceUsd) || 0,
            priceChange24h: topPair.priceChange?.h24 || 0,
            marketCap: topPair.marketCap || topPair.fdv || 0,
            fdv: topPair.fdv || 0,
            volume24h: topPair.volume?.h24 || 0,
            liquidity: topPair.liquidity?.usd || 0,
            category: getTokenCategory(tokenSymbol),
            buys24h: topPair.txns?.h24?.buys || 0,
            sells24h: topPair.txns?.h24?.sells || 0,
            pairAddress: topPair.pairAddress,
            dexId: topPair.dexId,
            source: 'dexscreener',
        };
    } catch (error) {
        console.error('Token search error:', error);
        return null;
    }
}

// Main lookup function - handles both addresses and symbols
export async function lookupToken(input: string): Promise<TokenLookupResult | null> {
    const cleaned = input.trim();

    if (isContractAddress(cleaned)) {
        console.log('Input is address, looking up...');
        return await lookupTokenByAddress(cleaned);
    } else {
        console.log('Input is symbol, searching...');
        return await searchTokenBySymbol(cleaned);
    }
}

// Format market cap for display
export function formatMarketCap(marketCap: number): string {
    if (marketCap >= 1_000_000_000_000) return `$${(marketCap / 1_000_000_000_000).toFixed(2)}T`;
    if (marketCap >= 1_000_000_000) return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
    if (marketCap >= 1_000_000) return `$${(marketCap / 1_000_000).toFixed(2)}M`;
    if (marketCap >= 1_000) return `$${(marketCap / 1_000).toFixed(2)}K`;
    return `$${marketCap.toFixed(2)}`;
}

// Get category emoji
export function getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
        MAJORS: '👑',
        AI: '🤖',
        RWA: '🏛️',
        MEME: '🐸',
        DEFI: '💰',
        L2: '⚡',
        GAMING: '🎮',
        ALTCOIN: '🪙',
    };
    return emojis[category] || '🪙';
}

// Get category color
export function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
        MAJORS: 'text-yellow-400',
        AI: 'text-purple-400',
        RWA: 'text-blue-400',
        MEME: 'text-green-400',
        DEFI: 'text-cyan-400',
        L2: 'text-orange-400',
        GAMING: 'text-pink-400',
        ALTCOIN: 'text-gray-400',
    };
    return colors[category] || 'text-gray-400';
}
