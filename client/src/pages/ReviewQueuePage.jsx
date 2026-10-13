import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  CheckCircle,
  XCircle,
  CheckSquare,
  FileText,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import api from '../services/api';
import { FindingBadge } from '../components/ui/FindingBadge';
import { StatusBadge } from '../components/ui/StatusBadge';

export function ReviewQueuePage() {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionModal, setActionModal] = useState(null); // { action, invoiceId, findingId, title }
  const [actionNote, setActionNote] = useState('');

  const fetchFindings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/review?status=OPEN');
      if (res.data.success) {
        setFindings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFindings();
  }, []);

  const handleExecuteAction = async (e) => {
    e.preventDefault();
    if (!actionModal) return;

    try {
      setActionLoading(true);
      await api.post(`/review/${actionModal.invoiceId}`, {
        action: actionModal.action,
        findingId: actionModal.findingId,
        note: actionNote || `Action ${actionModal.action} approved by auditor`,
      });

      setActionModal(null);
      setActionNote('');
      fetchFindings();
    } catch (err) {
      alert(err.response?.data?.error || 'Action execution failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primaryText">Human-in-the-Loop Review Queue</h1>
        <p className="text-sm text-mutedText mt-0.5">
          Invoices flagged by deterministic arithmetic checks, duplicate collision engine, or extraction uncertainty
        </p>
      </div>

      {/* Queue Summary Banner */}
      <div className="bg-card border border-state-warning/30 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-state-warning/15 text-state-warning">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primaryText">
              {findings.length} Finding{findings.length === 1 ? '' : 's'} Requiring Human Review
            </h3>
            <p className="text-xs text-mutedText">
              Flagged items prevent erroneous supplier payments and enforce arithmetic fidelity.
            </p>
          </div>
        </div>

        <button
          onClick={fetchFindings}
          className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-semibold text-primaryText hover:border-accent transition-colors"
        >
          Refresh Queue
        </button>
      </div>

      {/* Findings List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-mutedText">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading audit review findings...
        </div>
      ) : findings.length > 0 ? (
        <div className="space-y-4">
          {findings.map((finding) => (
            <div
              key={finding.id}
              className="bg-card border border-border rounded-xl p-5 shadow-lg space-y-4 transition-all hover:border-border/80"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border/50 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FindingBadge severity={finding.severity} />
                    <h3 className="text-base font-bold text-primaryText">{finding.title}</h3>
                  </div>
                  <p className="text-xs text-mutedText mt-1">
                    Invoice #{' '}
                    <strong className="text-primaryText">{finding.invoice?.invoice_number || 'Unknown'}</strong> &bull;{' '}
                    Supplier:{' '}
                    <strong className="text-primaryText">{finding.invoice?.supplier_name || 'Unknown'}</strong> &bull;{' '}
                    Total:{' '}
                    <strong className="text-accent">
                      ₹{Number(finding.invoice?.total_amount || 0).toLocaleString()}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/api/invoices/${finding.invoice_id}/document`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded bg-surface hover:bg-surface/80 border border-border text-xs text-mutedText hover:text-primaryText flex items-center gap-1 font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Document
                  </a>
                </div>
              </div>

              {/* Description & Evidence */}
              <div className="text-xs leading-relaxed text-mutedText bg-surface/40 p-3.5 rounded-lg border border-border/50">
                <p className="text-primaryText font-medium mb-1.5">{finding.description}</p>
                {finding.evidence && Object.keys(finding.evidence).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    {Object.entries(finding.evidence).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-mutedText uppercase text-[10px] block">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-semibold text-primaryText font-mono">
                          {typeof val === 'number' ? `₹${val.toLocaleString()}` : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="text-[11px] text-mutedText">
                  Recommended action:{' '}
                  <span className="text-primaryText font-medium">
                    {finding.finding_type === 'DUPLICATE_CANDIDATE'
                      ? 'Confirm duplicate billing with supplier before dismissing'
                      : finding.finding_type === 'ARITHMETIC_MISMATCH'
                      ? 'Inspect document math or correct extracted field'
                      : 'Review required fields'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setActionModal({
                        action: 'RESOLVE_FINDING',
                        invoiceId: finding.invoice_id,
                        findingId: finding.id,
                        title: `Resolve Finding: ${finding.title}`,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-semibold text-state-success hover:bg-state-success/10 transition-colors flex items-center gap-1"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    Resolve Finding
                  </button>

                  <button
                    onClick={() =>
                      setActionModal({
                        action: 'APPROVE',
                        invoiceId: finding.invoice_id,
                        findingId: finding.id,
                        title: `Approve Invoice #${finding.invoice?.invoice_number}`,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve Invoice
                  </button>

                  <button
                    onClick={() =>
                      setActionModal({
                        action: 'REJECT',
                        invoiceId: finding.invoice_id,
                        findingId: finding.id,
                        title: `Reject Invoice #${finding.invoice?.invoice_number}`,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-state-error/20 border border-state-error/40 text-xs font-semibold text-state-error hover:bg-state-error/30 transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject Invoice
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-lg">
          <div className="w-12 h-12 rounded-full bg-state-success/20 border border-state-success/40 text-state-success flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-primaryText">Review Queue is Empty</h3>
          <p className="text-xs text-mutedText mt-1 max-w-sm mx-auto">
            All invoices have passed deterministic validation or have been reviewed and approved.
          </p>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-canvas/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-primaryText">{actionModal.title}</h3>
            <p className="text-xs text-mutedText">
              This action will update the review status and create an immutable record in the audit log.
            </p>

            <form onSubmit={handleExecuteAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-mutedText uppercase tracking-wider mb-1">
                  Audit Decision Note
                </label>
                <textarea
                  rows="3"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Provide audit rationale (e.g. Verified paper contract matches discrepancy)..."
                  className="w-full p-2.5 rounded-lg bg-surface border border-border text-primaryText text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs text-mutedText hover:text-primaryText"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-accent text-canvas font-semibold text-xs hover:bg-accent-hover transition-colors shadow"
                >
                  {actionLoading ? 'Executing...' : 'Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
