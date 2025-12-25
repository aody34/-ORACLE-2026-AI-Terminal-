// CoinGecko API Service for $ORACLE 2026 Terminal
// Fetches real-time crypto data for all sectors

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Coin ID mappings for CoinGecko API - EXPANDED LIST
export const COIN_IDS: Record<string, string> = {
  // === MAJORS ===
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'SOL': 'solana',
  'DOGE': 'dogecoin',
  'DOT': 'polkadot',
  'AVAX': 'avalanche-2',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'ATOM': 'cosmos',
  'LTC': 'litecoin',
  'UNI': 'uniswap',
  'TRX': 'tron',

  // === AI SECTOR ===
  'FET': 'fetch-ai',
  'TAO': 'bittensor',
  'RENDER': 'render-token',
  'OCEAN': 'ocean-protocol',
  'AGIX': 'singularitynet',
  'NMR': 'numeraire',
  'RNDR': 'render-token',
  'AKT': 'akash-network',
  'ARKM': 'arkham',
  'WLD': 'worldcoin-wld',

  // === RWA SECTOR (Real World Assets) ===
  'ONDO': 'ondo-finance',
  'PROPC': 'propchain',
  'MKR': 'maker',
  'AAVE': 'aave',
  'COMP': 'compound-governance-token',
  'SNX': 'havven',
  'RWA': 'rwa-finance',
  'POLYX': 'polymesh',
  'CFG': 'centrifuge',
  'MPL': 'maple',

  // === MEME SECTOR ===
  'PEPE': 'pepe',
  'SHIB': 'shiba-inu',
  'FLOKI': 'floki',
  'BONK': 'bonk',
  'WIF': 'dogwifcoin',
  'MEME': 'memecoin',
  'TURBO': 'turbo',
  'LADYS': 'milady-meme-coin',
  'COQ': 'coq-inu',
  'WOJAK': 'wojak',
  'BRETT': 'brett',
  'POPCAT': 'popcat',
  'MOG': 'mog-coin',
  'NEIRO': 'neiro-on-eth',

  // === DEFI ===
  'CRV': 'curve-dao-token',
  'SUSHI': 'sushi',
  'CAKE': 'pancakeswap-token',
  '1INCH': '1inch',
  'LDO': 'lido-dao',
  'RPL': 'rocket-pool',
  'GMX': 'gmx',
  'DYDX': 'dydx',
  'JUP': 'jupiter-exchange-solana',
  'RAY': 'raydium',

  // === LAYER 2 ===
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'IMX': 'immutable-x',
  'STRK': 'starknet',
  'ZK': 'zksync',
  'MANTA': 'manta-network',
  'METIS': 'metis-token',
  'BOBA': 'boba-network',

  // === GAMING / METAVERSE ===
  'AXS': 'axie-infinity',
  'SAND': 'the-sandbox',
  'MANA': 'decentraland',
  'GALA': 'gala',
  'ENJ': 'enjincoin',
  'BEAM': 'beam-2',
  'PRIME': 'echelon-prime',
  'PIXEL': 'pixels',
  'RONIN': 'ronin',
};

// Sector groupings
export const SECTORS = {
  MAJORS: ['BTC', 'ETH', 'BNB', 'XRP', 'SOL'],
  AI: ['FET', 'TAO', 'RENDER', 'OCEAN', 'AGIX', 'WLD', 'AKT', 'ARKM'],
  RWA: ['ONDO', 'PROPC', 'MKR', 'AAVE', 'POLYX', 'CFG', 'MPL'],
  MEME: ['PEPE', 'SHIB', 'FLOKI', 'BONK', 'WIF', 'DOGE', 'BRETT', 'POPCAT', 'MOG', 'NEIRO'],
  DEFI: ['UNI', 'CRV', 'SUSHI', 'LDO', 'GMX', 'DYDX', 'JUP', 'RAY'],
  L2: ['ARB', 'OP', 'IMX', 'STRK', 'MANTA', 'METIS'],
  GAMING: ['AXS', 'SAND', 'MANA', 'GALA', 'BEAM', 'PRIME', 'PIXEL'],
};

// Get sector for a ticker
export function getSectorForTicker(ticker: string): string {
  const upperTicker = ticker.toUpperCase();
  for (const [sector, tickers] of Object.entries(SECTORS)) {
    if (tickers.includes(upperTicker)) {
      return sector;
    }
  }
  return 'ALTCOIN';
}

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
}

export interface HistoricalData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

// Fetch current price data for multiple coins
export async function fetchCoinPrices(coinIds: string[]): Promise<CoinData[]> {
  try {
    const ids = coinIds.join(',');
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching coin prices:', error);
    // Return mock data for development
    return getMockCoinData(coinIds);
  }
}

// Fetch historical OHLC data for technical analysis
export async function fetchHistoricalData(coinId: string, days: number = 30): Promise<HistoricalData> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching historical data:', error);
    // Return mock historical data
    return getMockHistoricalData(days);
  }
}

// Get coin data by ticker symbol
export async function getCoinByTicker(ticker: string): Promise<CoinData | null> {
  const coinId = COIN_IDS[ticker.toUpperCase()];
  if (!coinId) {
    return null;
  }

  const coins = await fetchCoinPrices([coinId]);
  return coins[0] || null;
}

// Get sector data (AI, RWA, MEME, etc.)
export async function getSectorData(sector: keyof typeof SECTORS) {
  const tickers = SECTORS[sector];
  const coinIds = tickers.map(t => COIN_IDS[t]).filter(Boolean);
  const coins = await fetchCoinPrices(coinIds);

  const totalVolume = coins.reduce((sum, coin) => sum + coin.total_volume, 0);
  const avgChange = coins.reduce((sum, coin) => sum + coin.price_change_percentage_24h, 0) / coins.length;

  return {
    sector,
    coins,
    totalVolume,
    avgChange,
  };
}

// Get all sectors data for the heatmap
export async function getAllSectorsData() {
  const [ai, rwa, meme] = await Promise.all([
    getSectorData('AI'),
    getSectorData('RWA'),
    getSectorData('MEME'),
  ]);

  return { ai, rwa, meme };
}

// Mock data for development (when API is unavailable)
function getMockCoinData(coinIds: string[]): CoinData[] {
  const mockPrices: Record<string, CoinData> = {
    'bitcoin': {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      current_price: 98500,
      market_cap: 1940000000000,
      total_volume: 48000000000,
      price_change_percentage_24h: 2.4,
      high_24h: 99200,
      low_24h: 95800,
    },
    'ethereum': {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      current_price: 3450,
      market_cap: 415000000000,
      total_volume: 18000000000,
      price_change_percentage_24h: 3.1,
      high_24h: 3520,
      low_24h: 3340,
    },
    'solana': {
      id: 'solana',
      symbol: 'sol',
      name: 'Solana',
      current_price: 198.50,
      market_cap: 92000000000,
      total_volume: 4500000000,
      price_change_percentage_24h: 4.2,
      high_24h: 205.00,
      low_24h: 188.00,
    },
    'fetch-ai': {
      id: 'fetch-ai',
      symbol: 'fet',
      name: 'Fetch.ai',
      current_price: 2.45,
      market_cap: 2100000000,
      total_volume: 450000000,
      price_change_percentage_24h: 8.5,
      high_24h: 2.52,
      low_24h: 2.21,
    },
    'bittensor': {
      id: 'bittensor',
      symbol: 'tao',
      name: 'Bittensor',
      current_price: 485.20,
      market_cap: 3200000000,
      total_volume: 89000000,
      price_change_percentage_24h: 5.2,
      high_24h: 498.00,
      low_24h: 462.00,
    },
    'render-token': {
      id: 'render-token',
      symbol: 'render',
      name: 'Render',
      current_price: 8.75,
      market_cap: 3400000000,
      total_volume: 320000000,
      price_change_percentage_24h: -2.3,
      high_24h: 9.10,
      low_24h: 8.45,
    },
    'ondo-finance': {
      id: 'ondo-finance',
      symbol: 'ondo',
      name: 'Ondo Finance',
      current_price: 1.85,
      market_cap: 2800000000,
      total_volume: 180000000,
      price_change_percentage_24h: 12.4,
      high_24h: 1.92,
      low_24h: 1.62,
    },
    'pepe': {
      id: 'pepe',
      symbol: 'pepe',
      name: 'Pepe',
      current_price: 0.0000234,
      market_cap: 9800000000,
      total_volume: 2100000000,
      price_change_percentage_24h: 15.7,
      high_24h: 0.0000248,
      low_24h: 0.0000198,
    },
    'shiba-inu': {
      id: 'shiba-inu',
      symbol: 'shib',
      name: 'Shiba Inu',
      current_price: 0.0000245,
      market_cap: 14500000000,
      total_volume: 890000000,
      price_change_percentage_24h: 6.8,
      high_24h: 0.0000258,
      low_24h: 0.0000228,
    },
    'dogecoin': {
      id: 'dogecoin',
      symbol: 'doge',
      name: 'Dogecoin',
      current_price: 0.42,
      market_cap: 62000000000,
      total_volume: 3200000000,
      price_change_percentage_24h: 8.2,
      high_24h: 0.44,
      low_24h: 0.38,
    },
    'bonk': {
      id: 'bonk',
      symbol: 'bonk',
      name: 'Bonk',
      current_price: 0.0000345,
      market_cap: 2400000000,
      total_volume: 580000000,
      price_change_percentage_24h: 12.4,
      high_24h: 0.0000368,
      low_24h: 0.0000298,
    },
    'dogwifcoin': {
      id: 'dogwifcoin',
      symbol: 'wif',
      name: 'dogwifhat',
      current_price: 2.85,
      market_cap: 2850000000,
      total_volume: 890000000,
      price_change_percentage_24h: 18.5,
      high_24h: 3.12,
      low_24h: 2.35,
    },
    'floki': {
      id: 'floki',
      symbol: 'floki',
      name: 'FLOKI',
      current_price: 0.000245,
      market_cap: 2350000000,
      total_volume: 420000000,
      price_change_percentage_24h: 9.8,
      high_24h: 0.000262,
      low_24h: 0.000218,
    },
    'arbitrum': {
      id: 'arbitrum',
      symbol: 'arb',
      name: 'Arbitrum',
      current_price: 1.25,
      market_cap: 4800000000,
      total_volume: 680000000,
      price_change_percentage_24h: 5.6,
      high_24h: 1.32,
      low_24h: 1.18,
    },
    'optimism': {
      id: 'optimism',
      symbol: 'op',
      name: 'Optimism',
      current_price: 2.45,
      market_cap: 2900000000,
      total_volume: 320000000,
      price_change_percentage_24h: 4.2,
      high_24h: 2.58,
      low_24h: 2.32,
    },
    'uniswap': {
      id: 'uniswap',
      symbol: 'uni',
      name: 'Uniswap',
      current_price: 14.85,
      market_cap: 8900000000,
      total_volume: 580000000,
      price_change_percentage_24h: 6.4,
      high_24h: 15.42,
      low_24h: 13.92,
    },
    'chainlink': {
      id: 'chainlink',
      symbol: 'link',
      name: 'Chainlink',
      current_price: 24.50,
      market_cap: 15200000000,
      total_volume: 1200000000,
      price_change_percentage_24h: 7.8,
      high_24h: 25.80,
      low_24h: 22.60,
    },
  };

  return coinIds.map(id => mockPrices[id]).filter(Boolean);
}

function getMockHistoricalData(days: number): HistoricalData {
  const now = Date.now();
  const interval = (days * 24 * 60 * 60 * 1000) / 100;

  const prices: [number, number][] = [];
  let price = 100;

  for (let i = 0; i < 100; i++) {
    const timestamp = now - (100 - i) * interval;
    price = price * (1 + (Math.random() - 0.48) * 0.05);
    prices.push([timestamp, price]);
  }

  return {
    prices,
    market_caps: prices.map(([t, p]) => [t, p * 1000000]),
    total_volumes: prices.map(([t, p]) => [t, p * 50000]),
  };
}
