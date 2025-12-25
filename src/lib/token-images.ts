// Token Image Service for $ORACLE 2026 Terminal
// Fetches token logos and handles contract address lookups

const DEXSCREENER_BASE_URL = 'https://api.dexscreener.com/latest';

// Known token logo URLs (fallback images)
export const TOKEN_LOGOS: Record<string, string> = {
    // Majors
    BTC: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    ETH: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    SOL: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    BNB: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    XRP: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
    ADA: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
    DOGE: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
    AVAX: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
    DOT: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
    MATIC: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png',
    LINK: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',

    // AI
    FET: 'https://assets.coingecko.com/coins/images/5681/small/Fetch.jpg',
    TAO: 'https://assets.coingecko.com/coins/images/28452/small/ARUsPeNQ_400x400.png',
    RENDER: 'https://assets.coingecko.com/coins/images/11636/small/rndr.png',
    OCEAN: 'https://assets.coingecko.com/coins/images/3687/small/ocean-protocol-logo.jpg',
    AGIX: 'https://assets.coingecko.com/coins/images/2138/small/singularitynet.png',
    WLD: 'https://assets.coingecko.com/coins/images/31069/small/worldcoin.jpeg',

    // RWA
    ONDO: 'https://assets.coingecko.com/coins/images/26580/small/ONDO.png',
    MKR: 'https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png',
    AAVE: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png',

    // Memes
    PEPE: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg',
    SHIB: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png',
    FLOKI: 'https://assets.coingecko.com/coins/images/16746/small/FLOKI.png',
    BONK: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg',
    WIF: 'https://assets.coingecko.com/coins/images/33566/small/dogwifhat.jpg',
    BRETT: 'https://assets.coingecko.com/coins/images/35529/small/1000050750.png',
    POPCAT: 'https://assets.coingecko.com/coins/images/33760/small/image.png',
    MOG: 'https://assets.coingecko.com/coins/images/31059/small/MOG_LOGO_200x200.png',

    // DeFi
    UNI: 'https://assets.coingecko.com/coins/images/12504/small/uni.jpg',
    CRV: 'https://assets.coingecko.com/coins/images/12124/small/Curve.png',
    SUSHI: 'https://assets.coingecko.com/coins/images/12271/small/512x512_Logo_no_chop.png',
    LDO: 'https://assets.coingecko.com/coins/images/13573/small/Lido_DAO.png',
    GMX: 'https://assets.coingecko.com/coins/images/18323/small/arbit.png',
    JUP: 'https://assets.coingecko.com/coins/images/34188/small/jup.png',

    // L2
    ARB: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
    OP: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
    IMX: 'https://assets.coingecko.com/coins/images/17233/small/immutableX-symbol-BLK-RGB.png',
    STRK: 'https://assets.coingecko.com/coins/images/26433/small/starknet.png',

    // Gaming
    AXS: 'https://assets.coingecko.com/coins/images/13029/small/axie_infinity_logo.png',
    SAND: 'https://assets.coingecko.com/coins/images/12129/small/sandbox_logo.jpg',
    MANA: 'https://assets.coingecko.com/coins/images/878/small/decentraland-mana.png',
    GALA: 'https://assets.coingecko.com/coins/images/12493/small/GALA.png',
};

export interface TokenInfo {
    symbol: string;
    name: string;
    imageUrl: string | null;
    address?: string;
    chain?: string;
    price?: number;
    priceChange24h?: number;
    marketCap?: number;
    volume24h?: number;
}

// Check if input is a contract address
export function isContractAddress(input: string): boolean {
    // Ethereum-style address (0x...)
    if (/^0x[a-fA-F0-9]{40}$/.test(input)) {
        return true;
    }
    // Solana address (base58, 32-44 chars)
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input) && !input.startsWith('0x')) {
        return true;
    }
    return false;
}

// Get token logo URL for a known ticker
export function getTokenLogo(ticker: string): string | null {
    return TOKEN_LOGOS[ticker.toUpperCase()] || null;
}

// Lookup token by contract address via DexScreener
export async function lookupByAddress(address: string): Promise<TokenInfo | null> {
    try {
        const response = await fetch(
            `${DEXSCREENER_BASE_URL}/dex/tokens/${address}`,
            {
                headers: { 'Accept': 'application/json' },
                next: { revalidate: 60 },
            }
        );

        if (!response.ok) {
            throw new Error(`DexScreener API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.pairs || data.pairs.length === 0) {
            return null;
        }

        // Get the pair with highest liquidity
        const topPair = data.pairs.reduce((best: any, current: any) =>
            (current.liquidity?.usd || 0) > (best.liquidity?.usd || 0) ? current : best
        );

        const baseToken = topPair.baseToken;

        return {
            symbol: baseToken.symbol,
            name: baseToken.name,
            imageUrl: topPair.info?.imageUrl || getTokenLogo(baseToken.symbol),
            address: baseToken.address,
            chain: topPair.chainId,
            price: parseFloat(topPair.priceUsd) || 0,
            priceChange24h: topPair.priceChange?.h24 || 0,
            marketCap: topPair.marketCap || 0,
            volume24h: topPair.volume?.h24 || 0,
        };
    } catch (error) {
        console.error('Address lookup error:', error);
        return null;
    }
}

// Search for token by symbol and get image
export async function searchTokenWithImage(query: string): Promise<TokenInfo | null> {
    // First check if it's an address
    if (isContractAddress(query)) {
        return await lookupByAddress(query);
    }

    // Check if we have a known logo
    const knownLogo = getTokenLogo(query);

    try {
        const response = await fetch(
            `${DEXSCREENER_BASE_URL}/dex/search?q=${encodeURIComponent(query)}`,
            {
                headers: { 'Accept': 'application/json' },
                next: { revalidate: 60 },
            }
        );

        if (!response.ok) {
            throw new Error(`DexScreener search error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.pairs || data.pairs.length === 0) {
            // Return with known logo if available
            if (knownLogo) {
                return {
                    symbol: query.toUpperCase(),
                    name: query.toUpperCase(),
                    imageUrl: knownLogo,
                };
            }
            return null;
        }

        // Find exact symbol match first
        const exactMatch = data.pairs.find(
            (p: any) => p.baseToken.symbol.toUpperCase() === query.toUpperCase()
        );

        const pair = exactMatch || data.pairs[0];
        const baseToken = pair.baseToken;

        return {
            symbol: baseToken.symbol,
            name: baseToken.name,
            imageUrl: pair.info?.imageUrl || knownLogo || null,
            address: baseToken.address,
            chain: pair.chainId,
            price: parseFloat(pair.priceUsd) || 0,
            priceChange24h: pair.priceChange?.h24 || 0,
            marketCap: pair.marketCap || 0,
            volume24h: pair.volume?.h24 || 0,
        };
    } catch (error) {
        console.error('Token search error:', error);
        // Return with known logo if available
        if (knownLogo) {
            return {
                symbol: query.toUpperCase(),
                name: query.toUpperCase(),
                imageUrl: knownLogo,
            };
        }
        return null;
    }
}

// Generate a placeholder image URL for tokens without logos
export function getPlaceholderImage(symbol: string): string {
    // Use a simple placeholder with the first letter
    const letter = symbol.charAt(0).toUpperCase();
    const colors = [
        '6366f1', // indigo
        '8b5cf6', // violet
        'ec4899', // pink
        'f43f5e', // rose
        'f97316', // orange
        'eab308', // yellow
        '22c55e', // green
        '14b8a6', // teal
        '06b6d4', // cyan
        '3b82f6', // blue
    ];
    const colorIndex = symbol.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];

    // Using UI Avatars API for generating placeholder
    return `https://ui-avatars.com/api/?name=${letter}&background=${color}&color=fff&size=128&bold=true`;
}

// Get the best available image for a token
export function getBestTokenImage(symbol: string, dexImageUrl?: string | null): string {
    // Priority: DEX image > Known logo > Placeholder
    if (dexImageUrl) return dexImageUrl;
    const knownLogo = getTokenLogo(symbol);
    if (knownLogo) return knownLogo;
    return getPlaceholderImage(symbol);
}
