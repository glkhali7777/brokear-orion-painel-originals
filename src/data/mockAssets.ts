import { Asset, Candle } from '../types/trading';

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'EURUSD_OTC',
    ticker: 'EURUSD OTC',
    name: 'Euro / US Dollar OTC',
    payout: 93,
    category: 'currencies',
    isOTC: true,
    basePrice: 1.08450,
    digits: 5,
    change24h: 0.42,
  },
  {
    id: 'GBPUSD_OTC',
    ticker: 'GBPUSD OTC',
    name: 'British Pound / US Dollar OTC',
    payout: 91,
    category: 'currencies',
    isOTC: true,
    basePrice: 1.29320,
    digits: 5,
    change24h: -0.18,
  },
  {
    id: 'USDJPY_OTC',
    ticker: 'USDJPY OTC',
    name: 'US Dollar / Japanese Yen OTC',
    payout: 89,
    category: 'currencies',
    isOTC: true,
    basePrice: 154.680,
    digits: 3,
    change24h: 0.85,
  },
  {
    id: 'AUDCAD_OTC',
    ticker: 'AUDCAD OTC',
    name: 'Australian Dollar / Canadian Dollar OTC',
    payout: 88,
    category: 'currencies',
    isOTC: true,
    basePrice: 0.89420,
    digits: 5,
    change24h: 0.12,
  },
  {
    id: 'BTCUSD_OTC',
    ticker: 'BTCUSD OTC',
    name: 'Bitcoin / US Dollar OTC',
    payout: 90,
    category: 'crypto',
    isOTC: true,
    basePrice: 68420.50,
    digits: 2,
    change24h: 2.34,
  },
  {
    id: 'ETHUSD_OTC',
    ticker: 'ETHUSD OTC',
    name: 'Ethereum / US Dollar OTC',
    payout: 87,
    category: 'crypto',
    isOTC: true,
    basePrice: 2640.25,
    digits: 2,
    change24h: -1.05,
  },
  {
    id: 'SUIUSD_OTC',
    ticker: 'SUIUSD-OTC',
    name: 'Sui / US Dollar OTC',
    payout: 86,
    category: 'crypto',
    isOTC: true,
    basePrice: 1.18850,
    digits: 4,
    change24h: 3.12,
  },
  {
    id: 'USDARS_OTC',
    ticker: 'USDARS-OTC',
    name: 'US Dollar / Peso Argentino OTC',
    payout: 88,
    category: 'currencies',
    isOTC: true,
    basePrice: 1522.45,
    digits: 2,
    change24h: 0.05,
  },
  {
    id: 'EURCHF_OTC',
    ticker: 'EURCHF-OTC',
    name: 'Euro / Swiss Franc OTC',
    payout: 86,
    category: 'currencies',
    isOTC: true,
    basePrice: 0.92905,
    digits: 5,
    change24h: -0.22,
  },
  {
    id: 'NZDJPY_OTC',
    ticker: 'NZDJPY-OTC',
    name: 'New Zealand Dollar / Yen OTC',
    payout: 86,
    category: 'currencies',
    isOTC: true,
    basePrice: 88.835,
    digits: 3,
    change24h: 0.64,
  },
  {
    id: 'CRYPTOIDX_OTC',
    ticker: 'CRYPTOIDX-OTC',
    name: 'Crypto Top 10 Index OTC',
    payout: 86,
    category: 'indices',
    isOTC: true,
    basePrice: 925.50,
    digits: 2,
    change24h: 1.45,
  },
];

export function generateInitialCandles(asset: Asset, count = 60, intervalSeconds = 5): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  const startTime = now - count * intervalSeconds * 1000;
  let currentPrice = asset.basePrice;
  const volatility = asset.basePrice * (asset.category === 'crypto' ? 0.0008 : 0.0002);

  for (let i = 0; i < count; i++) {
    const time = startTime + i * intervalSeconds * 1000;
    const delta = (Math.random() - 0.495) * volatility;
    const open = currentPrice;
    const close = Number((open + delta).toFixed(asset.digits));
    const high = Number((Math.max(open, close) + Math.random() * volatility * 0.8).toFixed(asset.digits));
    const low = Number((Math.min(open, close) - Math.random() * volatility * 0.8).toFixed(asset.digits));
    const volume = Math.floor(Math.random() * 50) + 10;

    candles.push({ time, open, high, low, close, volume });
    currentPrice = close;
  }

  return candles;
}
