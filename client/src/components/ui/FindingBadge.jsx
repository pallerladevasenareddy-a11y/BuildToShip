import React from 'react';

export function FindingBadge({ severity }) {
  const map = {
    CRITICAL: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40' },
    HIGH: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40' },
    MEDIUM: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40' },
    LOW: { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/40' },
  };

  const style = map[severity] || map.MEDIUM;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold tracking-wider border ${style.bg} ${style.text} ${style.border}`}
    >
      {severity}
    </span>
  );
}
