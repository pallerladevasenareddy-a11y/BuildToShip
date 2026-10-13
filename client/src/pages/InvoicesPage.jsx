import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  FileText,
  AlertCircle,
  Eye,
  Edit3,
  CheckCircle2,
  X,
  History,
  ExternalLink,
  Save,
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/ui/StatusBadge';
import { FindingBadge } from '../components/ui/FindingBadge';

export function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({});
  const [editNote, setEditNote] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [searchParams] = useSearchParams();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter && statusFilter !== 'ALL') params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const res = await api.get('/invoices', { params });
      if (res.data.success) {
        setInvoices(res.data.data);
      }
    } catch (err) {
      console.error('Error loading invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter, categoryFilter]);

  // Handle URL param selected invoice
  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId) {
      handleOpenDetails(selectedId);
    }
  }, [searchParams]);

  const handleOpenDetails = async (id) => {
    try {
      setDetailLoading(true);
      setEditMode(false);
      const res = await api.get(`/invoices/${id}`);
      if (res.data.success) {
        setSelectedInvoice(res.data.data);
        setEditFields({
          supplierName: res.data.data.supplier_name,
          invoiceNumber: res.data.data.invoice_number,
          invoiceDate: res.data.data.invoice_date,
          subtotal: res.data.data.subtotal,
          taxAmount: res.data.data.tax_amount,
          discountAmount: res.data.data.discount_amount || 0,
          additionalCharges: res.data.data.additional_charges || 0,
          totalAmount: res.data.data.total_amount,
          category: res.data.data.category,
        });
      }
    } catch (err) {
      console.error('Error fetching invoice details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveCorrection = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      setSavingEdit(true);
      const res = await api.patch(`/invoices/${selectedInvoice.id}`, {
        ...editFields,
        subtotal: Number(editFields.subtotal),
        taxAmount: Number(editFields.taxAmount),
        discountAmount: Number(editFields.discountAmount),
        additionalCharges: Number(editFields.additionalCharges),
        totalAmount: Number(editFields.totalAmount),
        correctionNote: editNote || 'Corrected via invoice detail manager',
      });

      if (res.data.success) {
        setEditMode(false);
        setEditNote('');
        handleOpenDetails(selectedInvoice.id);
        fetchInvoices();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save correction.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primaryText">All Invoices</h1>
        <p className="text-sm text-mutedText mt-0.5">
          Audited invoices directory with deterministic math checks and immutable audit trail
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-mutedText absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice # or supplier..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface border border-border text-primaryText placeholder-mutedText/50 text-xs focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-surface border border-border text-xs text-primaryText focus:outline-none focus:border-accent"
          >
            <option value="ALL">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Needs Review">Needs Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-surface border border-border text-xs text-primaryText focus:outline-none focus:border-accent"
          >
            <option value="">All Categories</option>
            <option value="Software">Software</option>
            <option value="Logistics">Logistics</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Equipment">Equipment</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-mutedText">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading invoices directory...
          </div>
        ) : invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-mutedText uppercase tracking-wider text-[11px] bg-surface/40">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Invoice Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-primaryText">{inv.invoice_number}</td>
                    <td className="py-3.5 px-4 text-mutedText">{inv.supplier_name}</td>
                    <td className="py-3.5 px-4 text-mutedText">{inv.invoice_date}</td>
                    <td className="py-3.5 px-4 text-mutedText">{inv.due_date || '—'}</td>
                    <td className="py-3.5 px-4 text-mutedText">{inv.category}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-primaryText">
                      ₹{Number(inv.total_amount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={inv.review_status === 'Approved' ? 'Approved' : inv.validation_status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetails(inv.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface hover:bg-surface/80 border border-border text-accent text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-mutedText">
            No invoices matched your query criteria.
          </div>
        )}
      </div>

      {/* Invoice Details & Audit Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-canvas/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-start justify-between sticky top-0 bg-card/95 backdrop-blur z-10">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-primaryText">
                    Invoice #{selectedInvoice.invoice_number}
                  </h3>
                  <StatusBadge status={selectedInvoice.review_status === 'Approved' ? 'Approved' : selectedInvoice.validation_status} />
                </div>
                <p className="text-xs text-mutedText mt-0.5">
                  Supplier: <strong className="text-primaryText">{selectedInvoice.supplier_name}</strong> &bull; Date: {selectedInvoice.invoice_date}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditMode(!editMode)}
                  className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    editMode
                      ? 'bg-accent/20 border-accent text-accent'
                      : 'bg-surface border-border text-mutedText hover:text-primaryText'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {editMode ? 'Cancel Edit' : 'Correct Fields'}
                </button>

                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 rounded-lg hover:bg-surface text-mutedText hover:text-primaryText transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Field Correction Form */}
              {editMode ? (
                <form onSubmit={handleSaveCorrection} className="bg-surface/50 border border-accent/40 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" />
                      Human-in-the-Loop Field Correction
                    </h4>
                    <span className="text-[11px] text-mutedText">Changes automatically rerun validation</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-mutedText mb-1">Supplier Name</label>
                      <input
                        type="text"
                        value={editFields.supplierName}
                        onChange={(e) => setEditFields({ ...editFields, supplierName: e.target.value })}
                        className="w-full p-2 rounded bg-card border border-border text-primaryText"
                      />
                    </div>
                    <div>
                      <label className="block text-mutedText mb-1">Invoice Number</label>
                      <input
                        type="text"
                        value={editFields.invoiceNumber}
                        onChange={(e) => setEditFields({ ...editFields, invoiceNumber: e.target.value })}
                        className="w-full p-2 rounded bg-card border border-border text-primaryText"
                      />
                    </div>
                    <div>
                      <label className="block text-mutedText mb-1">Subtotal (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editFields.subtotal}
                        onChange={(e) => setEditFields({ ...editFields, subtotal: e.target.value })}
                        className="w-full p-2 rounded bg-card border border-border text-primaryText"
                      />
                    </div>
                    <div>
                      <label className="block text-mutedText mb-1">Tax Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editFields.taxAmount}
                        onChange={(e) => setEditFields({ ...editFields, taxAmount: e.target.value })}
                        className="w-full p-2 rounded bg-card border border-border text-primaryText"
                      />
                    </div>
                    <div>
                      <label className="block text-mutedText mb-1">Discount Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editFields.discountAmount}
                        onChange={(e) => setEditFields({ ...editFields, discountAmount: e.target.value })}
                        className="w-full p-2 rounded bg-card border border-border text-primaryText"
                      />
                    </div>
                    <div>
                      <label className="block text-mutedText mb-1">Additional Charges (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editFields.additionalCharges}
                        onChange={(e) => setEditFields({ ...editFields, additionalCharges: e.target.value })}
                        className="w-full p-2 rounded bg-card border border-border text-primaryText"
                      />
                    </div>
                    <div>
                      <label className="block text-mutedText mb-1 font-bold text-accent">Stated Total (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editFields.totalAmount}
                        onChange={(e) => setEditFields({ ...editFields, totalAmount: e.target.value })}
                        className="w-full p-2 rounded bg-card border border-accent text-accent font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-mutedText mb-1">Correction Reason / Audit Note</label>
                      <input
                        type="text"
                        required
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="e.g. Corrected stated total to match subtotal + tax"
                        className="w-full p-2 rounded bg-card border border-border text-primaryText"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-3 py-1.5 rounded border border-border text-xs text-mutedText hover:text-primaryText"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="px-4 py-1.5 rounded bg-accent text-canvas font-semibold text-xs hover:bg-accent-hover flex items-center gap-1.5 shadow"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {savingEdit ? 'Re-validating...' : 'Save & Re-validate'}
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Validation Findings */}
              {selectedInvoice.invoice_findings?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-state-warning">
                    Validation Findings ({selectedInvoice.invoice_findings.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedInvoice.invoice_findings.map((f) => (
                      <div key={f.id} className="p-3.5 rounded-lg bg-surface border border-state-warning/30 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FindingBadge severity={f.severity} />
                            <span className="font-semibold text-primaryText">{f.title}</span>
                          </div>
                          <span className={`text-[10px] font-semibold ${f.status === 'RESOLVED' ? 'text-state-success' : 'text-state-warning'}`}>
                            {f.status}
                          </span>
                        </div>
                        <p className="text-mutedText mt-1.5 leading-relaxed">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial Calculation Breakdown */}
              <div className="bg-surface rounded-xl p-4 border border-border space-y-2 text-xs">
                <h4 className="font-semibold text-primaryText uppercase tracking-wider text-[11px] mb-2">Financial Breakdown</h4>
                <div className="flex justify-between py-1 text-mutedText border-b border-border/40">
                  <span>Subtotal:</span>
                  <span className="text-primaryText font-medium">₹{Number(selectedInvoice.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-mutedText border-b border-border/40">
                  <span>Tax Amount:</span>
                  <span className="text-primaryText font-medium">₹{Number(selectedInvoice.tax_amount).toLocaleString()}</span>
                </div>
                {Number(selectedInvoice.discount_amount) > 0 && (
                  <div className="flex justify-between py-1 text-mutedText border-b border-border/40">
                    <span>Discount:</span>
                    <span className="text-emerald-400 font-medium">-₹{Number(selectedInvoice.discount_amount).toLocaleString()}</span>
                  </div>
                )}
                {Number(selectedInvoice.additional_charges) > 0 && (
                  <div className="flex justify-between py-1 text-mutedText border-b border-border/40">
                    <span>Additional Charges:</span>
                    <span className="text-primaryText font-medium">+₹{Number(selectedInvoice.additional_charges).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 font-bold text-sm text-accent pt-2">
                  <span>Stated Total:</span>
                  <span>₹{Number(selectedInvoice.total_amount).toLocaleString()}</span>
                </div>
              </div>

              {/* Line Items Table */}
              {selectedInvoice.invoice_line_items?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-mutedText">Line Items ({selectedInvoice.invoice_line_items.length})</h4>
                  <div className="border border-border rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-surface/50 text-mutedText uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Description</th>
                          <th className="p-2.5 text-center">Qty</th>
                          <th className="p-2.5 text-right">Unit Price</th>
                          <th className="p-2.5 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {selectedInvoice.invoice_line_items.map((item) => (
                          <tr key={item.id}>
                            <td className="p-2.5 text-primaryText">{item.description}</td>
                            <td className="p-2.5 text-center text-mutedText">{item.quantity ?? '—'}</td>
                            <td className="p-2.5 text-right text-mutedText">
                              {item.unit_price ? `₹${Number(item.unit_price).toLocaleString()}` : '—'}
                            </td>
                            <td className="p-2.5 text-right font-medium text-primaryText">
                              ₹{Number(item.line_total).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Append-Only Audit History */}
              {selectedInvoice.audit_logs?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-mutedText flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    Immutable Audit Log ({selectedInvoice.audit_logs.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedInvoice.audit_logs.map((log) => (
                      <div key={log.id} className="p-2.5 rounded bg-surface/60 border border-border text-xs flex justify-between items-start">
                        <div>
                          <span className="font-bold text-accent">{log.action}: </span>
                          <span className="text-mutedText">{log.note}</span>
                        </div>
                        <span className="text-[10px] text-mutedText whitespace-nowrap ml-2">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-surface/30 flex items-center justify-between text-xs text-mutedText">
              <span>SHA-256: <code className="font-mono text-[10px] text-primaryText">{selectedInvoice.document_hash.substring(0, 16)}...</code></span>
              <a
                href={`/api/invoices/${selectedInvoice.id}/document`}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline flex items-center gap-1 font-semibold"
              >
                View Stored PDF <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
