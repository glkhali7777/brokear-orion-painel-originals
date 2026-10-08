import React, { useState } from 'react';
import { Asset, AccountType, CurrencyType } from '../types/trading';
import { sounds } from '../utils/audio';

interface BrokerHeaderProps {
  currentAsset: Asset;
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
  onOpenAssetSelector: () => void;
  accountType: AccountType;
  onChangeAccountType: (type: AccountType) => void;
  demoBalance: number;
  realBalance: number;
  currency: CurrencyType;
  onResetDemo: () => void;
  onDepositReal: () => void;
  currentRoute: 'traderoom' | 'trades';
  onNavigate: (route: 'traderoom' | 'trades') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenInspector: () => void;
}

export const BrokerHeader: React.FC<BrokerHeaderProps> = ({
  currentAsset,
  assets,
  onSelectAsset,
  onOpenAssetSelector,
  accountType,
  onChangeAccountType,
  demoBalance,
  realBalance,
  currency,
  onResetDemo,
  onDepositReal,
  currentRoute,
  onNavigate,
  soundEnabled,
  onToggleSound,
  onOpenInspector,
}) => {
  const [balanceDrawerOpen, setBalanceDrawerOpen] = useState(false);

  const formatMoney = (val: number) => {
    const symbol = currency === 'USD' ? '$' : 'R$';
    return `${symbol} ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const currentBalance = accountType === 'demo' ? demoBalance : realBalance;

  return (
    <header className="relative z-20 flex items-center justify-between px-2 sm:px-4 py-1.5 bg-[#0A0D12] border-b border-white/10 select-none">
      {/* LEFT: Broker Brand + Asset Tabs */}
      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-0.5">
        {/* BrokerQX wordmark */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#1FCB6B] to-[#33E084] flex items-center justify-center font-bold text-[#04150C] text-[13px] shadow-[0_0_12px_rgba(31,203,107,0.35)]">
            QX
          </div>
          <span className="font-['Rajdhani'] font-extrabold text-[15px] tracking-wider text-white hidden sm:inline">
            BROKER<span className="text-[#1FCB6B]">QX</span>
          </span>
        </div>

        {/* Vertical divider */}
        <div className="h-5 w-px bg-white/10 shrink-0" />

        {/* Asset tabs */}
        <div className="flex items-center gap-1 shrink-0">
          {assets.slice(0, 3).map(asset => {
            const isSelected = asset.id === currentAsset.id;
            return (
              <button
                key={asset.id}
                data-testid={`AssetTab-${asset.id}-blitz`}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onSelectAsset(asset);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-['Rajdhani'] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#18202B] text-white border border-[#1FCB6B]/40 shadow-sm'
                    : 'bg-white/5 text-[#9AA3AE] hover:text-[#E8EBEF] border border-transparent'
                }`}
              >
                <span>{asset.ticker}</span>
                <span className="text-[10px] text-[#1FCB6B] font-mono">+{asset.payout}%</span>
              </button>
            );
          })}

          {/* Plus Add Asset Button */}
          <button
            data-testid="add"
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenAssetSelector();
            }}
            title="Escolher ativo"
            className="w-7 h-7 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-[#9AA3AE] hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>

      {/* RIGHT: Balance Control + Sound + Inspector + Trades Route */}
      <div className="flex items-center gap-2 shrink-0 ml-2">
        {/* Navigation items for tests */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
          <button
            data-testid="NavigationMenuItem-traderoom"
            type="button"
            onClick={() => {
              sounds.playClick();
              onNavigate('traderoom');
            }}
            className={`px-2.5 py-1 text-xs font-['Rajdhani'] font-bold rounded-md transition-colors cursor-pointer ${
              currentRoute === 'traderoom' ? 'bg-[#1FCB6B]/20 text-[#1FCB6B]' : 'text-[#8A929C] hover:text-white'
            }`}
          >
            Gráfico
          </button>
          <button
            data-testid="NavigationMenuItem-trades"
            type="button"
            onClick={() => {
              sounds.playClick();
              onNavigate('trades');
            }}
            className={`px-2.5 py-1 text-xs font-['Rajdhani'] font-bold rounded-md transition-colors cursor-pointer ${
              currentRoute === 'trades' ? 'bg-[#1FCB6B]/20 text-[#1FCB6B]' : 'text-[#8A929C] hover:text-white'
            }`}
          >
            Operações
          </button>
        </div>

        {/* Balance Control Trigger ([data-testid="BalanceControl"]) */}
        <div className="relative">
          <button
            data-testid="BalanceControl"
            type="button"
            onClick={() => {
              sounds.playClick();
              setBalanceDrawerOpen(prev => !prev);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#12161F] hover:bg-[#181F2B] border border-white/15 transition-all cursor-pointer shadow-inner"
          >
            <div className="flex flex-col text-right leading-tight">
              <span className="text-[9px] font-['Rajdhani'] font-bold tracking-wider text-[#9AA3AE] uppercase">
                {accountType === 'demo' ? 'CONTA DEMO' : 'CONTA REAL'}
              </span>
              <span className="font-['Rajdhani'] font-extrabold text-[14px] sm:text-[15px] text-white tabular-nums">
                {formatMoney(currentBalance)}
              </span>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-[#9AA3AE]">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {/* Balance Selector Drawer Modal */}
          {balanceDrawerOpen && (
            <div
              data-testid="DrawerBase-BalanceSelector"
              className="absolute right-0 top-12 z-50 w-64 bg-[#0F131A] border border-white/15 rounded-xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2.5">
                <span className="text-[11px] font-['Rajdhani'] font-bold tracking-wider text-[#9AA3AE] uppercase">
                  SELECIONE SUA CONTA
                </span>
                <button
                  data-testid="header-closeButton"
                  type="button"
                  onClick={() => setBalanceDrawerOpen(false)}
                  className="w-5 h-5 flex items-center justify-center rounded text-[#8A929C] hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Demo Account Row */}
              <div
                data-testid="balanceSelector-row-1"
                onClick={() => {
                  sounds.playClick();
                  onChangeAccountType('demo');
                  setBalanceDrawerOpen(false);
                }}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer mb-2 flex items-center justify-between ${
                  accountType === 'demo'
                    ? 'border-[#1FCB6B] bg-[#1FCB6B]/10 text-white'
                    : 'border-white/10 hover:border-white/20 bg-white/5 text-[#9AA3AE]'
                }`}
              >
                <div>
                  <div className="text-[11px] font-['Rajdhani'] font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1FCB6B]" />
                    CONTA DEMO
                  </div>
                  <div className="font-['Rajdhani'] font-bold text-[16px] text-white tabular-nums">
                    {formatMoney(demoBalance)}
                  </div>
                </div>
                <button
                  type="button"
                  title="Recarregar Demo"
                  onClick={e => {
                    e.stopPropagation();
                    sounds.playClick();
                    onResetDemo();
                  }}
                  className="px-2 py-1 text-[10px] font-['Rajdhani'] font-bold rounded bg-white/10 hover:bg-white/20 text-white"
                >
                  RECARREGAR
                </button>
              </div>

              {/* Real Account Row */}
              <div
                data-testid="balanceSelector-row-2"
                onClick={() => {
                  sounds.playClick();
                  onChangeAccountType('real');
                  setBalanceDrawerOpen(false);
                }}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer mb-3 flex items-center justify-between ${
                  accountType === 'real'
                    ? 'border-[#1FCB6B] bg-[#1FCB6B]/10 text-white'
                    : 'border-white/10 hover:border-white/20 bg-white/5 text-[#9AA3AE]'
                }`}
              >
                <div>
                  <div className="text-[11px] font-['Rajdhani'] font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E9A825]" />
                    CONTA REAL
                  </div>
                  <div className="font-['Rajdhani'] font-bold text-[16px] text-white tabular-nums">
                    {formatMoney(realBalance)}
                  </div>
                </div>
                <button
                  type="button"
                  title="Depositar"
                  onClick={e => {
                    e.stopPropagation();
                    sounds.playClick();
                    onDepositReal();
                  }}
                  className="px-2 py-1 text-[10px] font-['Rajdhani'] font-bold rounded bg-[#1FCB6B] text-[#04150C]"
                >
                  + DEPOSITAR
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Audio Mute/Unmute */}
        <button
          type="button"
          onClick={onToggleSound}
          title={soundEnabled ? "Desativar sons" : "Ativar sons"}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-[#9AA3AE] hover:text-white border border-white/10 transition-colors cursor-pointer"
        >
          {soundEnabled ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-red-400">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>

        {/* Code & Engine Inspector Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onOpenInspector();
          }}
          title="Inspecionar Script e Parâmetros"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1FCB6B]/15 hover:bg-[#1FCB6B]/25 text-[#1FCB6B] border border-[#1FCB6B]/40 font-['Rajdhani'] font-bold text-xs transition-colors cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span className="hidden sm:inline">INSPETOR</span>
        </button>
      </div>
    </header>
  );
};
