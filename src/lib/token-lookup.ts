// Token Lookup Service for $ORACLE 2026 Terminal
// Fetches complete token info from DexScreener including name, image, and category

const DEXSCREENER_BASE_URL = 'https://api.dexscreener.com/latest';
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Token categories for classification - EXPANDED
export const TOKEN_CATEGORIES = {
    MAJORS: ['BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'ADA', 'DOT', 'AVAX', 'MATIC', 'LTC', 'ATOM', 'NEAR', 'TRX', 'TON', 'HBAR'],
    AI: ['FET', 'TAO', 'RENDER', 'OCEAN', 'AGIX', 'WLD', 'ARKM', 'AKT', 'NMR', 'RNDR', 'ORAI', 'AIOZ', 'ALI', 'CTXC', 'GRT', 'BITTENSOR'],
    RWA: ['ONDO', 'MKR', 'AAVE', 'COMP', 'SNX', 'POLYX', 'CFG', 'MPL', 'PROPC', 'MAPLE', 'RIO', 'CPOOL'],
    MEME: [
        // Major memes
        'PEPE', 'SHIB', 'DOGE', 'FLOKI', 'BONK', 'WIF', 'BRETT', 'POPCAT', 'MOG', 'NEIRO',
        'TURBO', 'WOJAK', 'LADYS', 'COQ', 'MEME', 'DEGEN', 'BOME', 'SLERF', 'MEW', 'PORK',
        // Dog memes
        'DOGWIFHAT', 'MYRO', 'SNEK', 'TOSHI', 'PONKE', 'WEN', 'CHEEMS', 'DOGELON', 'ELON', 'SAMO',
        'SHIBA', 'AKITA', 'KISHU', 'BABYDOGE', 'CORGIAI', 'INU', 'SHIBAINU', 'DOGEFATHER',
        // Cat memes
        'POPCAT', 'MEW', 'CAT', 'KITTY', 'CATE', 'CATECOIN', 'MICHI', 'THECATCOIN',
        // Frog memes
        'PEPE2', 'PEPECOIN', 'APED', 'FROG', 'SMOG', 'PEPEFORK', 'PEEPO',
        // Other memes
        'ANDY', 'LANDWOLF', 'GIGA', 'GIGACHAD', 'BASED', 'CHAD', 'DADDY', 'MOTHER',
        'TRUMP', 'BIDEN', 'MAGA', 'BODEN', 'TREMP', 'JEO', 'PNUT', 'GOAT',
        'BILLY', 'BOOK', 'BENTO', 'SPX', 'SPX6900', 'ANALOS', 'USA', 'AMERICA',
        // Solana memes
        'BERN', 'SILLY', 'JITO', 'HARAMBE', 'GECKO', 'GUAC', 'DUKO', 'ZEUS',
    ],
    DEFI: ['UNI', 'CRV', 'SUSHI', 'CAKE', '1INCH', 'LDO', 'RPL', 'GMX', 'DYDX', 'JUP', 'RAY', 'LINK', 'YFI', 'BAL', 'PENDLE', 'MORPHO'],
    L2: ['ARB', 'OP', 'IMX', 'STRK', 'ZK', 'MANTA', 'METIS', 'BOBA', 'BLAST', 'MODE', 'SCROLL', 'LINEA', 'BASE', 'ZKSYNC'],
    GAMING: ['AXS', 'SAND', 'MANA', 'GALA', 'ENJ', 'BEAM', 'PRIME', 'PIXEL', 'RONIN', 'IMX', 'GODS', 'MAGIC', 'ILV', 'HERO', 'PYR', 'SUPER', 'ATLAS', 'POLIS'],
};

// Keywords that indicate meme tokens
const MEME_KEYWORDS = [
    'doge', 'dog', 'shib', 'inu', 'pepe', 'frog', 'cat', 'moon', 'elon', 'meme',
    'chad', 'based', 'wojak', 'baby', 'safe', 'rocket', 'cum', 'poo', 'shit',
    'floki', 'bonk', 'wif', 'hat', 'popcat', 'mog', 'brett', 'andy', 'landwolf',
    'trump', 'biden', 'boden', 'maga', 'president', 'tremp', 'daddy', 'mother',
    'goat', 'pnut', 'peanut', 'squirrel', 'hamster', 'billy', 'book', 'giga',
    'cheems', 'myro', 'ponke', 'wen', 'slerf', 'bome', 'mew', 'kitty', 'neiro',
    'degen', 'retard', 'ape', 'monkey', 'banana', 'pork', 'pig', 'usa', 'america'
];

// CoinGecko image URLs as fallback
const COINGECKO_IMAGES: Record<string, string> = {
    BTC: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    ETH: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    SOL: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    BNB: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    XRP: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    ADA: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    DOGE: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    AVAX: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
    DOT: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    MATIC: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
    LINK: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    SHIB: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
    PEPE: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg',
    FLOKI: 'https://assets.coingecko.com/coins/images/16746/large/FLOKI.png',
    BONK: 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg',
    WIF: 'https://assets.coingecko.com/coins/images/33566/large/dogwifhat.jpg',
    FET: 'https://assets.coingecko.com/coins/images/5681/large/Fetch.jpg',
    TAO: 'https://assets.coingecko.com/coins/images/28452/large/ARUsPeNQ_400x400.png',
    RENDER: 'https://assets.coingecko.com/coins/images/11636/large/rndr.png',
    ONDO: 'https://assets.coingecko.com/coins/images/26580/large/ONDO.png',
    ARB: 'https://assets.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg',
    OP: 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png',
    UNI: 'https://assets.coingecko.com/coins/images/12504/large/uni.jpg',
    AAVE: 'https://assets.coingecko.com/coins/images/12645/large/AAVE.png',
    MKR: 'https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png',
    LDO: 'https://assets.coingecko.com/coins/images/13573/large/Lido_DAO.png',
    AXS: 'https://assets.coingecko.com/coins/images/13029/large/axie_infinity_logo.png',
    SAND: 'https://assets.coingecko.com/coins/images/12129/large/sandbox_logo.jpg',
    MANA: 'https://assets.coingecko.com/coins/images/878/large/decentraland-mana.png',
    GALA: 'https://assets.coingecko.com/coins/images/12493/large/GALA.png',
    BRETT: 'https://assets.coingecko.com/coins/images/35529/large/1000050750.png',
    POPCAT: 'https://assets.coingecko.com/coins/images/33760/large/image.png',
    MOG: 'https://assets.coingecko.com/coins/images/31059/large/MOG_LOGO_200x200.png',
    WLD: 'https://assets.coingecko.com/coins/images/31069/large/worldcoin.jpeg',
    JUP: 'https://assets.coingecko.com/coins/images/34188/large/jup.png',
    GMX: 'https://assets.coingecko.com/coins/images/18323/large/arbit.png',
    CRV: 'https://assets.coingecko.com/coins/images/12124/large/Curve.png',
};

// Smart category detection based on token name/symbol
export function detectCategory(symbol: string, name: string): string {
    const upperSymbol = symbol.toUpperCase();
    const lowerName = name.toLowerCase();
    const lowerSymbol = symbol.toLowerCase();

    // First check our predefined lists
    for (const [category, tokens] of Object.entries(TOKEN_CATEGORIES)) {
        if (tokens.includes(upperSymbol)) {
            return category;
        }
    }

    // Smart detection: Check if name contains meme keywords
    for (const keyword of MEME_KEYWORDS) {
        if (lowerName.includes(keyword) || lowerSymbol.includes(keyword)) {
            return 'MEME';
        }
    }

    // Check for common patterns
    if (lowerName.includes('swap') || lowerName.includes('finance') || lowerName.includes('protocol')) {
        return 'DEFI';
    }
    if (lowerName.includes('game') || lowerName.includes('play') || lowerName.includes('nft land')) {
        return 'GAMING';
    }
    if (lowerName.includes('layer') || lowerName.includes('l2') || lowerName.includes('rollup')) {
        return 'L2';
    }
    if (lowerName.includes('ai') || lowerName.includes('artificial') || lowerName.includes('neural')) {
        return 'AI';
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
    source: 'dexscreener' | 'address_lookup' | 'coingecko' | 'mock';
}

// Check if input is a contract address
export function isContractAddress(input: string): boolean {
    const cleaned = input.trim();
    if (/^0x[a-fA-F0-9]{40}$/i.test(cleaned)) return true;
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(cleaned)) return true;
    return false;
}

// Get fallback image from CoinGecko or generate placeholder
function getFallbackImage(symbol: string): string {
    const upperSymbol = symbol.toUpperCase();
    if (COINGECKO_IMAGES[upperSymbol]) {
        return COINGECKO_IMAGES[upperSymbol];
    }
    // Generate placeholder with first letter
    const letter = symbol.charAt(0).toUpperCase();
    const colors = ['6366f1', '8b5cf6', 'ec4899', 'f43f5e', 'f97316', 'eab308', '22c55e', '14b8a6', '06b6d4', '3b82f6'];
    const color = colors[symbol.charCodeAt(0) % colors.length];
    return `https://ui-avatars.com/api/?name=${letter}&background=${color}&color=fff&size=128&bold=true`;
}

// Lookup token by contract address
export async function lookupTokenByAddress(address: string): Promise<TokenLookupResult | null> {
    try {
        console.log('Looking up address:', address);

        const response = await fetch(
            `${DEXSCREENER_BASE_URL}/dex/tokens/${address}`,
            { headers: { 'Accept': 'application/json' }, cache: 'no-store' }
        );

        if (!response.ok) return null;

        const data = await response.json();
        if (!data.pairs || data.pairs.length === 0) return null;

        // Get the pair with highest liquidity
        const topPair = data.pairs.reduce((best: any, current: any) =>
            (current.liquidity?.usd || 0) > (best.liquidity?.usd || 0) ? current : best
        );

        const baseToken = topPair.baseToken;
        const symbol = baseToken.symbol.toUpperCase();
        const name = baseToken.name || symbol;

        // Get image - try DexScreener first, then fallback
        let imageUrl = topPair.info?.imageUrl || null;
        if (!imageUrl) {
            imageUrl = getFallbackImage(symbol);
        }

        // Smart category detection
        const category = detectCategory(symbol, name);

        console.log('Found token:', symbol, 'Name:', name, 'Category:', category, 'Image:', imageUrl);

        return {
            symbol,
            name,
            imageUrl,
            address: baseToken.address,
            chain: topPair.chainId,
            price: parseFloat(topPair.priceUsd) || 0,
            priceChange24h: topPair.priceChange?.h24 || 0,
            marketCap: topPair.marketCap || topPair.fdv || 0,
            fdv: topPair.fdv || 0,
            volume24h: topPair.volume?.h24 || 0,
            liquidity: topPair.liquidity?.usd || 0,
            category,
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

// Search for token by symbol
export async function searchTokenBySymbol(symbol: string): Promise<TokenLookupResult | null> {
    try {
        console.log('Searching for symbol:', symbol);

        const response = await fetch(
            `${DEXSCREENER_BASE_URL}/dex/search?q=${encodeURIComponent(symbol)}`,
            { headers: { 'Accept': 'application/json' }, cache: 'no-store' }
        );

        if (!response.ok) return null;

        const data = await response.json();
        if (!data.pairs || data.pairs.length === 0) return null;

        // Find exact symbol match
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
        const name = baseToken.name || tokenSymbol;

        // Get image - try DexScreener first, then fallback
        let imageUrl = topPair.info?.imageUrl || null;
        if (!imageUrl) {
            imageUrl = getFallbackImage(tokenSymbol);
        }

        // Smart category detection
        const category = detectCategory(tokenSymbol, name);

        console.log('Found token:', tokenSymbol, 'Name:', name, 'Category:', category, 'Image:', imageUrl);

        return {
            symbol: tokenSymbol,
            name,
            imageUrl,
            address: baseToken.address,
            chain: topPair.chainId,
            price: parseFloat(topPair.priceUsd) || 0,
            priceChange24h: topPair.priceChange?.h24 || 0,
            marketCap: topPair.marketCap || topPair.fdv || 0,
            fdv: topPair.fdv || 0,
            volume24h: topPair.volume?.h24 || 0,
            liquidity: topPair.liquidity?.usd || 0,
            category,
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

// Main lookup function
export async function lookupToken(input: string): Promise<TokenLookupResult | null> {
    const cleaned = input.trim();

    if (isContractAddress(cleaned)) {
        return await lookupTokenByAddress(cleaned);
    } else {
        return await searchTokenBySymbol(cleaned);
    }
}

// Format market cap for display
export function formatMarketCap(marketCap: number): string {
    if (!marketCap || marketCap === 0) return '$0';
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
