import React from 'react';

export function StatusBadge({ status }) {
  const statusConfig = {
    Verified: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Verified' },
    Approved: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Approved' },
    Processed: { bg: 'bg-teal-500/15', text: 'text-accent', border: 'border-teal-500/30', label: 'Processed' },
    'Needs Review': { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Needs Review' },
    Pending: { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30', label: 'Pending' },
    'In Review': { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30', label: 'In Review' },
    Rejected: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', label: 'Rejected' },
    Failed: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', label: 'Failed' },
  };

  const config = statusConfig[status] || {
    bg: 'bg-gray-500/15',
    text: 'text-gray-300',
    border: 'border-gray-500/30',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {config.label}
    </span>
  );
}
