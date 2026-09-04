import React from 'react';

export default function Sparkline({ points = [], isUp, isPositive = true, change = null, width = 80, height = 24 }) {
  let isNeutral = false;
  let isBullish = true;

  if (change !== null) {
    if (change === 0) {
      isNeutral = true;
    } else if (change > 0) {
      isBullish = true;
    } else {
      isBullish = false;
    }
  } else if (isUp !== undefined) {
    isBullish = isUp;
  } else {
    isBullish = isPositive;
  }

  if (!points || points.length < 2) {
    if (isNeutral) {
      points = [20, 20, 20, 20, 20, 20, 20, 20, 20, 20];
    } else {
      points = isBullish 
        ? [12, 14, 11, 15, 18, 16, 22, 25, 24, 28] 
        : [28, 26, 27, 22, 19, 21, 16, 14, 15, 11];
    }
  }

  const values = points.map(p => typeof p === 'number' ? p : (p.price || 10));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Bullish: #0A5C3A, Bearish: #8B1A1A, Neutral: #8E8E93
  const strokeColor = isNeutral ? '#8E8E93' : isBullish ? '#0A5C3A' : '#8B1A1A';
  const fillColor = isNeutral 
    ? 'rgba(142, 142, 147, 0.14)' 
    : isBullish 
    ? 'rgba(10, 92, 58, 0.14)' 
    : 'rgba(139, 26, 26, 0.14)';

  const normalized = values.map((val, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${normalized.join(' L ')}`;
  const areaD = `M 0,${height} L ${normalized.join(' L ')} L ${width},${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible inline-block">
      <path d={areaD} fill={fillColor} />
      <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
