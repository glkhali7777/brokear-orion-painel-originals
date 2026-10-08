import React, { useState } from 'react';
import { Asset, CurrencyType, TradeDirection } from '../types/trading';
import { sounds } from '../utils/audio';

interface BrokerTradingPanelProps {
  asset: Asset;
  currency: CurrencyType;
  onManualTrade: (direction: TradeDirection, amount: number, expirationSeconds: number) => void;
  className?: string;
}

export const BrokerTradingPanel: React.FC<BrokerTradingPanelProps> = ({
  asset,
  currency,
  onManualTrade,
  className = "",
}) => {
  const [amount, setAmount] = useState<number>(25);
  const [expirationSeconds, setExpirationSeconds] = useState<number>(5);

  const formatMoney = (val: number) => {
    const symbol = currency === 'USD' ? '$' : 'R$';
    return `${symbol} ${Number(val).toFixed(2)}`;
  };

  const payoutProfit = Number((amount * (asset.payout / 100)).toFixed(2));

  return (
    <div
      data-testid="tradingPanel"
      className={`bg-[#0A0D12] border-l border-white/10 p-3 flex flex-col justify-between gap-3 text-white select-none ${className}`}
    >
      <div className="flex flex-col gap-3">
        {/* Expiration Selector */}
        <div data-testid="expirationSelector" className="flex flex-col gap-1">
          <label className="text-[10px] font-['Rajdhani'] font-bold text-[#AEB7C2] tracking-wider uppercase">
            TEMPO DE EXPIRAÇÃO
          </label>
          <div className="grid grid-cols-4 gap-1">
            {[5, 15, 30, 60].map(sec => (
              <button
                key={sec}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setExpirationSeconds(sec);
                }}
                className={`py-1.5 rounded text-xs font-['Rajdhani'] font-bold border transition-colors ${
                  expirationSeconds === sec
                    ? 'border-[#1FCB6B] bg-[#1FCB6B]/20 text-white'
                    : 'border-white/10 bg-white/5 text-[#8A929C] hover:text-white'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Investment Amount */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-['Rajdhani'] font-bold text-[#AEB7C2] tracking-wider uppercase">
            INVESTIMENTO
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setAmount(prev => Math.max(5, prev - 10));
              }}
              className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 border border-white/10 font-bold flex items-center justify-center text-[#9AA3AE] hover:text-white"
            >
              -
            </button>
            <div className="flex-1 bg-[#12161F] border border-white/15 rounded px-2.5 py-1.5 font-['Rajdhani'] font-bold text-[17px] text-center tabular-nums">
              {formatMoney(amount)}
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setAmount(prev => prev + 10);
              }}
              className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 border border-white/10 font-bold flex items-center justify-center text-[#9AA3AE] hover:text-white"
            >
              +
            </button>
          </div>
        </div>

        {/* Return Plate */}
        <div
          data-testid="ReturnPlate"
          className="bg-[#121720] border border-white/10 rounded-lg p-2.5 flex items-center justify-between"
        >
          <div className="flex flex-col">
            <span className="text-[9px] font-['Rajdhani'] font-bold text-[#AEB7C2] uppercase">
              LUCRO ESTIMADO
            </span>
            <span className="font-['Rajdhani'] font-extrabold text-[16px] text-[#00E87A] tabular-nums">
              +{formatMoney(payoutProfit)}
            </span>
          </div>
          <span className="font-['Rajdhani'] font-extrabold text-[15px] text-[#1FCB6B] bg-[#1FCB6B]/15 px-2 py-0.5 rounded">
            +{asset.payout}%
          </span>
        </div>
      </div>

      {/* HIGHER / LOWER BUTTONS */}
      <div className="flex flex-col gap-2">
        <button
          data-testid="higherButton"
          type="button"
          onClick={() => {
            sounds.playSignalAlert(true);
            onManualTrade('call', amount, expirationSeconds);
          }}
          className="w-full py-3 px-4 rounded-lg font-['Rajdhani'] font-extrabold text-[15px] tracking-[0.08em] text-[#04150C] bg-gradient-to-b from-[#33E084] via-[#1FCB6B] to-[#15A957] shadow-[0_2px_0_#0B6E39,0_7px_16px_rgba(31,203,107,0.34)] active:translate-y-0.5 transition-all flex items-center justify-between cursor-pointer"
        >
          <span>HIGHER (COMPRA)</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>

        <button
          data-testid="lowerButton"
          type="button"
          onClick={() => {
            sounds.playSignalAlert(false);
            onManualTrade('put', amount, expirationSeconds);
          }}
          className="w-full py-3 px-4 rounded-lg font-['Rajdhani'] font-extrabold text-[15px] tracking-[0.08em] text-[#1B0409] bg-gradient-to-b from-[#FF6C80] via-[#E2455A] to-[#BF2438] shadow-[0_2px_0_#7E1524,0_7px_16px_rgba(226,69,90,0.34)] active:translate-y-0.5 transition-all flex items-center justify-between cursor-pointer"
        >
          <span>LOWER (VENDA)</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </div>
  );
};
