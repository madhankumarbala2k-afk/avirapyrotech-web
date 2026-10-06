import React from 'react';

/**
 * CrackerBlast
 * Festive Sivakasi firecracker blast effect that bursts outward on hover.
 * Includes central fire flash, expanding shockwave rings, 12 multi-color sparks,
 * and twinkling starbursts.
 */
export default function CrackerBlast({ size = 'default' }) {
  // 12 radial firework sparks arranged evenly across 360 degrees
  const sparks = [
    { tx: '65px',  ty: '0px',   color: '#FFD700', delay: '0ms',   size: 'w-2.5 h-2.5' },
    { tx: '56px',  ty: '32px',  color: '#FF3B30', delay: '30ms',  size: 'w-2 h-2' },
    { tx: '32px',  ty: '56px',  color: '#FF9500', delay: '15ms',  size: 'w-2.5 h-2.5' },
    { tx: '0px',   ty: '65px',  color: '#00E5FF', delay: '45ms',  size: 'w-2 h-2' },
    { tx: '-32px', ty: '56px',  color: '#76FF03', delay: '20ms',  size: 'w-2.5 h-2.5' },
    { tx: '-56px', ty: '32px',  color: '#FF2D55', delay: '35ms',  size: 'w-2 h-2' },
    { tx: '-65px', ty: '0px',   color: '#FFE600', delay: '10ms',  size: 'w-2.5 h-2.5' },
    { tx: '-56px', ty: '-32px', color: '#FFFFFF', delay: '50ms',  size: 'w-2 h-2' },
    { tx: '-32px', ty: '-56px', color: '#FF8008', delay: '25ms',  size: 'w-2.5 h-2.5' },
    { tx: '0px',   ty: '-65px', color: '#FF1493', delay: '40ms',  size: 'w-2 h-2' },
    { tx: '32px',  ty: '-56px', color: '#00FFA3', delay: '15ms',  size: 'w-2.5 h-2.5' },
    { tx: '56px',  ty: '-32px', color: '#FFD700', delay: '35ms',  size: 'w-2 h-2' },
  ];

  // 4 rotating twinkling stars at diagonal angles
  const stars = [
    { tx: '46px',  ty: '46px',  color: '#FFF59D', delay: '20ms' },
    { tx: '-46px', ty: '46px',  color: '#FF8A80', delay: '40ms' },
    { tx: '-46px', ty: '-46px', color: '#80D8FF', delay: '15ms' },
    { tx: '46px',  ty: '-46px', color: '#FFFF8D', delay: '30ms' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden cracker-blast-overlay z-20 flex items-center justify-center select-none">
      {/* 1. Primary Central Golden Blast Flash */}
      <div className="absolute w-24 h-24 rounded-full bg-radial from-amber-100 via-orange-500/60 to-transparent cracker-flash pointer-events-none" />

      {/* 2. Intense Core White Fire Sparks */}
      <div className="absolute w-6 h-6 rounded-full bg-white shadow-[0_0_16px_#FFF7C2] cracker-flash pointer-events-none" />

      {/* 3. Double Expanding Shockwave Rings */}
      <div className="absolute w-16 h-16 rounded-full border-2 border-amber-300 cracker-ring-1 pointer-events-none" />
      <div className="absolute w-20 h-20 rounded-full border-2 border-orange-400 cracker-ring-2 pointer-events-none" />

      {/* 4. 12 High-Velocity Radial Sivakasi Sparks */}
      {sparks.map((s, idx) => (
        <span
          key={`spark-${idx}`}
          className={`absolute ${s.size} rounded-full cracker-spark pointer-events-none shadow-[0_0_12px_currentColor]`}
          style={{
            '--tx': s.tx,
            '--ty': s.ty,
            backgroundColor: s.color,
            color: s.color,
            animationDelay: s.delay,
          }}
        />
      ))}

      {/* 5. 4 Twinkling Festive Firework Starlets */}
      {stars.map((st, idx) => (
        <span
          key={`star-${idx}`}
          className="absolute text-xs leading-none cracker-star pointer-events-none select-none drop-shadow-[0_0_8px_currentColor]"
          style={{
            '--tx': st.tx,
            '--ty': st.ty,
            color: st.color,
            animationDelay: st.delay,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}
