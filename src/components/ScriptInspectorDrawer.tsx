import React, { useState } from 'react';
import { OrionBotState, BotStrategyConfig, CurrencyType } from '../types/trading';
import { sounds } from '../utils/audio';

interface ScriptInspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  botState: OrionBotState;
  strategyConfig: BotStrategyConfig;
  onUpdateStrategy: (newConfig: Partial<BotStrategyConfig>) => void;
  currency: CurrencyType;
  onChangeCurrency: (curr: CurrencyType) => void;
}

export const ScriptInspectorDrawer: React.FC<ScriptInspectorDrawerProps> = ({
  isOpen,
  onClose,
  botState,
  strategyConfig,
  onUpdateStrategy,
  currency,
  onChangeCurrency,
}) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'endpoints' | 'f12' | 'script'>('f12');
  const [copied, setCopied] = useState(false);

  const handleCopyF12 = () => {
    sounds.playClick();
    import('../utils/f12Script').then(m => {
      navigator.clipboard.writeText(m.ORION_BOT_F12_SCRIPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg bg-[#0D1017] border-l border-white/15 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0A0C10]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1FCB6B]" />
            <h3 className="font-['Rajdhani'] font-extrabold text-[16px] text-white tracking-wider">
              INSPETOR DO ROBÔ ORION & BROKERQX
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 text-[#8A929C] hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#0C0F16] text-xs font-['Rajdhani'] font-bold">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('f12');
            }}
            className={`flex-1 py-2.5 px-2 border-b-2 transition-colors cursor-pointer text-center ${
              activeTab === 'f12'
                ? 'border-[#1FCB6B] text-[#1FCB6B] bg-white/5 font-extrabold'
                : 'border-transparent text-[#8A929C] hover:text-white'
            }`}
          >
            CÓDIGO F12 (CONSOLE)
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('simulation');
            }}
            className={`flex-1 py-2.5 px-2 border-b-2 transition-colors cursor-pointer text-center ${
              activeTab === 'simulation'
                ? 'border-[#1FCB6B] text-white bg-white/5'
                : 'border-transparent text-[#8A929C] hover:text-white'
            }`}
          >
            ESTRATÉGIA
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('endpoints');
            }}
            className={`flex-1 py-2.5 px-2 border-b-2 transition-colors cursor-pointer text-center ${
              activeTab === 'endpoints'
                ? 'border-[#1FCB6B] text-white bg-white/5'
                : 'border-transparent text-[#8A929C] hover:text-white'
            }`}
          >
            JSON
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('script');
            }}
            className={`flex-1 py-2.5 px-2 border-b-2 transition-colors cursor-pointer text-center ${
              activeTab === 'script'
                ? 'border-[#1FCB6B] text-white bg-white/5'
                : 'border-transparent text-[#8A929C] hover:text-white'
            }`}
          >
            ANÁLISE
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 text-xs font-['Plus_Jakarta_Sans']">
          {activeTab === 'f12' && (
            <div className="flex flex-col gap-3.5">
              <div className="bg-[#121620] border border-[#1FCB6B]/30 rounded-xl p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-['Rajdhani'] font-extrabold text-[14px] text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1FCB6B] animate-pulse" />
                    SCRIPT COMPLETO PARA CONSOLE (F12)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyF12}
                    className="px-3 py-1.5 rounded-lg font-['Rajdhani'] font-bold text-xs bg-[#1FCB6B] hover:bg-[#33E084] text-[#04150C] transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    {copied ? 'COPIADO COM SUCESSO!' : 'COPIAR CÓDIGO'}
                  </button>
                </div>
                <p className="text-[11px] text-[#AEB7C2] leading-relaxed">
                  Este código já inclui o <strong>painel gráfico completo do Orion Bot</strong>, velocímetro animado, gestão de meta, contagem regressiva, sons e o <strong>motor autônomo</strong> para operar direto na corretora sem depender de servidores externos.
                </p>
                <div className="bg-[#0A0D12] p-2.5 rounded-lg border border-white/5 text-[11px] text-[#8A929C] space-y-1">
                  <div><strong>1.</strong> Abra a corretora (BrokerQX, Quotex, etc.)</div>
                  <div><strong>2.</strong> Pressione <strong>F12</strong> (ou Ctrl+Shift+I) no teclado</div>
                  <div><strong>3.</strong> Clique na aba <strong>Console</strong></div>
                  <div><strong>4.</strong> Cole o código copiado e aperte <strong>ENTER</strong></div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-['Rajdhani'] font-bold text-[#8A929C] uppercase tracking-wider">
                  PRÉ-VISUALIZAÇÃO DO CÓDIGO JAVASCRIPT:
                </span>
                <pre className="p-3 bg-[#06080B] border border-white/10 rounded-xl font-mono text-[10px] text-[#33E084] overflow-x-auto max-h-64 leading-tight">
                  {`// ORION BOT ULTRA - STANDALONE F12 SCRIPT
(function(){
  if (window.__orionBotAtivo) return console.warn("Orion Bot já está ativo!");
  window.__orionBotAtivo = true;
  // Cria Shadow DOM com interface completa, velocímetro SVG,
  // sons sintetizados Web Audio, teclado numérico e motor autônomo!
  // Clique em "COPIAR CÓDIGO" acima para copiar o script completo...
})();`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'simulation' && (
            <div className="flex flex-col gap-4">
              {/* Speed Multiplier */}
              <div className="bg-[#121620] border border-white/10 rounded-xl p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-['Rajdhani'] font-bold text-[13px] text-white">
                    VELOCIDADE DA SIMULAÇÃO
                  </span>
                  <span className="text-[11px] font-mono text-[#1FCB6B] font-bold">
                    {strategyConfig.speedMultiplier}x
                  </span>
                </div>
                <p className="text-[11px] text-[#8A929C]">
                  Acelere os intervalos de análise e o tempo de expiração para testar estratégias e metas rapidamente.
                </p>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[1, 2, 5].map(speed => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        onUpdateStrategy({ speedMultiplier: speed as 1 | 2 | 5 });
                      }}
                      className={`py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold border transition-colors cursor-pointer ${
                        strategyConfig.speedMultiplier === speed
                          ? 'border-[#1FCB6B] bg-[#1FCB6B]/20 text-white'
                          : 'border-white/10 bg-white/5 text-[#8A929C] hover:text-white'
                      }`}
                    >
                      {speed}x {speed === 1 ? '(Normal)' : speed === 5 ? '(Turbo)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Win Rate / Signal Edge Slider */}
              <div className="bg-[#121620] border border-white/10 rounded-xl p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-['Rajdhani'] font-bold text-[13px] text-white">
                    TAXA DE ASSERTIVIDADE DO ALGORITMO
                  </span>
                  <span className="font-['Rajdhani'] font-extrabold text-[15px] text-[#00E87A] tabular-nums">
                    {Math.round(strategyConfig.winProbability * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.95"
                  step="0.05"
                  value={strategyConfig.winProbability}
                  onChange={e => onUpdateStrategy({ winProbability: parseFloat(e.target.value) })}
                  className="accent-[#1FCB6B] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8A929C] font-mono">
                  <span>50% (Mercado Puro)</span>
                  <span>78% (Padrão Orion)</span>
                  <span>95% (Alta Confiança)</span>
                </div>
              </div>

              {/* Martingale Management */}
              <div className="bg-[#121620] border border-white/10 rounded-xl p-3.5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-['Rajdhani'] font-bold text-[13px] text-white block">
                      RECUPERAÇÃO MARTINGALE
                    </span>
                    <span className="text-[11px] text-[#8A929C]">
                      Multiplica a próxima entrada após uma perda para recuperar o capital.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={strategyConfig.martingaleEnabled}
                    onChange={e => onUpdateStrategy({ martingaleEnabled: e.target.checked })}
                    className="w-4 h-4 accent-[#1FCB6B] cursor-pointer"
                  />
                </div>
              </div>

              {/* Currency Selector */}
              <div className="bg-[#121620] border border-white/10 rounded-xl p-3.5 flex flex-col gap-2">
                <span className="font-['Rajdhani'] font-bold text-[13px] text-white">
                  MOEDA DA CONTA
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onChangeCurrency('BRL');
                    }}
                    className={`py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold border transition-colors cursor-pointer ${
                      currency === 'BRL'
                        ? 'border-[#1FCB6B] bg-[#1FCB6B]/20 text-white'
                        : 'border-white/10 bg-white/5 text-[#8A929C] hover:text-white'
                    }`}
                  >
                    BRL (R$) Real Brasileiro
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onChangeCurrency('USD');
                    }}
                    className={`py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold border transition-colors cursor-pointer ${
                      currency === 'USD'
                        ? 'border-[#1FCB6B] bg-[#1FCB6B]/20 text-white'
                        : 'border-white/10 bg-white/5 text-[#8A929C] hover:text-white'
                    }`}
                  >
                    USD ($) Dólar Americano
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'endpoints' && (
            <div className="flex flex-col gap-3">
              <p className="text-[11px] text-[#8A929C]">
                Representação viva do payload consumido periodicamente por <code className="text-[#1FCB6B]">atualizar()</code> via <code className="text-[#1FCB6B]">/api/fx/estado</code>:
              </p>
              <pre className="p-3 bg-[#06080B] border border-white/10 rounded-xl font-mono text-[11px] text-[#33E084] overflow-x-auto">
                {JSON.stringify(botState, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="flex flex-col gap-3 leading-relaxed text-[#AEB7C2]">
              <h4 className="font-['Rajdhani'] font-bold text-[14px] text-white">
                Como Funciona o Orion Bot Panel Injetado
              </h4>
              <p>
                O script original é executado dentro do ambiente da corretora (<code className="text-white">brokerqx</code>). Ele executa:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px]">
                <li>
                  <strong className="text-white">Ocultamento dos Controles Nativos:</strong> Injeta uma folha de estilos que move <code className="text-white">[data-testid="tradingPanel"]</code> e botões higher/lower para fora da tela (<code className="text-white">left: -9999px</code>).
                </li>
                <li>
                  <strong className="text-white">Shadow DOM Encapsulado:</strong> Cria um nó <code className="text-white">#orionbot</code> com Shadow Root contendo a HUD tátil, o velocímetro SVG (<code className="text-white">.mostr</code>), o teclado numérico customizado e a barra de progresso.
                </li>
                <li>
                  <strong className="text-white">Automação de Ativos:</strong> Ao identificar um novo ativo em <code className="text-white">operacoes[0].ativo</code>, ele clica automaticamente em <code className="text-white">[data-testid="add"]</code>, filtra por <code className="text-white">filter-blitz</code>, digita o ticker no campo de busca e seleciona o par correspondente no gráfico.
                </li>
                <li>
                  <strong className="text-white">Sincronização de Saldo:</strong> Monitora <code className="text-white">[data-testid="BalanceControl"]</code> para alternar automaticamente entre a carteira Demo e Real conforme o modo ativo.
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
