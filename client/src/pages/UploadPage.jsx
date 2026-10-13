import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Calculator,
  Copy,
  Layers,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/ui/StatusBadge';
import { FindingBadge } from '../components/ui/FindingBadge';

export function UploadPage() {
  const [file, setFile] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [scenarioKey, setScenarioKey] = useState('CLEAN');
  const [processing, setProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const stages = [
    { title: 'Uploading Document', desc: 'Cryptographic SHA-256 hash & private storage' },
    { title: 'Extracting Invoice Data', desc: isDemoMode ? 'Synthetic benchmark extraction' : 'Gemini AI document parsing' },
    { title: 'Deterministic Validation', desc: 'Decimal arithmetic verification & required fields' },
    { title: 'Duplicate Ingestion Check', desc: 'Tenant workspace historical hash & number collision check' },
    { title: 'Persisting Audit Records', desc: 'Writing immutable audit history' },
  ];

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.size > 10 * 1024 * 1024) {
      setError('File exceeds maximum allowed upload size (10 MB).');
      return;
    }

    setFile(selected);
    setError('');
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = e.dataTransfer.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        setError('File exceeds maximum allowed upload size (10 MB).');
        return;
      }
      setFile(selected);
      setError('');
      setResult(null);
    }
  };

  const handleSelectScenario = (key) => {
    setIsDemoMode(true);
    setScenarioKey(key);
    setError('');
    // If no file currently picked, create a synthetic dummy PDF file so form can submit
    if (!file) {
      const dummyContent = `%PDF-1.4\n1 0 obj\n<< /Title (Synthetic Benchmark ${key}) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
      const blob = new Blob([dummyContent], { type: 'application/pdf' });
      const syntheticFile = new File([blob], `synthetic_${key.toLowerCase()}_invoice.pdf`, { type: 'application/pdf' });
      setFile(syntheticFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an invoice document to audit.');
      return;
    }

    setError('');
    setProcessing(true);
    setCurrentStage(0);

    // Stage progression animation
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => (prev < 4 ? prev + 1 : prev));
    }, 600);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('isDemoMode', isDemoMode ? 'true' : 'false');
    if (isDemoMode) {
      formData.append('scenarioKey', scenarioKey);
    }

    try {
      const res = await api.post('/invoices/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearInterval(stageInterval);
      setCurrentStage(4);
      setResult(res.data.data);
    } catch (err) {
      clearInterval(stageInterval);
      const serverMsg = err.response?.data?.error || err.message || 'Invoice processing failed.';
      setError(serverMsg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primaryText">Upload &amp; Audit Invoice</h1>
        <p className="text-sm text-mutedText mt-0.5">
          Submit PDFs or images for structured Gemini AI extraction and deterministic arithmetic validation
        </p>
      </div>

      {/* Mode Selection Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Live Processing Option */}
        <div
          onClick={() => setIsDemoMode(false)}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            !isDemoMode
              ? 'bg-card border-accent shadow-md glow-teal'
              : 'bg-card/50 border-border hover:border-border/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${!isDemoMode ? 'bg-accent/20 text-accent' : 'bg-surface text-mutedText'}`}>
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-primaryText">Live Gemini AI Processing</h3>
              <p className="text-xs text-mutedText">Extracts text and tables using Google Gemini 2.5 Flash</p>
            </div>
          </div>
        </div>

        {/* Synthetic Demo Option */}
        <div
          onClick={() => setIsDemoMode(true)}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            isDemoMode
              ? 'bg-card border-accent shadow-md glow-teal'
              : 'bg-card/50 border-border hover:border-border/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDemoMode ? 'bg-accent/20 text-accent' : 'bg-surface text-mutedText'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-primaryText">Synthetic Benchmark Demo</h3>
              <p className="text-xs text-mutedText">Instant validation testing with predefined scenarios</p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Scenario Picker if Demo Mode is Active */}
      {isDemoMode && (
        <div className="bg-surface/50 border border-border rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Select Synthetic Scenario:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleSelectScenario('CLEAN')}
              className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                scenarioKey === 'CLEAN'
                  ? 'bg-accent/15 border-accent text-primaryText font-semibold'
                  : 'bg-card border-border text-mutedText hover:border-border/80'
              }`}
            >
              <div className="font-semibold text-primaryText">Sample A: Clean</div>
              <div className="text-[11px] text-mutedText mt-0.5">Valid math, 0 findings</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectScenario('DUPLICATE')}
              className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                scenarioKey === 'DUPLICATE'
                  ? 'bg-state-warning/15 border-state-warning text-primaryText font-semibold'
                  : 'bg-card border-border text-mutedText hover:border-border/80'
              }`}
            >
              <div className="font-semibold text-primaryText">Sample B: Duplicate</div>
              <div className="text-[11px] text-mutedText mt-0.5">Collides with existing INV-1042</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectScenario('MISMATCH')}
              className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                scenarioKey === 'MISMATCH'
                  ? 'bg-state-error/15 border-state-error text-primaryText font-semibold'
                  : 'bg-card border-border text-mutedText hover:border-border/80'
              }`}
            >
              <div className="font-semibold text-primaryText">Sample C: Math Mismatch</div>
              <div className="text-[11px] text-mutedText mt-0.5">Calculated total ≠ Stated total</div>
            </button>
          </div>
        </div>
      )}

      {/* Upload Dropzone */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
            file
              ? 'border-accent/60 bg-accent/5'
              : 'border-border hover:border-accent/40 bg-card/60 hover:bg-card'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center text-accent mx-auto mb-4 shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>

          {file ? (
            <div>
              <p className="text-base font-semibold text-primaryText">{file.name}</p>
              <p className="text-xs text-mutedText mt-1">
                {(file.size / 1024).toFixed(1)} KB &bull; Click or drag to replace
              </p>
            </div>
          ) : (
            <div>
              <p className="text-base font-semibold text-primaryText">
                Drag and drop your invoice here, or <span className="text-accent underline">browse</span>
              </p>
              <p className="text-xs text-mutedText mt-1.5">
                Supported formats: PDF, PNG, JPEG, WebP (Max 10 MB)
              </p>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-state-error/15 border border-state-error/30 text-state-error text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 leading-relaxed">{error}</div>
            <button type="button" onClick={() => setError('')} className="text-state-error/70 hover:text-state-error">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3">
          {file && (
            <button
              type="button"
              disabled={processing}
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="px-4 py-2.5 rounded-lg border border-border text-xs text-mutedText hover:text-primaryText hover:bg-surface transition-colors"
            >
              Clear
            </button>
          )}

          <button
            type="submit"
            disabled={!file || processing}
            className="px-6 py-2.5 rounded-lg bg-accent text-canvas font-semibold text-sm hover:bg-accent-hover transition-colors shadow-lg glow-teal disabled:opacity-40 flex items-center gap-2"
          >
            {processing ? 'Processing Pipeline...' : 'Run Audit Pipeline'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Real-time Pipeline Stages Progress */}
      {processing && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-semibold text-primaryText flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              Auditing Invoice In Progress...
            </h3>
            <span className="text-xs text-accent font-mono font-semibold">Stage {currentStage + 1} of 5</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            {stages.map((stg, idx) => {
              const isPast = idx < currentStage;
              const isCurrent = idx === currentStage;
              return (
                <div
                  key={stg.title}
                  className={`p-3 rounded-lg border text-xs transition-colors ${
                    isPast
                      ? 'bg-state-success/10 border-state-success/40 text-state-success'
                      : isCurrent
                      ? 'bg-accent/15 border-accent text-accent animate-pulse'
                      : 'bg-surface/50 border-border text-mutedText/60'
                  }`}
                >
                  <div className="font-semibold">{stg.title}</div>
                  <div className="text-[10px] opacity-80 mt-1">{stg.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Extraction & Validation Results Card */}
      {result && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-primaryText">Audit Results</h3>
                <StatusBadge status={result.validation?.validation_status || result.invoice?.validation_status} />
              </div>
              <p className="text-xs text-mutedText mt-1">
                Supplier: <strong className="text-primaryText">{result.invoice?.supplier_name}</strong> &bull; Invoice #{' '}
                <strong className="text-primaryText">{result.invoice?.invoice_number}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/invoices?selected=${result.invoice?.id}`)}
                className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-semibold text-primaryText hover:border-accent transition-colors"
              >
                Inspect in All Invoices
              </button>
              {result.validation?.findings?.length > 0 && (
                <button
                  type="button"
                  onClick={() => navigate('/review')}
                  className="px-3 py-1.5 rounded-lg bg-state-warning/20 border border-state-warning/40 text-xs font-semibold text-state-warning hover:bg-state-warning/30 transition-colors"
                >
                  Resolve in Review Queue
                </button>
              )}
            </div>
          </div>

          {/* Validation Checks Banner */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-mutedText">Validation Engine Checks</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.validation?.checks?.map((check) => (
                <div key={check.name} className="p-3 rounded-lg bg-surface border border-border text-xs flex items-start gap-2.5">
                  {check.status === 'PASSED' ? (
                    <CheckCircle2 className="w-4 h-4 text-state-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-state-warning flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold text-primaryText">{check.name}: </span>
                    <span className="text-mutedText">{check.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Findings if any */}
          {result.validation?.findings && result.validation.findings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-state-warning">
                Flagged Audit Findings ({result.validation.findings.length})
              </h4>
              <div className="space-y-2">
                {result.validation.findings.map((f, i) => (
                  <div key={i} className="p-3.5 rounded-lg bg-card border border-state-warning/40 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <FindingBadge severity={f.severity} />
                        <span className="font-semibold text-xs text-primaryText">{f.title}</span>
                      </div>
                      <p className="text-xs text-mutedText mt-1.5 leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Breakdown Table */}
          <div className="bg-surface rounded-lg p-4 border border-border text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-border/50 text-mutedText">
              <span>Subtotal:</span>
              <span className="font-medium text-primaryText">₹{Number(result.invoice?.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50 text-mutedText">
              <span>Tax Amount:</span>
              <span className="font-medium text-primaryText">₹{Number(result.invoice?.tax_amount).toLocaleString()}</span>
            </div>
            {Number(result.invoice?.discount_amount) > 0 && (
              <div className="flex justify-between py-1 border-b border-border/50 text-mutedText">
                <span>Discount:</span>
                <span className="font-medium text-emerald-400">-₹{Number(result.invoice?.discount_amount).toLocaleString()}</span>
              </div>
            )}
            {Number(result.invoice?.additional_charges) > 0 && (
              <div className="flex justify-between py-1 border-b border-border/50 text-mutedText">
                <span>Additional Charges:</span>
                <span className="font-medium text-primaryText">+₹{Number(result.invoice?.additional_charges).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between py-1 font-bold text-sm text-accent pt-1">
              <span>Stated Total:</span>
              <span>₹{Number(result.invoice?.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
