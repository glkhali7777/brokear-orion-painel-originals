import React, { useState, useEffect, useRef, useMemo } from 'react';
import { OrionBotState, TradeDirection } from '../types/trading';
import { OrionLogoText, BullVector, BearVector, OracleBadge } from './OrionSVGIcons';
import { sounds } from '../utils/audio';

interface OrionPanelProps {
  botState: OrionBotState;
  onStartBot: (config: { valor: number; meta_valor?: number; meta_pct?: number; conta: 'demo' | 'real' }) => void;
  onStopBot: () => void;
  onToggleHistory: () => void;
  inHistoryView: boolean;
  toastMessage: string | null;
  onDismissToast?: () => void;
  className?: string;
  isFloating?: boolean;
}

export const OrionPanel: React.FC<OrionPanelProps> = ({
  botState,
  onStartBot,
  onStopBot,
  onToggleHistory,
  inHistoryView,
  toastMessage,
  className = "",
  isFloating = false,
}) => {
  // Input states
  const [inputValue, setInputValue] = useState<string>("25");
  const [inputMeta, setInputMeta] = useState<string>("50");
  const [metaIsCurrency, setMetaIsCurrency] = useState<boolean>(true);
  const [selectedAccount, setSelectedAccount] = useState<'demo' | 'real'>(botState.conta || 'demo');

  // Keypad modal
  const [keypadField, setKeypadField] = useState<'valor' | 'meta' | null>(null);
  const [keypadBuffer, setKeypadBuffer] = useState<string>("");

  // Speedometer Gauge State & Animation
  const [needleAngle, setNeedleAngle] = useState<number>(150); // ARCO_INI is 150
  const [gaugeColor, setGaugeColor] = useState<string>("#565E68");
  const [activeAnimal, setActiveAnimal] = useState<'bull' | 'bear' | 'both'>('bull');
  const [animalOpacity, setAnimalOpacity] = useState<number>(0.2);
  const scanAnimRef = useRef<number | null>(null);
  const scanTargetRef = useRef<{ curr: number; target: number; startTime: number; duration: number; pause: number }>({
    curr: 150,
    target: 270,
    startTime: 0,
    duration: 800,
    pause: 0,
  });

  // Scale constants matching the extracted script
  const ARCO_INI = 150;
  const ARCO = 240;
  const R = 86;
  const CIRC = 2 * Math.PI * R;
  const TRACO = CIRC * (ARCO / 360);

  // Online Users simulation counter (+14.2k)
  const [onlineUsers, setOnlineUsers] = useState<string>("+14.8k");
  useEffect(() => {
    const timer = setInterval(() => {
      const base = 14 + Math.random() * 2.5;
      setOnlineUsers(`+${base.toFixed(1)}k`);
    }, 18000);
    return () => clearInterval(timer);
  }, []);

  // Format currency
  const formatMoney = (val: number, moeda: 'BRL' | 'USD') => {
    const symbol = moeda === 'USD' ? '$ ' : 'R$ ';
    return symbol + Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Format countdown clock
  const formatClock = (seconds: number) => {
    const s = Math.max(0, Math.round(seconds || 0));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m < 10 ? '0' : ''}${m}:${rem < 10 ? '0' : ''}${rem}`;
  };

  // Speedometer Needle Logic
  useEffect(() => {
    if (!botState.ligado) {
      // Stopped
      setGaugeColor("#565E68");
      setNeedleAngle(ARCO_INI);
      setActiveAnimal('bull');
      setAnimalOpacity(0.18);
      if (scanAnimRef.current) cancelAnimationFrame(scanAnimRef.current);
      return;
    }

    if (botState.tem_aberta && botState.activeDirection) {
      // Trade is active: lock needle into trade direction with confidence
      if (scanAnimRef.current) cancelAnimationFrame(scanAnimRef.current);
      const isCall = botState.activeDirection === 'call';
      const color = isCall ? "#00E87A" : "#FF2E4C";
      setGaugeColor(color);
      setActiveAnimal(isCall ? 'bull' : 'bear');
      setAnimalOpacity(0.85);

      const pct = Math.max(60, Math.min(95, botState.confidence || 82));
      const targetAngle = ARCO_INI + (pct / 100) * ARCO;
      setNeedleAngle(targetAngle);
      return;
    }

    // Analyzing state: Scanning needle animation
    setGaugeColor("#E9A825");
    setAnimalOpacity(0.25);

    const VMIN = ARCO_INI + 15;
    const VMAX = ARCO_INI + ARCO - 15;
    let lastAnimalSwitch = Date.now();

    const pickTarget = () => {
      const curr = scanTargetRef.current.target;
      let target: number;
      do {
        target = VMIN + Math.random() * (VMAX - VMIN);
      } while (Math.abs(target - curr) < 35);

      scanTargetRef.current = {
        curr,
        target,
        startTime: performance.now(),
        duration: 450 + Math.abs(target - curr) * 3,
        pause: Math.random() < 0.3 ? 150 + Math.random() * 250 : 0,
      };
    };

    pickTarget();

    const step = (now: number) => {
      const st = scanTargetRef.current;
      const elapsed = now - st.startTime;
      const k = Math.min(1, elapsed / st.duration);
      // Cubic easing
      const factor = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const currentDeg = st.curr + (st.target - st.curr) * factor;

      setNeedleAngle(currentDeg);

      // Revolve bull / bear during scan
      if (Date.now() - lastAnimalSwitch > 2400) {
        lastAnimalSwitch = Date.now();
        setActiveAnimal(prev => (prev === 'bull' ? 'bear' : 'bull'));
      }

      if (k >= 1) {
        if (st.pause > 0) {
          st.pause -= 16;
        } else {
          pickTarget();
        }
      }

      scanAnimRef.current = requestAnimationFrame(step);
    };

    scanAnimRef.current = requestAnimationFrame(step);

    return () => {
      if (scanAnimRef.current) cancelAnimationFrame(scanAnimRef.current);
    };
  }, [botState.ligado, botState.tem_aberta, botState.activeDirection, botState.confidence]);

  // Generate 41 scale lines
  const scaleLines = useMemo(() => {
    const lines = [];
    const cx = 120;
    const cy = 120;
    for (let i = 0; i <= 40; i++) {
      const ang = ((ARCO_INI + (i / 40) * ARCO) * Math.PI) / 180;
      const isMajor = i % 5 === 0;
      const r1 = isMajor ? 94 : 96.5;
      const r2 = 101;
      const x1 = cx + r1 * Math.cos(ang);
      const y1 = cy + r1 * Math.sin(ang);
      const x2 = cx + r2 * Math.cos(ang);
      const y2 = cy + r2 * Math.sin(ang);
      lines.push({ i, x1, y1, x2, y2, isMajor });
    }
    return lines;
  }, []);

  // Compute percentage progress along arc
  const currentPct = Math.max(0, Math.min(100, ((needleAngle - ARCO_INI) / ARCO) * 100));
  const courseDashOffset = TRACO * (1 - currentPct / 100);

  // Keypad Actions
  const handleOpenKeypad = (field: 'valor' | 'meta') => {
    sounds.playClick();
    setKeypadField(field);
    setKeypadBuffer(field === 'valor' ? inputValue : inputMeta);
  };

  const handleKeypadPress = (key: string) => {
    sounds.playClick();
    if (key === 'OK') {
      if (keypadField === 'valor') {
        const num = parseFloat(keypadBuffer);
        if (!isNaN(num) && num > 0) setInputValue(keypadBuffer);
      } else if (keypadField === 'meta') {
        const num = parseFloat(keypadBuffer);
        if (!isNaN(num) && num > 0) setInputMeta(keypadBuffer);
      }
      setKeypadField(null);
      return;
    }

    if (key === '<') {
      setKeypadBuffer(prev => prev.slice(0, -1) || '0');
    } else if (key === '.') {
      if (!keypadBuffer.includes('.')) {
        setKeypadBuffer(prev => prev + '.');
      }
    } else {
      setKeypadBuffer(prev => {
        if (prev === '0') return key;
        if (prev.replace('.', '').length >= 7) return prev;
        return prev + key;
      });
    }
  };

  const handleStart = () => {
    sounds.playClick();
    const val = parseFloat(inputValue);
    const metaVal = parseFloat(inputMeta);
    if (!val || val <= 0) return;
    if (!metaVal || metaVal <= 0) return;

    onStartBot({
      valor: val,
      conta: selectedAccount,
      ...(metaIsCurrency ? { meta_valor: metaVal } : { meta_pct: metaVal }),
    });
  };

  const handleStop = () => {
    sounds.playClick();
    onStopBot();
  };

  return (
    <div
      className={`relative flex flex-col bg-[#0A0C10] text-[#E8EBEF] border-t border-white/10 select-none overflow-hidden ${
        isFloating ? 'w-[300px] shadow-2xl rounded-t-xl' : 'w-full max-w-full'
      } ${className}`}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Background dark cyber overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#06080B]/70 via-[#06080B]/80 to-[#06080B]/95" />
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(31,203,107,0.12) 0%, transparent 70%)',
        }}
      />

      {/* TOP HEADER */}
      <div className="relative z-10 flex items-center gap-2 px-3 py-2 bg-[#06080B]/85 border-b border-white/10 shrink-0">
        <OrionLogoText className="h-7 max-w-[150px] shrink-0" />

        {/* Online pulse pill */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#9AA3AE] font-mono tabular-nums whitespace-nowrap ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1FCB6B] shrink-0 animate-ping" />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 opacity-70">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <b className="font-semibold text-[#D6DCE4]">{onlineUsers}</b>
        </div>

        {/* Buttons right */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {botState.ligado && (
            <div className="flex items-center px-1 font-['Rajdhani'] font-extrabold text-[13px] tracking-wider text-white tabular-nums">
              <span>{formatClock(botState.sessao_termina_em_s)}</span>
            </div>
          )}

          {botState.ligado && (
            <button
              onClick={handleStop}
              type="button"
              className="px-2.5 py-1 text-[11px] font-['Rajdhani'] font-extrabold tracking-wider rounded-md text-[#1B0409] bg-gradient-to-b from-[#FF6C80] via-[#E2455A] to-[#BF2438] shadow-[0_2px_0_#7E1524,0_6px_12px_rgba(226,69,90,0.34)] active:translate-y-0.5 transition-all cursor-pointer"
            >
              DESLIGAR
            </button>
          )}

          {/* Trade History Button (toggles /trades view) */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleHistory();
            }}
            title={inHistoryView ? "Voltar ao gráfico" : "Histórico de operações"}
            className={`w-7 h-7 flex items-center justify-center rounded-lg border border-white/15 bg-white/5 transition-colors cursor-pointer ${
              inHistoryView ? 'text-[#1FCB6B] border-[#1FCB6B]/40' : 'text-[#8A929C] hover:text-[#E8EBEF]'
            }`}
          >
            {inHistoryView ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M3 17l6-6 4 4 7-7" />
                <path d="M14 8h6v6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                <path d="M3 4v4h4" />
                <path d="M12 7v5l3.5 2" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* TOAST ALERT OVERLAY */}
      {toastMessage && (
        <div className="absolute top-11 left-1/2 -translate-x-1/2 z-30 max-w-[90%] px-3.5 py-2 rounded-lg bg-[#1A1F27]/95 border border-[#E9A825]/60 text-[#F0D08A] text-[12px] font-medium leading-tight text-center shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* MAIN BODY: SPEEDOMETER GAUGE + CONTROL / STATS PANEL */}
      <div className="relative z-10 flex flex-row items-center justify-between gap-3 px-3 py-2.5 overflow-hidden">
        {/* SPEEDOMETER GAUGE */}
        <div className="relative shrink-0 w-[165px] sm:w-[185px] aspect-square flex items-center justify-center order-2">
          <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
            <defs>
              <radialGradient id="fxDisco" cx="0.5" cy="0.34" r="0.82">
                <stop offset="0%" stopColor="rgba(32,38,47,0.72)" />
                <stop offset="62%" stopColor="rgba(12,15,20,0.78)" />
                <stop offset="100%" stopColor="rgba(4,6,9,0.86)" />
              </radialGradient>
              <filter id="fxBrilho" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3.5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Dial Background circle */}
            <circle cx="120" cy="120" r="112" fill="url(#fxDisco)" />
            <circle cx="120" cy="120" r="112" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

            {/* Bull watermark */}
            <g transform="translate(56, 48) scale(1.28)">
              <BullVector
                className="w-24 h-24"
                color={gaugeColor === '#FF2E4C' ? '#FF2E4C' : '#33E084'}
                opacity={activeAnimal === 'bull' ? animalOpacity : 0}
              />
            </g>

            {/* Bear watermark */}
            <g transform="translate(56, 48) scale(1.28)">
              <BearVector
                className="w-24 h-24"
                color={gaugeColor === '#00E87A' ? '#00E87A' : '#FF2E4C'}
                opacity={activeAnimal === 'bear' ? animalOpacity : 0}
              />
            </g>

            {/* Scale tick marks */}
            <g id="escala">
              {scaleLines.map(line => {
                const isLit = line.i <= Math.round((currentPct / 100) * 40);
                return (
                  <line
                    key={line.i}
                    x1={line.x1.toFixed(1)}
                    y1={line.y1.toFixed(1)}
                    x2={line.x2.toFixed(1)}
                    y2={line.y2.toFixed(1)}
                    stroke={
                      isLit
                        ? gaugeColor
                        : line.isMajor
                        ? 'rgba(255,255,255,0.34)'
                        : 'rgba(255,255,255,0.13)'
                    }
                    strokeWidth={line.isMajor ? 2.4 : 1.6}
                    strokeLinecap="round"
                    className="transition-colors duration-200"
                  />
                );
              })}
            </g>

            {/* Static track arc */}
            <circle
              cx="120"
              cy="120"
              r={R}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${TRACO.toFixed(2)} ${CIRC.toFixed(2)}`}
              transform={`rotate(${ARCO_INI} 120 120)`}
            />

            {/* Dynamic colored progress arc */}
            <circle
              cx="120"
              cy="120"
              r={R}
              fill="none"
              stroke={gaugeColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${TRACO.toFixed(2)} ${CIRC.toFixed(2)}`}
              strokeDashoffset={courseDashOffset.toFixed(2)}
              transform={`rotate(${ARCO_INI} 120 120)`}
              filter="url(#fxBrilho)"
              className="transition-all duration-150"
            />

            {/* Glowing needle */}
            <g transform={`rotate(${needleAngle - 270} 120 120)`}>
              <rect
                x="118.3"
                y="38"
                width="3.4"
                height="84"
                rx="1.7"
                fill={gaugeColor}
                style={{
                  filter: `drop-shadow(0 0 6px ${gaugeColor})`,
                  transition: 'fill 0.35s',
                }}
              />
            </g>

            {/* Center pin housing */}
            <circle cx="120" cy="120" r="9" fill="rgba(10,13,17,0.95)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <circle cx="120" cy="120" r="3.6" fill={gaugeColor} style={{ filter: `drop-shadow(0 0 8px ${gaugeColor})` }} />
          </svg>

          {/* Central digital readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
            <span
              className="font-['Rajdhani'] font-bold text-[32px] sm:text-[36px] leading-none tabular-nums tracking-tight"
              style={{
                color: gaugeColor,
                textShadow: `0 0 20px ${gaugeColor}`,
              }}
            >
              {botState.ligado
                ? botState.tem_aberta
                  ? `${Math.round(botState.confidence || 82)}%`
                  : ''
                : ''}
            </span>
            <span className="font-['Rajdhani'] font-bold text-[9px] sm:text-[10px] tracking-[0.22em] text-[#9AA3AE] uppercase mt-1">
              {!botState.ligado
                ? 'PARADO'
                : botState.tem_aberta
                ? botState.activeDirection === 'put'
                  ? 'VENDA'
                  : 'COMPRA'
                : 'ANALISANDO'}
            </span>
          </div>
        </div>

        {/* CONTROLS / STATS (Left or Right) */}
        <div className="flex-1 flex flex-col justify-center min-w-0 order-1">
          {!botState.ligado ? (
            /* STOPPED / CONFIG STATE */
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                {/* Valor Input */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-['Rajdhani'] font-bold tracking-wider text-[#AEB7C2] uppercase mb-1">
                    VALOR
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenKeypad('valor')}
                    className="w-full bg-[#0A0D12]/90 border border-white/15 rounded-md px-2.5 py-1.5 font-['Rajdhani'] font-bold text-[18px] text-[#E8EBEF] text-left tabular-nums focus:border-[#1FCB6B] hover:border-white/30 transition-colors"
                  >
                    {inputValue}
                  </button>
                </div>

                {/* Meta Input */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-['Rajdhani'] font-bold tracking-wider text-[#AEB7C2] uppercase">
                      META
                    </label>
                    <div className="inline-flex rounded bg-white/5 p-0.5 text-[9px] font-bold">
                      <button
                        type="button"
                        onClick={() => setMetaIsCurrency(false)}
                        className={`px-1.5 py-0.5 rounded ${
                          !metaIsCurrency ? 'bg-[#1FCB6B] text-[#0B1F14]' : 'text-[#78818E]'
                        }`}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => setMetaIsCurrency(true)}
                        className={`px-1.5 py-0.5 rounded ${
                          metaIsCurrency ? 'bg-[#1FCB6B] text-[#0B1F14]' : 'text-[#78818E]'
                        }`}
                      >
                        {botState.moeda === 'USD' ? '$' : 'R$'}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenKeypad('meta')}
                    className="w-full bg-[#0A0D12]/90 border border-white/15 rounded-md px-2.5 py-1.5 font-['Rajdhani'] font-bold text-[18px] text-[#E8EBEF] text-left tabular-nums focus:border-[#1FCB6B] hover:border-white/30 transition-colors"
                  >
                    {inputMeta}
                  </button>
                </div>
              </div>

              {/* Demo / Real account buttons */}
              <div className="flex gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => setSelectedAccount('demo')}
                  className={`flex-1 py-1 px-2 text-[11px] font-['Rajdhani'] font-bold tracking-wider rounded border transition-colors ${
                    selectedAccount === 'demo'
                      ? 'border-[#1FCB6B]/60 bg-[#1FCB6B]/15 text-white'
                      : 'border-white/10 bg-[#0A0D12]/60 text-[#8A929C] hover:text-[#E8EBEF]'
                  }`}
                >
                  DEMO
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAccount('real')}
                  className={`flex-1 py-1 px-2 text-[11px] font-['Rajdhani'] font-bold tracking-wider rounded border transition-colors ${
                    selectedAccount === 'real'
                      ? 'border-[#1FCB6B]/60 bg-[#1FCB6B]/15 text-white'
                      : 'border-white/10 bg-[#0A0D12]/60 text-[#8A929C] hover:text-[#E8EBEF]'
                  }`}
                >
                  REAL
                </button>
              </div>

              {/* INICIAR Big Button */}
              <button
                type="button"
                onClick={handleStart}
                className="w-full mt-1.5 py-2.5 px-4 rounded-lg font-['Rajdhani'] font-extrabold text-[14px] tracking-[0.14em] text-[#04150C] bg-gradient-to-b from-[#33E084] via-[#1FCB6B] to-[#15A957] shadow-[0_2px_0_#0B6E39,0_7px_16px_rgba(31,203,107,0.34),inset_0_1px_0_rgba(255,255,255,0.45)] hover:brightness-105 active:translate-y-0.5 transition-all cursor-pointer"
              >
                INICIAR
              </button>
            </div>
          ) : (
            /* RUNNING / ACTIVE SESSION STATE */
            <div className="flex flex-col gap-1.5 py-1">
              {/* Placar: Acerto */}
              <div className="flex items-baseline justify-between">
                <span className="text-[9px] font-['Rajdhani'] font-bold tracking-wider text-[#9AA3AE] uppercase">
                  ACERTO
                </span>
                <span className="font-['Rajdhani'] font-bold text-[22px] leading-none">
                  <span className="text-[#00E87A]">{botState.ganhos}</span>
                  <span className="text-[#565E68] mx-1">×</span>
                  <span className="text-[#FF2E4C]">{botState.perdas}</span>
                </span>
              </div>

              <div className="h-px bg-white/10 my-0.5" />

              {/* Próxima operação */}
              <div className="flex items-baseline justify-between">
                <span className="text-[9px] font-['Rajdhani'] font-bold tracking-wider text-[#9AA3AE] uppercase">
                  PRÓXIMA
                </span>
                <span className="font-['Rajdhani'] font-bold text-[13px] text-[#E8EBEF] tabular-nums">
                  {botState.tem_aberta
                    ? 'OPERAÇÃO EM CURSO'
                    : botState.proxima_em_s > 0
                    ? formatClock(botState.proxima_em_s)
                    : 'ANALISANDO GRÁFICO'}
                </span>
              </div>

              {/* Active trade progress line */}
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E9A825] transition-all duration-300"
                  style={{
                    width: botState.tem_aberta ? '100%' : '0%',
                  }}
                />
              </div>

              {/* Resultado / Lucro */}
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-[9px] font-['Rajdhani'] font-bold tracking-wider text-[#9AA3AE] uppercase">
                  RESULTADO
                </span>
                <span
                  className={`font-['Rajdhani'] font-bold text-[14px] tabular-nums ${
                    botState.lucro > 0
                      ? 'text-[#00E87A]'
                      : botState.lucro < 0
                      ? 'text-[#FF2E4C]'
                      : 'text-[#E8EBEF]'
                  }`}
                >
                  {botState.lucro > 0 ? '+' : ''}
                  {formatMoney(botState.lucro, botState.moeda)}
                </span>
              </div>

              {/* Meta status & progress bar */}
              <div className="flex items-baseline justify-between text-[11px]">
                <span className="text-[9px] font-['Rajdhani'] font-bold tracking-wider text-[#9AA3AE] uppercase">
                  META
                </span>
                <span className="font-['Rajdhani'] font-semibold text-[11px] text-[#9AA3AE] tabular-nums">
                  {formatMoney(botState.lucro, botState.moeda)} / {formatMoney(botState.meta_valor, botState.moeda)}
                </span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1FCB6B] transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, botState.progresso_pct))}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Oracle Badge watermark */}
          <div className="mt-2 pt-1 border-t border-white/5 flex justify-center">
            <OracleBadge />
          </div>
        </div>
      </div>

      {/* TACTILE NUMERIC KEYPAD MODAL OVERLAY */}
      {keypadField && (
        <div className="absolute inset-0 z-40 bg-[#0A0C10] flex flex-col p-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-baseline justify-between pb-2 border-b border-white/10 mb-2">
            <span className="text-[11px] font-['Rajdhani'] font-bold tracking-[0.14em] text-[#8A929C] uppercase">
              {keypadField === 'valor'
                ? 'VALOR POR OPERAÇÃO'
                : metaIsCurrency
                ? `META DE LUCRO (${botState.moeda === 'USD' ? '$' : 'R$'})`
                : 'META DE LUCRO (%)'}
            </span>
            <span className="font-mono font-bold text-[26px] text-white tabular-nums">
              {keypadBuffer || '0'}
            </span>
          </div>

          <div className="flex-1 grid grid-cols-4 gap-1.5">
            {['1', '2', '3', 'OK', '4', '5', '6', '', '7', '8', '9', '<', '.', '0'].map((k, idx) => {
              if (k === '') return <div key={idx} />;
              if (k === 'OK') {
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKeypadPress('OK')}
                    className="row-span-2 rounded-lg font-['Rajdhani'] font-extrabold text-[14px] tracking-wider text-[#04150C] bg-gradient-to-b from-[#33E084] to-[#15A957] active:scale-95 transition-transform flex items-center justify-center cursor-pointer shadow-md"
                  >
                    OK
                  </button>
                );
              }
              if (k === '<') {
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKeypadPress('<')}
                    className="rounded-lg bg-[#12161B] border border-white/10 text-[#8A929C] font-mono text-[18px] active:bg-[#1B2128] flex items-center justify-center cursor-pointer"
                  >
                    ⌫
                  </button>
                );
              }
              if (k === '0') {
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    className="col-span-2 rounded-lg bg-[#12161B] border border-white/10 text-white font-mono font-semibold text-[17px] active:bg-[#1B2128] flex items-center justify-center cursor-pointer"
                  >
                    0
                  </button>
                );
              }
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleKeypadPress(k)}
                  className="rounded-lg bg-[#12161B] border border-white/10 text-white font-mono font-semibold text-[17px] active:bg-[#1B2128] flex items-center justify-center cursor-pointer"
                >
                  {k}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
