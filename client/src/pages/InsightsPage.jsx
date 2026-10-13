import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Building,
  PieChart as PieIcon,
  Copy,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';
import { StatCard } from '../components/ui/StatCard';

export function InsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await api.get('/insights/summary');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching insights:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  const COLORS = ['#75D9C3', '#45C49A', '#E9B85D', '#60A5FA', '#A78BFA', '#F472B6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-mutedText">Analyzing invoice data &amp; spending trends...</p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalInvoices: 0,
    totalSpendINR: 0,
    needsReviewCount: 0,
    possibleDuplicatesCount: 0,
    duplicateExposureINR: 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primaryText">Procurement &amp; Spending Insights</h1>
        <p className="text-sm text-mutedText mt-0.5">
          Deterministic business intelligence computed from {data?.recordsAnalyzed || 0} stored invoice records
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Audited Spend"
          value={`₹${kpis.totalSpendINR.toLocaleString()}`}
          subtitle="INR aggregate volume"
          icon={TrendingUp}
          color="accent"
        />
        <StatCard
          title="Duplicate Payment Exposure"
          value={`₹${kpis.duplicateExposureINR.toLocaleString()}`}
          subtitle={`${kpis.possibleDuplicatesCount} invoices at risk`}
          icon={Copy}
          color="error"
        />
        <StatCard
          title="Review Backlog"
          value={`${kpis.needsReviewCount} Invoices`}
          subtitle="Pending auditor clearance"
          icon={AlertTriangle}
          color="warning"
        />
      </div>

      {/* Top Suppliers Table & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Suppliers by Spend */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-primaryText">Top Vendors by Spend</h2>
              <p className="text-xs text-mutedText">Consolidated spend by vendor</p>
            </div>
            <Building className="w-4 h-4 text-accent" />
          </div>

          {data?.topSuppliers && data.topSuppliers.length > 0 ? (
            <div className="space-y-3">
              {data.topSuppliers.map((sup, idx) => (
                <div
                  key={sup.name}
                  className="p-3 rounded-lg bg-surface/60 border border-border/50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/15 border border-accent/30 text-accent font-bold flex items-center justify-center text-[11px]">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-primaryText">{sup.name}</h4>
                      <p className="text-[10px] text-mutedText">{sup.count} invoice{sup.count === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">₹{sup.total.toLocaleString()}</p>
                    <p className="text-[10px] text-mutedText">
                      {kpis.totalSpendINR > 0
                        ? `${((sup.total / kpis.totalSpendINR) * 100).toFixed(1)}% of spend`
                        : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-mutedText">No supplier data recorded.</div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-primaryText">Procurement Category Breakdown</h2>
              <p className="text-xs text-mutedText">Departmental spend allocation</p>
            </div>
            <PieIcon className="w-4 h-4 text-accent" />
          </div>

          <div className="h-48">
            {data?.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {data.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1B2935',
                      borderColor: '#30404C',
                      borderRadius: '8px',
                      color: '#F1F5F9',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-mutedText">
                No category data recorded.
              </div>
            )}
          </div>

          <div className="mt-2 space-y-1.5 max-h-24 overflow-y-auto text-xs pr-1">
            {data?.categoryBreakdown?.map((cat, idx) => (
              <div key={cat.category} className="flex items-center justify-between text-mutedText">
                <span className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  {cat.category}
                </span>
                <span className="font-semibold text-primaryText">
                  ₹{cat.amount.toLocaleString()} ({cat.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-accent" />
          <h2 className="text-base font-semibold text-primaryText">Automated Recommendations</h2>
        </div>

        {data?.recommendations && data.recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-surface/50 border border-border text-xs space-y-1.5"
              >
                <div className="font-bold text-accent flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  {rec.title}
                </div>
                <p className="text-mutedText leading-relaxed">{rec.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-mutedText py-4 text-center">
            No recommendations generated. Add more invoices to generate supplier trend insights.
          </div>
        )}
      </div>
    </div>
  );
}
