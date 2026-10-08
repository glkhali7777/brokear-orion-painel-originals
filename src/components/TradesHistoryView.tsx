import React, { useState } from 'react';
import { OrionOperation, CurrencyType } from '../types/trading';
import { sounds } from '../utils/audio';

interface TradesHistoryViewProps {
  operations: OrionOperation[];
  currency: CurrencyType;
  onBackToTraderoom: () => void;
}

export const TradesHistoryView: React.FC<TradesHistoryViewProps> = ({
  operations,
  currency,
  onBackToTraderoom,
}) => {
  const [filter, setFilter] = useState<'all' | 'ganho' | 'perda'>('all');

  const formatMoney = (val: number) => {
    const symbol = currency === 'USD' ? '$' : 'R$';
    return `${symbol} ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const completedOps = operations.filter(op => op.estado !== 'aberta');
  const filteredOps = completedOps.filter(op => (filter === 'all' ? true : op.estado === filter));

  const wins = completedOps.filter(op => op.estado === 'ganho').length;
  const losses = completedOps.filter(op => op.estado === 'perda').length;
  const total = completedOps.length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const netProfit = completedOps.reduce((acc, curr) => acc + (curr.lucro || 0), 0);

  return (
    <div className="flex-1 bg-[#06080B] text-[#E8EBEF] flex flex-col p-3 sm:p-5 overflow-y-auto select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onBackToTraderoom();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8A929C] hover:text-white border border-white/15 text-xs font-['Rajdhani'] font-bold transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            VOLTAR AO GRÁFICO
          </button>
          <h2 className="font-['Rajdhani'] font-extrabold text-[18px] sm:text-[20px] tracking-wider text-white">
            HISTÓRICO DE OPERAÇÕES
          </h2>
        </div>

        {/* Filter Segmented buttons */}
        <div className="flex items-center gap-1 bg-[#12161F] p-1 rounded-lg border border-white/10">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setFilter('all');
            }}
            className={`px-3 py-1 rounded-md text-xs font-['Rajdhani'] font-bold transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-white/15 text-white' : 'text-[#8A929C] hover:text-white'
            }`}
          >
            TODAS ({completedOps.length})
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setFilter('ganho');
            }}
            className={`px-3 py-1 rounded-md text-xs font-['Rajdhani'] font-bold transition-colors cursor-pointer ${
              filter === 'ganho' ? 'bg-[#00E87A]/20 text-[#00E87A]' : 'text-[#8A929C] hover:text-white'
            }`}
          >
            VITÓRIAS ({wins})
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setFilter('perda');
            }}
            className={`px-3 py-1 rounded-md text-xs font-['Rajdhani'] font-bold transition-colors cursor-pointer ${
              filter === 'perda' ? 'bg-[#FF2E4C]/20 text-[#FF2E4C]' : 'text-[#8A929C] hover:text-white'
            }`}
          >
            DERROTAS ({losses})
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-[#0C1017] border border-white/10 rounded-xl p-3 flex flex-col">
          <span className="text-[10px] font-['Rajdhani'] font-bold text-[#8A929C] tracking-wider uppercase">
            TOTAL DE TRADES
          </span>
          <span className="font-['Rajdhani'] font-extrabold text-[22px] text-white mt-0.5 tabular-nums">
            {total}
          </span>
        </div>

        <div className="bg-[#0C1017] border border-white/10 rounded-xl p-3 flex flex-col">
          <span className="text-[10px] font-['Rajdhani'] font-bold text-[#8A929C] tracking-wider uppercase">
            PLACAR (WIN × LOSS)
          </span>
          <span className="font-['Rajdhani'] font-extrabold text-[22px] mt-0.5 tabular-nums">
            <span className="text-[#00E87A]">{wins}</span>
            <span className="text-[#565E68] mx-1">×</span>
            <span className="text-[#FF2E4C]">{losses}</span>
          </span>
        </div>

        <div className="bg-[#0C1017] border border-white/10 rounded-xl p-3 flex flex-col">
          <span className="text-[10px] font-['Rajdhani'] font-bold text-[#8A929C] tracking-wider uppercase">
            ASSERTIVIDADE
          </span>
          <span className="font-['Rajdhani'] font-extrabold text-[22px] text-[#1FCB6B] mt-0.5 tabular-nums">
            {winRate}%
          </span>
        </div>

        <div className="bg-[#0C1017] border border-white/10 rounded-xl p-3 flex flex-col">
          <span className="text-[10px] font-['Rajdhani'] font-bold text-[#8A929C] tracking-wider uppercase">
            LUCRO LÍQUIDO
          </span>
          <span
            className={`font-['Rajdhani'] font-extrabold text-[22px] mt-0.5 tabular-nums ${
              netProfit >= 0 ? 'text-[#00E87A]' : 'text-[#FF2E4C]'
            }`}
          >
            {netProfit >= 0 ? '+' : ''}{formatMoney(netProfit)}
          </span>
        </div>
      </div>

      {/* Trades Ledger Table */}
      <div className="flex-1 bg-[#0A0D12] border border-white/10 rounded-xl overflow-hidden flex flex-col">
        {filteredOps.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#8A929C]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 opacity-40 mb-2">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 4v4h4" />
              <path d="M12 7v5l3.5 2" />
            </svg>
            <p className="font-['Rajdhani'] font-bold text-[16px] text-white">Nenhuma operação finalizada ainda</p>
            <p className="text-xs text-[#8A929C] max-w-sm mt-1">
              Inicie o Orion Bot ou execute uma operação manual para registrar o histórico nesta sessão.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-['Rajdhani']">
              <thead className="bg-[#10141D] text-[#8A929C] border-b border-white/10 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">HORÁRIO</th>
                  <th className="py-2.5 px-3">ATIVO</th>
                  <th className="py-2.5 px-3">TIPO</th>
                  <th className="py-2.5 px-3 text-right">VALOR</th>
                  <th className="py-2.5 px-3 text-right">ENTRADA</th>
                  <th className="py-2.5 px-3 text-right">SAÍDA</th>
                  <th className="py-2.5 px-3 text-right">RESULTADO</th>
                  <th className="py-2.5 px-3 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px] tabular-nums">
                {filteredOps.map(op => {
                  const date = new Date(op.aberta_em);
                  const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
                  const isWin = op.estado === 'ganho';

                  return (
                    <tr key={op.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2 px-3 text-[#AEB7C2]">{timeStr}</td>
                      <td className="py-2 px-3 font-['Rajdhani'] font-bold text-white text-[12px]">{op.ticker}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`font-['Rajdhani'] font-extrabold text-[11px] px-1.5 py-0.5 rounded ${
                            op.direcao === 'call'
                              ? 'bg-[#00E87A]/20 text-[#00E87A]'
                              : 'bg-[#FF2E4C]/20 text-[#FF2E4C]'
                          }`}
                        >
                          {op.direcao === 'call' ? '▲ CALL' : '▼ PUT'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-white font-bold">{formatMoney(op.valor)}</td>
                      <td className="py-2 px-3 text-right text-[#AEB7C2]">{op.taxa_abertura}</td>
                      <td className="py-2 px-3 text-right text-[#AEB7C2]">{op.taxa_fechamento || '—'}</td>
                      <td
                        className={`py-2 px-3 text-right font-bold text-[12px] ${
                          isWin ? 'text-[#00E87A]' : 'text-[#FF2E4C]'
                        }`}
                      >
                        {isWin ? '+' : ''}{formatMoney(op.lucro || 0)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`font-['Rajdhani'] font-extrabold text-[10px] px-2 py-0.5 rounded ${
                            isWin ? 'bg-[#00E87A] text-[#04150C]' : 'bg-[#FF2E4C] text-[#1B0409]'
                          }`}
                        >
                          {isWin ? 'VITÓRIA' : 'DERROTA'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
