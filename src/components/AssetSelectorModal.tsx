import React, { useState, useMemo } from 'react';
import { Asset } from '../types/trading';
import { sounds } from '../utils/audio';

interface AssetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  selectedAsset: Asset;
  onSelectAsset: (asset: Asset) => void;
}

export const AssetSelectorModal: React.FC<AssetSelectorModalProps> = ({
  isOpen,
  onClose,
  assets,
  selectedAsset,
  onSelectAsset,
}) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'blitz' | 'binary' | 'all'>('blitz');

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchSearch =
        a.ticker.toLowerCase().includes(search.toLowerCase()) ||
        a.name.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [assets, search]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="FlowLayoutV2-AssetSelector"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none"
    >
      <div className="w-full max-w-md bg-[#0F131A] border border-white/15 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0A0D12]">
          <h3 className="font-['Rajdhani'] font-extrabold text-[16px] text-white tracking-wider">
            SELECIONAR ATIVO (MERCADO OTC & BLITZ)
          </h3>
          <button
            data-testid="header-closeButton"
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 text-[#8A929C] hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-3 bg-[#0C1017] border-b border-white/10 flex flex-col gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <svg
              data-testid="filtersButton"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A929C]"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              data-testid="searchInput"
              type="text"
              placeholder="Buscar par (ex: EURUSD, GBP, BTC)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#141924] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs font-['Rajdhani'] font-semibold text-white placeholder-[#6E7787] focus:outline-none focus:border-[#1FCB6B]"
            />
          </div>

          {/* Market Filters */}
          <div className="flex items-center gap-1.5">
            <button
              data-testid="filter-blitz"
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveFilter('blitz');
              }}
              className={`px-3 py-1 rounded text-xs font-['Rajdhani'] font-bold transition-colors cursor-pointer ${
                activeFilter === 'blitz'
                  ? 'bg-[#1FCB6B] text-[#04150C]'
                  : 'bg-white/5 text-[#8A929C] hover:text-white'
              }`}
            >
              BLITZ (5s - 30s)
            </button>
            <button
              data-testid="filter-binary"
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveFilter('binary');
              }}
              className={`px-3 py-1 rounded text-xs font-['Rajdhani'] font-bold transition-colors cursor-pointer ${
                activeFilter === 'binary'
                  ? 'bg-[#1FCB6B] text-[#04150C]'
                  : 'bg-white/5 text-[#8A929C] hover:text-white'
              }`}
            >
              BINÁRIAS
            </button>
          </div>
        </div>

        {/* Asset List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2">
          {filteredAssets.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#8A929C]">
              Nenhum ativo encontrado para essa busca.
            </div>
          ) : (
            filteredAssets.map(asset => {
              const isSelected = asset.id === selectedAsset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectAsset(asset);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer ${
                    isSelected ? 'bg-white/10 border border-[#1FCB6B]/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Currency / Asset Flag or Icon */}
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold font-['Rajdhani'] text-white">
                      <span
                        data-testid="assetIcon-img"
                        className="text-[10px]"
                        aria-label={asset.isOTC ? `${asset.ticker} OTC` : asset.ticker}
                      >
                        {asset.ticker.slice(0, 3)}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-['Rajdhani'] font-bold text-white text-[13px]">
                          {asset.ticker}
                        </span>
                        {asset.isOTC && (
                          <span className="text-[9px] font-bold px-1 rounded bg-[#E9A825]/20 text-[#E9A825]">
                            OTC
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8A929C]">{asset.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-[#AEB7C2] tabular-nums">
                      {asset.basePrice.toFixed(asset.digits)}
                    </span>
                    <span className="font-['Rajdhani'] font-extrabold text-[14px] text-[#1FCB6B] bg-[#1FCB6B]/15 px-2 py-0.5 rounded tabular-nums">
                      +{asset.payout}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
