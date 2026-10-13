import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  IndianRupee,
  AlertTriangle,
  Copy,
  UploadCloud,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
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
import { StatusBadge } from '../components/ui/StatusBadge';

export function OverviewPage() {
  const [summary, setSummary] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [insightsRes, invoicesRes] = await Promise.all([
          api.get('/insights/summary'),
          api.get('/invoices?limit=5'),
        ]);

        if (insightsRes.data.success) {
          setSummary(insightsRes.data.data);
        }
        if (invoicesRes.data.success) {
          setRecentInvoices(invoicesRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const COLORS = ['#75D9C3', '#45C49A', '#E9B85D', '#60A5FA', '#A78BFA', '#F472B6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-mutedText">Loading audit records &amp; spend metrics...</p>
        </div>
      </div>
    );
  }

  const kpis = summary?.kpis || {
    totalInvoices: 0,
    totalSpendINR: 0,
    needsReviewCount: 0,
    possibleDuplicatesCount: 0,
    duplicateExposureINR: 0,
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primaryText">Audit Overview</h1>
          <p className="text-sm text-mutedText mt-0.5">
            Real-time telemetry, deterministic validation &amp; spend risk analysis
          </p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-canvas font-semibold text-sm hover:bg-accent-hover transition-colors shadow-lg glow-teal"
        >
          <UploadCloud className="w-4 h-4" />
          Upload New Invoice
        </Link>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Invoices"
          value={kpis.totalInvoices}
          subtitle="Processed documents in workspace"
          icon={FileText}
          color="accent"
        />
        <StatCard
          title="Total Spend"
          value={`₹${kpis.totalSpendINR.toLocaleString()}`}
          subtitle="INR aggregate amount"
          icon={IndianRupee}
          color="success"
        />
        <StatCard
          title="Needs Review"
          value={kpis.needsReviewCount}
          subtitle="Flagged by validation engine"
          icon={AlertTriangle}
          color="warning"
        />
        <StatCard
          title="Possible Duplicates"
          value={kpis.possibleDuplicatesCount}
          subtitle={`₹${kpis.duplicateExposureINR.toLocaleString()} at-risk exposure`}
          icon={Copy}
          color="error"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-primaryText">Monthly Spend Trajectory</h2>
              <p className="text-xs text-mutedText">Persisted invoice totals across calendar months</p>
            </div>
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>

          <div className="h-64">
            {summary?.monthlyTrend && summary.monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.monthlyTrend}>
                  <XAxis dataKey="month" stroke="#A0AFBD" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#A0AFBD"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1B2935',
                      borderColor: '#30404C',
                      borderRadius: '8px',
                      color: '#F1F5F9',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Spend']}
                  />
                  <Bar dataKey="spend" fill="#75D9C3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-mutedText">
                No monthly observations available yet
              </div>
            )}
          </div>
        </div>

        {/* Spend by Category Chart */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-primaryText">Spend by Category</h2>
              <p className="text-xs text-mutedText">Categorical procurement distribution</p>
            </div>
          </div>

          <div className="h-48">
            {summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {summary.categoryBreakdown.map((entry, index) => (
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
                No category data available
              </div>
            )}
          </div>

          <div className="mt-2 space-y-1.5 max-h-24 overflow-y-auto text-xs pr-1">
            {summary?.categoryBreakdown?.map((cat, idx) => (
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

      {/* Recent Invoices Table & Action Banner */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-primaryText">Recently Ingested Invoices</h2>
            <p className="text-xs text-mutedText">Live persisted documents with audit findings</p>
          </div>
          <Link
            to="/invoices"
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
          >
            View All Invoices <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-mutedText uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3">Invoice Date</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-primaryText">{inv.invoice_number}</td>
                    <td className="py-3 px-3 text-mutedText">{inv.supplier_name}</td>
                    <td className="py-3 px-3 text-mutedText">{inv.invoice_date}</td>
                    <td className="py-3 px-3 text-mutedText">{inv.category}</td>
                    <td className="py-3 px-3 text-right font-bold text-primaryText">
                      ₹{Number(inv.total_amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <StatusBadge status={inv.review_status === 'Approved' ? 'Approved' : inv.validation_status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/invoices?selected=${inv.id}`}
                        className="text-accent hover:underline font-medium text-xs"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-mutedText">
            No invoices recorded. Click "Upload New Invoice" to audit your first invoice!
          </div>
        )}
      </div>
    </div>
  );
}
