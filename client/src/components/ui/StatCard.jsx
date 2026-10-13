import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, color = 'accent' }) {
  const colorMap = {
    accent: 'text-accent border-accent/30 bg-accent/10',
    warning: 'text-state-warning border-state-warning/30 bg-state-warning/10',
    error: 'text-state-error border-state-error/30 bg-state-error/10',
    success: 'text-state-success border-state-success/30 bg-state-success/10',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-lg relative overflow-hidden transition-all duration-200 hover:border-accent/40">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-mutedText">{title}</p>
          <h3 className="text-2xl font-bold text-primaryText mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-mutedText mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg border ${colorMap[color] || colorMap.accent}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
