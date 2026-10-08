import React from 'react';

export const OrionLogoText: React.FC<{ className?: string }> = ({ className = "h-7" }) => (
  <div className={`flex items-center gap-2 select-none ${className}`}>
    <svg viewBox="0 0 36 36" fill="none" className="h-full w-auto aspect-square">
      <defs>
        <linearGradient id="orionGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#33E084" />
          <stop offset="100%" stopColor="#15A957" />
        </linearGradient>
      </defs>
      {/* Outer Hexagon / shield */}
      <polygon points="18,2 32,10 32,26 18,34 4,26 4,10" fill="#0C1017" stroke="#1FCB6B" strokeWidth="1.8" />
      {/* Constellation lines */}
      <circle cx="18" cy="8" r="1.5" fill="#33E084" />
      <circle cx="12" cy="17" r="1.5" fill="#33E084" />
      <circle cx="24" cy="17" r="1.5" fill="#33E084" />
      <circle cx="15" cy="24" r="1.5" fill="#33E084" />
      <circle cx="21" cy="24" r="1.5" fill="#33E084" />
      {/* Constellation belt lines */}
      <line x1="12" y1="17" x2="18" y2="8" stroke="#33E084" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="24" y1="17" x2="18" y2="8" stroke="#33E084" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="12" y1="17" x2="15" y2="24" stroke="#33E084" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="24" y1="17" x2="21" y2="24" stroke="#33E084" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="15" y1="24" x2="21" y2="24" stroke="#33E084" strokeWidth="1" strokeOpacity="0.7" />
      {/* Center glowing star */}
      <circle cx="18" cy="17" r="2.5" fill="url(#orionGrad)" />
    </svg>
    <div className="flex flex-col justify-center leading-none">
      <span className="font-['Rajdhani'] font-extrabold text-[15px] tracking-[0.14em] text-white flex items-center gap-1">
        ORION <span className="text-[#1FCB6B]">BOT</span>
      </span>
      <span className="font-['Rajdhani'] font-semibold text-[8px] tracking-[0.24em] text-[#9AA3AE] uppercase">
        ULTRA ALGO V4
      </span>
    </div>
  </div>
);

export const BullVector: React.FC<{ className?: string; color?: string; opacity?: number }> = ({
  className = "w-32 h-32",
  color = "#33E084",
  opacity = 1
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ opacity }}
  >
    {/* Stylized geometric bull head charging up */}
    <path
      d="M20 22 C28 32, 38 34, 45 35 C42 20, 36 12, 28 8 C30 16, 26 20, 20 22 Z"
      fill={color}
    />
    <path
      d="M80 22 C72 32, 62 34, 55 35 C58 20, 64 12, 72 8 C70 16, 74 20, 80 22 Z"
      fill={color}
    />
    {/* Bull forehead / snout */}
    <polygon
      points="50,26 64,36 60,62 50,78 40,62 36,36"
      fill={color}
      fillOpacity="0.85"
    />
    {/* Horn accents */}
    <path
      d="M26 10 C34 14, 38 24, 40 32"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M74 10 C66 14, 62 24, 60 32"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Eyes */}
    <polygon points="43,44 47,42 45,46" fill="#0A0C10" />
    <polygon points="57,44 53,42 55,46" fill="#0A0C10" />
    {/* Muzzle */}
    <polygon points="46,66 54,66 52,74 48,74" fill={color} fillOpacity="0.9" />
  </svg>
);

export const BearVector: React.FC<{ className?: string; color?: string; opacity?: number }> = ({
  className = "w-32 h-32",
  color = "#FF2E4C",
  opacity = 1
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ opacity }}
  >
    {/* Stylized geometric bear head */}
    {/* Bear Ears */}
    <circle cx="28" cy="28" r="10" fill={color} fillOpacity="0.75" />
    <circle cx="72" cy="28" r="10" fill={color} fillOpacity="0.75" />
    <circle cx="28" cy="28" r="5" fill="#0A0C10" />
    <circle cx="72" cy="28" r="5" fill="#0A0C10" />
    {/* Head contours */}
    <polygon
      points="50,30 70,40 68,68 50,84 32,68 30,40"
      fill={color}
      fillOpacity="0.85"
    />
    {/* Snout */}
    <polygon points="43,54 57,54 55,72 45,72" fill={color} />
    {/* Nose & Eyes */}
    <circle cx="42" cy="44" r="2.5" fill="#0A0C10" />
    <circle cx="58" cy="44" r="2.5" fill="#0A0C10" />
    <polygon points="47,60 53,60 50,65" fill="#0A0C10" />
    {/* Fangs */}
    <polygon points="44,70 46,74 47,70" fill="#FFFFFF" />
    <polygon points="56,70 54,74 53,70" fill="#FFFFFF" />
  </svg>
);

export const OracleBadge: React.FC<{ className?: string }> = ({ className = "h-4" }) => (
  <div className={`flex items-center justify-center gap-1.5 opacity-40 hover:opacity-80 transition-opacity select-none ${className}`}>
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#E8EBEF" strokeWidth="2" strokeDasharray="3 3" />
      <polygon points="12,6 16,14 8,14" fill="#E8EBEF" />
    </svg>
    <span className="font-['Rajdhani'] font-bold text-[10px] tracking-[0.25em] text-[#E8EBEF] uppercase">
      ORACLE AI CLOUD
    </span>
  </div>
);
