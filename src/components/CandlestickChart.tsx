import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Asset, Candle, OrionOperation } from '../types/trading';

interface CandlestickChartProps {
  asset: Asset;
  candles: Candle[];
  activeOperations: OrionOperation[];
  className?: string;
  timeframeSeconds?: number;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  asset,
  candles,
  activeOperations,
  className = "",
  timeframeSeconds = 5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);

  // Latest candle & price
  const latestCandle = candles[candles.length - 1];
  const currentPrice = latestCandle ? latestCandle.close : asset.basePrice;
  const prevPrice = candles[candles.length - 2]?.close ?? currentPrice;
  const isUpTick = currentPrice >= prevPrice;

  // Render chart onto Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    // Padding
    const padTop = 30;
    const padBottom = 28;
    const padRight = 72; // Price axis on right
    const padLeft = 10;
    const chartW = width - padRight - padLeft;
    const chartH = height - padTop - padBottom;

    // Clear
    ctx.fillStyle = '#06080B';
    ctx.fillRect(0, 0, width, height);

    // Calculate Price Min & Max
    const visibleCandles = candles.slice(-50);
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    visibleCandles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    });

    // Include active operation strikes in price bounds
    activeOperations.forEach(op => {
      if (op.taxa_abertura < minPrice) minPrice = op.taxa_abertura;
      if (op.taxa_abertura > maxPrice) maxPrice = op.taxa_abertura;
    });

    // Add 10% breathing room
    const priceRange = maxPrice - minPrice || 0.0001;
    minPrice -= priceRange * 0.08;
    maxPrice += priceRange * 0.08;
    const effectiveRange = maxPrice - minPrice;

    const getY = (price: number) => {
      return padTop + chartH - ((price - minPrice) / effectiveRange) * chartH;
    };

    // Draw Subtle Horizontal Grid Lines & Price Labels
    const gridSteps = 6;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#6E7787';
    ctx.font = '10px "Rajdhani", monospace';
    ctx.textAlign = 'left';

    for (let i = 0; i <= gridSteps; i++) {
      const price = minPrice + (effectiveRange / gridSteps) * i;
      const y = getY(price);

      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      // Right axis label
      ctx.fillText(price.toFixed(asset.digits), width - padRight + 6, y + 3);
    }

    // Draw Vertical Time Grid lines
    const timeStep = Math.max(1, Math.floor(visibleCandles.length / 5));
    visibleCandles.forEach((c, idx) => {
      if (idx % timeStep === 0) {
        const x = padLeft + (idx / (visibleCandles.length - 1)) * chartW;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.moveTo(x, padTop);
        ctx.lineTo(x, height - padBottom);
        ctx.stroke();

        const date = new Date(c.time);
        const timeStr = `${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        ctx.fillText(timeStr, x - 12, height - 10);
      }
    });

    // Calculate & Draw Simple Moving Average (SMA-9)
    const smaPeriod = 9;
    const smaPoints: { x: number; y: number }[] = [];
    for (let i = smaPeriod - 1; i < visibleCandles.length; i++) {
      let sum = 0;
      for (let j = 0; j < smaPeriod; j++) {
        sum += visibleCandles[i - j].close;
      }
      const avg = sum / smaPeriod;
      const x = padLeft + (i / (visibleCandles.length - 1)) * chartW;
      const y = getY(avg);
      smaPoints.push({ x, y });
    }

    if (smaPoints.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#E9A825';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([3, 2]);
      smaPoints.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Candlesticks
    const candleWidth = Math.max(4, Math.floor((chartW / visibleCandles.length) * 0.72));

    visibleCandles.forEach((c, idx) => {
      const x = padLeft + (idx / (visibleCandles.length - 1)) * chartW;
      const isGreen = c.close >= c.open;
      const color = isGreen ? '#00E87A' : '#FF2E4C';

      const yOpen = getY(c.open);
      const yClose = getY(c.close);
      const yHigh = getY(c.high);
      const yLow = getY(c.low);

      // Wick
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Body
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });

    // Current Price Pulse Line
    const currentY = getY(currentPrice);
    const lineColor = isUpTick ? '#00E87A' : '#FF2E4C';

    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.moveTo(padLeft, currentY);
    ctx.lineTo(width - padRight, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current Price Pin on Right Axis
    ctx.fillStyle = lineColor;
    ctx.beginPath();
    const tagH = 18;
    const tagW = padRight - 4;
    const tagX = width - padRight + 2;
    const tagY = currentY - tagH / 2;
    ctx.roundRect(tagX, tagY, tagW, tagH, 3);
    ctx.fill();

    ctx.fillStyle = '#04150C';
    ctx.font = 'bold 11px "Rajdhani", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(currentPrice.toFixed(asset.digits), tagX + 6, currentY + 3.5);

    // Draw Active Operations on Chart
    activeOperations.forEach(op => {
      const strikeY = getY(op.taxa_abertura);
      const isCall = op.direcao === 'call';
      const opColor = isCall ? '#00E87A' : '#FF2E4C';

      // Strike Line
      ctx.beginPath();
      ctx.strokeStyle = opColor;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([2, 2]);
      ctx.moveTo(padLeft, strikeY);
      ctx.lineTo(width - padRight, strikeY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Execution Beacon Arrow near current price
      const beaconX = width - padRight - 36;
      ctx.fillStyle = opColor;
      ctx.beginPath();
      ctx.arc(beaconX, strikeY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing beacon ring
      ctx.strokeStyle = opColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(beaconX, strikeY, 9, 0, Math.PI * 2);
      ctx.stroke();

      // Arrow Icon
      ctx.beginPath();
      if (isCall) {
        ctx.moveTo(beaconX - 5, strikeY - 10);
        ctx.lineTo(beaconX + 5, strikeY - 10);
        ctx.lineTo(beaconX, strikeY - 16);
      } else {
        ctx.moveTo(beaconX - 5, strikeY + 10);
        ctx.lineTo(beaconX + 5, strikeY + 10);
        ctx.lineTo(beaconX, strikeY + 16);
      }
      ctx.closePath();
      ctx.fill();

      // Strike tag
      ctx.fillStyle = '#0F1318';
      ctx.strokeStyle = opColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(beaconX - 90, strikeY - 11, 80, 22, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = opColor;
      ctx.font = 'bold 10px "Rajdhani", monospace';
      ctx.fillText(`${isCall ? 'CALL' : 'PUT'} · ${op.valor}`, beaconX - 84, strikeY + 3);
    });

  }, [candles, asset, activeOperations, currentPrice, isUpTick]);

  return (
    <div
      ref={containerRef}
      id="traderoomChart"
      className={`relative w-full h-full bg-[#06080B] overflow-hidden select-none ${className}`}
    >
      {/* Top Chart Info Bar */}
      <div className="absolute top-2 left-3 z-10 flex items-center gap-2.5 bg-[#0C1017]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs">
        <span className="font-['Rajdhani'] font-extrabold text-[13px] text-white tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#1FCB6B] animate-pulse" />
          {asset.ticker}
        </span>
        <span className="text-[#AEB7C2] text-[10px] font-mono">
          BLITZ {timeframeSeconds}s
        </span>
        <span className="font-mono font-bold text-[12px] text-white tabular-nums">
          {currentPrice.toFixed(asset.digits)}
        </span>
        <span
          className={`font-mono text-[10px] tabular-nums font-semibold ${
            asset.change24h >= 0 ? 'text-[#00E87A]' : 'text-[#FF2E4C]'
          }`}
        >
          {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
        </span>
        <span className="bg-[#1FCB6B]/20 text-[#1FCB6B] px-1.5 py-0.5 rounded text-[10px] font-bold font-['Rajdhani']">
          +{asset.payout}%
        </span>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Floating Sentiment Bar (BrokerQX feature on the left) */}
      <div className="absolute left-2.5 top-14 bottom-10 w-1 flex flex-col rounded-full overflow-hidden bg-white/10 pointer-events-none opacity-70">
        <div className="w-full bg-[#00E87A] transition-all duration-500" style={{ height: '58%' }} />
        <div className="w-full bg-[#FF2E4C] transition-all duration-500" style={{ height: '42%' }} />
      </div>
    </div>
  );
};
