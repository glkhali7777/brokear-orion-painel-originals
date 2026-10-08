import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Asset,
  Candle,
  OrionBotState,
  OrionOperation,
  BotStrategyConfig,
  TradeDirection,
  AccountType,
  CurrencyType,
} from './types/trading';
import { INITIAL_ASSETS, generateInitialCandles } from './data/mockAssets';
import { CandlestickChart } from './components/CandlestickChart';
import { OrionPanel } from './components/OrionPanel';
import { BrokerHeader } from './components/BrokerHeader';
import { BrokerTradingPanel } from './components/BrokerTradingPanel';
import { TradesHistoryView } from './components/TradesHistoryView';
import { AssetSelectorModal } from './components/AssetSelectorModal';
import { ScriptInspectorDrawer } from './components/ScriptInspectorDrawer';
import { OrionLogoText } from './components/OrionSVGIcons';
import { sounds } from './utils/audio';

export default function App() {
  // Navigation Route
  const [currentRoute, setCurrentRoute] = useState<'traderoom' | 'trades'>('traderoom');

  // Asset State
  const [assets] = useState<Asset[]>(INITIAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<Asset>(INITIAL_ASSETS[0]);
  const [candles, setCandles] = useState<Candle[]>(() => generateInitialCandles(INITIAL_ASSETS[0], 55, 5));

  // Account Balances
  const [currency, setCurrency] = useState<CurrencyType>('BRL');
  const [accountType, setAccountType] = useState<AccountType>('demo');
  const [demoBalance, setDemoBalance] = useState<number>(50000.0);
  const [realBalance, setRealBalance] = useState<number>(2500.0);

  // Strategy & Simulation Configuration
  const [strategyConfig, setStrategyConfig] = useState<BotStrategyConfig>({
    speedMultiplier: 1,
    winProbability: 0.78,
    martingaleEnabled: true,
    martingaleMultiplier: 2.1,
    sorosEnabled: false,
    expirationSeconds: 5,
  });

  // UI Modals & Drawers
  const [isAssetSelectorOpen, setIsAssetSelectorOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showNativePanel, setShowNativePanel] = useState<boolean>(false);

  // Initial Splash Screen
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  // Bot State (matching /api/fx/estado schema from extracted script)
  const [botState, setBotState] = useState<OrionBotState>({
    ligado: false,
    conta: 'demo',
    saldo_demo: 50000.0,
    saldo_real: 2500.0,
    moeda: 'BRL',
    lucro: 0,
    meta_valor: 100,
    meta_pct: 20,
    meta_tipo: 'valor',
    progresso_pct: 0,
    ganhos: 0,
    perdas: 0,
    proxima_em_s: 0,
    sessao_termina_em_s: 1800, // 30 minutes
    espera_em_s: 0,
    tem_aberta: false,
    expiracao_s: 5,
    aviso: '',
    robo_ligado_na_corretora: true,
    pode_conta_real: true,
    operacoes: [],
    confidence: 0,
    activeDirection: null,
  });

  // Helper toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // Re-generate candles when asset changes
  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setCandles(generateInitialCandles(asset, 55, 5));
  };

  // Real-time Tick Engine (Simulates Live Candlestick Movement)
  useEffect(() => {
    const tickInterval = 600 / strategyConfig.speedMultiplier;

    const interval = setInterval(() => {
      setCandles(prevCandles => {
        if (prevCandles.length === 0) return prevCandles;

        const last = prevCandles[prevCandles.length - 1];
        const now = Date.now();
        const candleAge = now - last.time;
        const candleDurationMs = strategyConfig.expirationSeconds * 1000;

        // Volatility calculation
        const volatility = selectedAsset.basePrice * (selectedAsset.category === 'crypto' ? 0.0003 : 0.00008);
        const randomDelta = (Math.random() - 0.495) * volatility;
        const newClose = Number((last.close + randomDelta).toFixed(selectedAsset.digits));
        const newHigh = Number(Math.max(last.high, newClose).toFixed(selectedAsset.digits));
        const newLow = Number(Math.min(last.low, newClose).toFixed(selectedAsset.digits));

        if (candleAge < candleDurationMs) {
          // Update current candle
          const updated: Candle = {
            ...last,
            close: newClose,
            high: newHigh,
            low: newLow,
            volume: last.volume + 1,
          };
          return [...prevCandles.slice(0, -1), updated];
        } else {
          // Create new candle
          const newCandle: Candle = {
            time: now,
            open: last.close,
            close: newClose,
            high: Math.max(last.close, newClose),
            low: Math.min(last.close, newClose),
            volume: 1,
          };
          return [...prevCandles.slice(-60), newCandle];
        }
      });
    }, tickInterval);

    return () => clearInterval(interval);
  }, [selectedAsset, strategyConfig.speedMultiplier, strategyConfig.expirationSeconds]);

  // Keep botState synced with balances and currency
  useEffect(() => {
    setBotState(prev => ({
      ...prev,
      saldo_demo: demoBalance,
      saldo_real: realBalance,
      moeda: currency,
    }));
  }, [demoBalance, realBalance, currency]);

  // Track active operation state for the bot engine
  const activeOpRef = useRef<OrionOperation | null>(null);
  const baseBetRef = useRef<number>(25);
  const currentBetRef = useRef<number>(25);

  // START BOT HANDLER (/api/fx/ligar)
  const handleStartBot = (config: {
    valor: number;
    meta_valor?: number;
    meta_pct?: number;
    conta: AccountType;
  }) => {
    const currentBal = config.conta === 'demo' ? demoBalance : realBalance;
    if (currentBal < config.valor) {
      showToast("Saldo insuficiente para iniciar.");
      return;
    }

    const calculatedMeta = config.meta_valor ?? (currentBal * (config.meta_pct ?? 20)) / 100;
    baseBetRef.current = config.valor;
    currentBetRef.current = config.valor;

    setAccountType(config.conta);
    setBotState(prev => ({
      ...prev,
      ligado: true,
      conta: config.conta,
      lucro: 0,
      meta_valor: calculatedMeta,
      progresso_pct: 0,
      proxima_em_s: 4, // 4s countdown before first signal
      sessao_termina_em_s: 1800,
      tem_aberta: false,
      activeDirection: null,
      confidence: 0,
    }));

    showToast("Orion Bot conectado ao BrokerQX!");
  };

  // STOP BOT HANDLER (/api/fx/desligar)
  const handleStopBot = () => {
    setBotState(prev => ({
      ...prev,
      ligado: false,
      tem_aberta: false,
      activeDirection: null,
      confidence: 0,
    }));
    activeOpRef.current = null;
    showToast("Orion Bot finalizado.");
  };

  // BOT AUTOMATED TRADING LOOP
  useEffect(() => {
    if (!botState.ligado) return;

    const tickMs = 1000 / strategyConfig.speedMultiplier;
    const interval = setInterval(() => {
      setBotState(prev => {
        if (!prev.ligado) return prev;

        // Decrement session timer
        const newSessao = Math.max(0, prev.sessao_termina_em_s - 1);
        if (newSessao <= 0) {
          showToast("Tempo de sessão esgotado.");
          return { ...prev, ligado: false, sessao_termina_em_s: 0 };
        }

        // Case 1: Active Trade in Progress
        if (prev.tem_aberta && activeOpRef.current) {
          const op = activeOpRef.current;
          const elapsed = (Date.now() - op.aberta_em) / 1000;

          if (elapsed >= op.duracao_s) {
            // TRADE RESOLUTION
            const latestPrice = candles[candles.length - 1]?.close || selectedAsset.basePrice;
            const isCall = op.direcao === 'call';

            // Determine win based on price movement or configured edge
            const priceDifference = latestPrice - op.taxa_abertura;
            const naturalWin = isCall ? priceDifference > 0 : priceDifference < 0;
            // High-probability edge algorithm
            const isWin = Math.random() < strategyConfig.winProbability ? true : naturalWin;

            const profit = isWin ? Number((op.valor * (op.payout / 100)).toFixed(2)) : -op.valor;

            const completedOp: OrionOperation = {
              ...op,
              taxa_fechamento: latestPrice,
              lucro: profit,
              estado: isWin ? 'ganho' : 'perda',
            };

            // Update balance
            if (prev.conta === 'demo') {
              setDemoBalance(b => Number((b + (isWin ? op.valor + profit : 0)).toFixed(2)));
            } else {
              setRealBalance(b => Number((b + (isWin ? op.valor + profit : 0)).toFixed(2)));
            }

            // Audio cues
            if (isWin) {
              sounds.playWin();
            } else {
              sounds.playLoss();
            }

            // Martingale sizing
            if (!isWin && strategyConfig.martingaleEnabled) {
              currentBetRef.current = Number((currentBetRef.current * strategyConfig.martingaleMultiplier).toFixed(2));
            } else {
              currentBetRef.current = baseBetRef.current;
            }

            activeOpRef.current = null;

            const newLucro = Number((prev.lucro + profit).toFixed(2));
            const newGanhos = isWin ? prev.ganhos + 1 : prev.ganhos;
            const newPerdas = isWin ? prev.perdas : prev.perdas + 1;
            const newProgresso = prev.meta_valor > 0 ? (newLucro / prev.meta_valor) * 100 : 0;

            // Target reached check
            if (newLucro >= prev.meta_valor) {
              setTimeout(() => {
                showToast(`Meta de lucro atingida! +${prev.moeda === 'USD' ? '$' : 'R$'} ${newLucro}`);
                handleStopBot();
              }, 400);
            }

            return {
              ...prev,
              tem_aberta: false,
              activeDirection: null,
              confidence: 0,
              lucro: newLucro,
              ganhos: newGanhos,
              perdas: newPerdas,
              progresso_pct: Math.max(0, Math.min(100, newProgresso)),
              proxima_em_s: 6 + Math.floor(Math.random() * 6), // 6-12s cooldown to next scan
              operacoes: [completedOp, ...prev.operacoes],
            };
          }

          return prev;
        }

        // Case 2: Countdown to Next Signal
        if (prev.proxima_em_s > 1) {
          return {
            ...prev,
            proxima_em_s: prev.proxima_em_s - 1,
          };
        }

        // Case 3: Ready to Trigger New Signal!
        if (prev.proxima_em_s <= 1 && !prev.tem_aberta) {
          const currentBal = prev.conta === 'demo' ? demoBalance : realBalance;
          const betAmount = currentBetRef.current;

          if (currentBal < betAmount) {
            showToast("Saldo insuficiente para próxima entrada.");
            return { ...prev, ligado: false };
          }

          // Technical analysis decision: Trend momentum + random fluctuation
          const lastCandle = candles[candles.length - 1];
          const prevCandle = candles[candles.length - 2] || lastCandle;
          const isUp = (lastCandle?.close || 0) >= (prevCandle?.close || 0);
          const direction: TradeDirection = Math.random() < 0.6 ? (isUp ? 'call' : 'put') : isUp ? 'put' : 'call';
          const confidence = 70 + Math.floor(Math.random() * 24); // 70% to 94%

          sounds.playSignalAlert(direction === 'call');

          // Deduct stake upfront
          if (prev.conta === 'demo') {
            setDemoBalance(b => Number((b - betAmount).toFixed(2)));
          } else {
            setRealBalance(b => Number((b - betAmount).toFixed(2)));
          }

          const currentPrice = lastCandle ? lastCandle.close : selectedAsset.basePrice;
          const now = Date.now();
          const duration = strategyConfig.expirationSeconds;

          const newOp: OrionOperation = {
            id: `orion_${now}`,
            ativo: selectedAsset.id,
            ticker: selectedAsset.ticker,
            direcao: direction,
            aberta_em: now,
            expira_em: now + duration * 1000,
            duracao_s: duration,
            valor: betAmount,
            taxa_abertura: currentPrice,
            estado: 'aberta',
            payout: selectedAsset.payout,
          };

          activeOpRef.current = newOp;

          return {
            ...prev,
            tem_aberta: true,
            activeDirection: direction,
            confidence: confidence,
            proxima_em_s: 0,
            operacoes: [newOp, ...prev.operacoes],
          };
        }

        return prev;
      });
    }, tickMs);

    return () => clearInterval(interval);
  }, [
    botState.ligado,
    candles,
    demoBalance,
    realBalance,
    selectedAsset,
    strategyConfig,
    showToast,
  ]);

  // MANUAL TRADE HANDLER (from BrokerTradingPanel)
  const handleManualTrade = (direction: TradeDirection, amount: number, expirationSeconds: number) => {
    const currentBal = accountType === 'demo' ? demoBalance : realBalance;
    if (currentBal < amount) {
      showToast("Saldo insuficiente.");
      return;
    }

    if (accountType === 'demo') {
      setDemoBalance(b => Number((b - amount).toFixed(2)));
    } else {
      setRealBalance(b => Number((b - amount).toFixed(2)));
    }

    sounds.playTradeOpen();
    const lastCandle = candles[candles.length - 1];
    const currentPrice = lastCandle ? lastCandle.close : selectedAsset.basePrice;
    const now = Date.now();

    const manualOp: OrionOperation = {
      id: `manual_${now}`,
      ativo: selectedAsset.id,
      ticker: selectedAsset.ticker,
      direcao: direction,
      aberta_em: now,
      expira_em: now + expirationSeconds * 1000,
      duracao_s: expirationSeconds,
      valor: amount,
      taxa_abertura: currentPrice,
      estado: 'aberta',
      payout: selectedAsset.payout,
    };

    setBotState(prev => ({
      ...prev,
      operacoes: [manualOp, ...prev.operacoes],
    }));

    // Settle manual trade after duration
    setTimeout(() => {
      const exitPrice = candles[candles.length - 1]?.close || currentPrice;
      const priceDifference = exitPrice - currentPrice;
      const isCall = direction === 'call';
      const isWin = isCall ? priceDifference > 0 : priceDifference < 0;
      const profit = isWin ? Number((amount * (selectedAsset.payout / 100)).toFixed(2)) : -amount;

      if (accountType === 'demo') {
        setDemoBalance(b => Number((b + (isWin ? amount + profit : 0)).toFixed(2)));
      } else {
        setRealBalance(b => Number((b + (isWin ? amount + profit : 0)).toFixed(2)));
      }

      if (isWin) sounds.playWin();
      else sounds.playLoss();

      setBotState(prev => ({
        ...prev,
        operacoes: prev.operacoes.map(o =>
          o.id === manualOp.id
            ? { ...o, taxa_fechamento: exitPrice, lucro: profit, estado: isWin ? 'ganho' : 'perda' }
            : o
        ),
      }));

      showToast(isWin ? `Vitória! +${currency === 'USD' ? '$' : 'R$'} ${profit}` : `Derrota: -${currency === 'USD' ? '$' : 'R$'} ${amount}`);
    }, (expirationSeconds * 1000) / strategyConfig.speedMultiplier);
  };

  // Reset Demo Balance
  const handleResetDemo = () => {
    setDemoBalance(currency === 'USD' ? 10000 : 50000);
    showToast("Saldo Demo recarregado!");
  };

  // Deposit Real Balance
  const handleDepositReal = () => {
    setRealBalance(prev => prev + (currency === 'USD' ? 500 : 2500));
    showToast("Depósito simulado adicionado com sucesso!");
  };

  // Active operations for chart rendering
  const activeOperations = botState.operacoes.filter(op => op.estado === 'aberta');

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#06080B] flex flex-col font-['Plus_Jakarta_Sans'] select-none">
      {/* INITIAL BOOT SPLASH SCREEN (#abertura) */}
      {showSplash && (
        <div className="fixed inset-0 z-[100] bg-[#06080B] flex flex-col items-center justify-center pointer-events-none transition-opacity duration-700">
          <div className="relative flex flex-col items-center">
            <OrionLogoText className="h-14 sm:h-16 animate-bounce" />
            <div className="mt-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1FCB6B] animate-ping" />
              <span className="font-['Rajdhani'] font-bold text-xs tracking-[0.25em] text-[#9AA3AE] uppercase">
                INICIALIZANDO MOTOR ORION ULTRA...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TOP BROKER HEADER BAR */}
      <BrokerHeader
        currentAsset={selectedAsset}
        assets={assets}
        onSelectAsset={handleSelectAsset}
        onOpenAssetSelector={() => setIsAssetSelectorOpen(true)}
        accountType={accountType}
        onChangeAccountType={setAccountType}
        demoBalance={demoBalance}
        realBalance={realBalance}
        currency={currency}
        onResetDemo={handleResetDemo}
        onDepositReal={handleDepositReal}
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          sounds.setEnabled(next);
        }}
        onOpenInspector={() => setIsInspectorOpen(true)}
      />

      {/* MAIN VIEWPORT: TRADEROOM vs TRADES HISTORY */}
      {currentRoute === 'trades' ? (
        <TradesHistoryView
          operations={botState.operacoes}
          currency={currency}
          onBackToTraderoom={() => setCurrentRoute('traderoom')}
        />
      ) : (
        <main className="relative flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* CENTER: Candlestick Chart Area */}
          <div className="relative flex-1 h-full min-h-0 overflow-hidden flex flex-col">
            <CandlestickChart
              asset={selectedAsset}
              candles={candles}
              activeOperations={activeOperations}
              timeframeSeconds={strategyConfig.expirationSeconds}
              className="flex-1 w-full h-full"
            />

            {/* Quick Panel Toggle Bar at bottom-left */}
            <div className="absolute bottom-2 left-2 z-20 hidden sm:flex items-center gap-2 bg-[#0C1017]/85 backdrop-blur-sm border border-white/10 px-2 py-1 rounded-lg text-[11px] font-['Rajdhani'] font-bold">
              <span className="text-[#8A929C]">PAINEL NATIVO BROKER:</span>
              <button
                type="button"
                onClick={() => setShowNativePanel(prev => !prev)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  showNativePanel ? 'bg-[#1FCB6B] text-[#04150C]' : 'bg-white/10 text-white'
                }`}
              >
                {showNativePanel ? 'ATIVO' : 'OCULTO (MODO ORION)'}
              </button>
            </div>
          </div>

          {/* RIGHT / BOTTOM: Trading Panels */}
          {/* 1. Optional BrokerQX Native Panel */}
          {showNativePanel && (
            <BrokerTradingPanel
              asset={selectedAsset}
              currency={currency}
              onManualTrade={handleManualTrade}
              className="w-full md:w-64 h-auto md:h-full border-t md:border-t-0 md:border-l border-white/10 shrink-0"
            />
          )}

          {/* 2. Orion Bot Panel Overlay (The Extracted Injected HUD) */}
          <aside className="w-full md:w-[320px] lg:w-[340px] shrink-0 border-t md:border-t-0 md:border-l border-white/10 bg-[#0A0C10] flex flex-col justify-end shadow-2xl">
            <OrionPanel
              botState={botState}
              onStartBot={handleStartBot}
              onStopBot={handleStopBot}
              onToggleHistory={() => setCurrentRoute('trades')}
              inHistoryView={false}
              toastMessage={toastMessage}
              className="w-full"
            />
          </aside>
        </main>
      )}

      {/* ASSET SELECTOR MODAL */}
      <AssetSelectorModal
        isOpen={isAssetSelectorOpen}
        onClose={() => setIsAssetSelectorOpen(false)}
        assets={assets}
        selectedAsset={selectedAsset}
        onSelectAsset={handleSelectAsset}
      />

      {/* SCRIPT & PARAMETER INSPECTOR DRAWER */}
      <ScriptInspectorDrawer
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        botState={botState}
        strategyConfig={strategyConfig}
        onUpdateStrategy={cfg => setStrategyConfig(prev => ({ ...prev, ...cfg }))}
        currency={currency}
        onChangeCurrency={setCurrency}
      />
    </div>
  );
}
