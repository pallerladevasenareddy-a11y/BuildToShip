import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  FileSpreadsheet,
  AlertOctagon,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

export function AppSidebar({ reviewCount = 0 }) {
  const navItems = [
    { label: 'Overview', to: '/', icon: LayoutDashboard },
    { label: 'Upload Invoices', to: '/upload', icon: UploadCloud },
    { label: 'All Invoices', to: '/invoices', icon: FileSpreadsheet },
    { label: 'Review Queue', to: '/review', icon: AlertOctagon, badge: reviewCount },
    { label: 'Insights', to: '/insights', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-border flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border gap-3">
        <div className="w-9 h-9 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-primaryText flex items-center gap-1.5">
            DocuSense <span className="text-accent text-xs font-semibold px-1.5 py-0.5 rounded bg-accent/15 border border-accent/30">AI</span>
          </h1>
          <p className="text-[10px] text-mutedText tracking-wider uppercase">Invoice Auditor</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-mutedText">
          Audit Center
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-accent/15 text-accent border border-accent/30 shadow-sm'
                  : 'text-mutedText hover:text-primaryText hover:bg-card/70'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </div>
            {item.badge > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-state-warning/20 text-state-warning border border-state-warning/30">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System Status Pill */}
      <div className="p-4 border-t border-border">
        <div className="bg-card rounded-lg p-3 border border-border text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-mutedText text-[11px]">Audit Engine</span>
            <span className="flex items-center gap-1 text-[11px] text-state-success font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-state-success animate-pulse" />
              Active
            </span>
          </div>
          <p className="text-[10px] text-mutedText/80 leading-relaxed">
            Deterministic Math &amp; Gemini OCR enabled
          </p>
        </div>
      </div>
    </aside>
  );
}
