export type AccountType = 'demo' | 'real';
export type CurrencyType = 'BRL' | 'USD';
export type TradeDirection = 'call' | 'put';
export type TradeStatus = 'aberta' | 'ganho' | 'perda';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  payout: number; // e.g. 92%
  category: 'currencies' | 'crypto' | 'commodities' | 'indices';
  isOTC: boolean;
  basePrice: number;
  digits: number;
  change24h: number;
}

export interface OrionOperation {
  id: string;
  ativo: string;
  ticker: string;
  direcao: TradeDirection;
  aberta_em: number; // timestamp ms
  expira_em: number; // timestamp ms
  duracao_s: number;
  valor: number;
  taxa_abertura: number;
  taxa_fechamento?: number;
  lucro?: number;
  estado: TradeStatus;
  payout: number;
}

export interface OrionBotState {
  ligado: boolean;
  conta: AccountType;
  saldo_demo: number;
  saldo_real: number;
  moeda: CurrencyType;
  lucro: number;
  meta_valor: number;
  meta_pct: number;
  meta_tipo: 'valor' | 'pct';
  progresso_pct: number;
  ganhos: number;
  perdas: number;
  proxima_em_s: number;
  sessao_termina_em_s: number;
  espera_em_s: number;
  tem_aberta: boolean;
  expiracao_s: number;
  aviso: string;
  robo_ligado_na_corretora: boolean;
  pode_conta_real: boolean;
  operacoes: OrionOperation[];
  confidence: number;
  activeDirection: TradeDirection | null;
}

export interface BotStrategyConfig {
  speedMultiplier: 1 | 2 | 5;
  winProbability: number; // 0.5 to 0.95
  martingaleEnabled: boolean;
  martingaleMultiplier: number;
  sorosEnabled: boolean;
  expirationSeconds: number; // 5, 15, 30, 60
}
