import { v4 as uuidv4 } from 'uuid';
import { db } from './db.service.js';
import { storeDocument, calculateDocumentHash } from './storage.service.js';
import { extractInvoiceWithGemini } from './gemini.service.js';
import { validateInvoice, roundCurrency } from './validation.service.js';

// Predefined synthetic scenarios for honest demo testing
export const SYNTHETIC_DEMO_SCENARIOS = {
  CLEAN: {
    supplierName: 'Apex Cloud Solutions Pvt Ltd',
    supplierTaxId: '27AAPCA1234F1Z8',
    invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    invoiceDate: '2026-10-10',
    dueDate: '2026-11-10',
    currencyCode: 'INR',
    subtotal: 45000.0,
    taxAmount: 8100.0,
    discountAmount: 0.0,
    additionalCharges: 0.0,
    totalAmount: 53100.0,
    documentType: 'INVOICE',
    category: 'Software',
    lineItems: [
      { description: 'Cloud Infrastructure Tier 3 (Oct 2026)', quantity: 1, unitPrice: 35000.0, lineTotal: 35000.0 },
      { description: 'Managed Kubernetes Cluster Support', quantity: 1, unitPrice: 10000.0, lineTotal: 10000.0 },
    ],
    confidence: 0.99,
    missingFields: [],
    uncertainNotes: 'Synthetic Clean Benchmark Invoice',
  },
  DUPLICATE: {
    supplierName: 'Apex Cloud Solutions Pvt Ltd',
    supplierTaxId: '27AAPCA1234F1Z8',
    invoiceNumber: 'INV-2026-1042', // Matches pre-seeded clean invoice
    invoiceDate: '2026-09-15',
    dueDate: '2026-10-15',
    currencyCode: 'INR',
    subtotal: 45000.0,
    taxAmount: 8100.0,
    discountAmount: 0.0,
    additionalCharges: 0.0,
    totalAmount: 53100.0,
    documentType: 'INVOICE',
    category: 'Software',
    lineItems: [
      { description: 'Cloud Infrastructure Tier 3 (Sep 2026)', quantity: 1, unitPrice: 35000.0, lineTotal: 35000.0 },
    ],
    confidence: 0.98,
    missingFields: [],
    uncertainNotes: 'Synthetic Duplicate Candidate (Re-submission)',
  },
  MISMATCH: {
    supplierName: 'Quantum Logistics India Ltd',
    supplierTaxId: '29AABCQ8819G1Z2',
    invoiceNumber: `QL-2026-${Math.floor(2000 + Math.random() * 8000)}`,
    invoiceDate: '2026-10-12',
    dueDate: '2026-11-01',
    currencyCode: 'INR',
    subtotal: 25000.0,
    taxAmount: 4500.0,
    discountAmount: 1000.0,
    additionalCharges: 500.0,
    totalAmount: 32500.0, // Expected: 25000 - 1000 + 4500 + 500 = 29000. Discrepancy = 3500!
    documentType: 'INVOICE',
    category: 'Logistics',
    lineItems: [
      { description: 'Interstate Freight Dispatch (Bengaluru - Mumbai)', quantity: 2, unitPrice: 10000.0, lineTotal: 20000.0 },
      { description: 'Cold-chain Temperature Monitoring Pack', quantity: 1, unitPrice: 5000.0, lineTotal: 5000.0 },
    ],
    confidence: 0.96,
    missingFields: [],
    uncertainNotes: 'Synthetic Arithmetic Discrepancy Scenario',
  },
};

/**
 * Ingest, extract, validate, and persist an uploaded invoice document
 */
export async function processInvoiceUpload({ userId, file, isDemoMode = false, scenarioKey = null }) {
  if (!file) {
    throw new Error('No invoice document file was uploaded');
  }

  // 1. Calculate cryptographic document hash
  const documentHash = calculateDocumentHash(file.buffer);

  // 2. Store original document in private storage
  const { storagePath, fileSize } = await storeDocument({
    buffer: file.buffer,
    originalname: file.originalname,
    mimetype: file.mimetype,
    userId,
  });

  // 3. Extract metadata (Live Gemini vs Explicit Demo Mode)
  let extracted;
  let processingNote = '';

  if (isDemoMode && scenarioKey && SYNTHETIC_DEMO_SCENARIOS[scenarioKey.toUpperCase()]) {
    extracted = { ...SYNTHETIC_DEMO_SCENARIOS[scenarioKey.toUpperCase()] };
    processingNote = `Extracted via Synthetic Demo Scenario: ${scenarioKey.toUpperCase()}`;
  } else {
    try {
      extracted = await extractInvoiceWithGemini(file.buffer, file.mimetype);
      processingNote = 'Extracted via Google Gemini AI Engine';
    } catch (aiError) {
      console.error('[DocuSense Extraction Error]:', aiError.message);
      throw aiError; // Propagate error honestly without fabricating success
    }
  }

  // 4. Retrieve tenant invoices for duplicate cross-referencing
  const { invoices: existingInvoices } = await db.getInvoicesByUser(userId, { limit: 200 });

  // 5. Deterministic validation engine
  const validationResult = validateInvoice(
    {
      ...extracted,
      documentHash,
    },
    extracted.lineItems,
    existingInvoices
  );

  // 6. State determination
  const processing_status = validationResult.findings.some((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH')
    ? 'Needs Review'
    : 'Processed';

  const review_status = 'Pending';
  const validation_status = validationResult.validation_status;

  // 7. Persist invoice record
  const invoiceId = uuidv4();
  const invoiceRecord = {
    id: invoiceId,
    user_id: userId,
    storage_path: storagePath,
    original_filename: file.originalname,
    mime_type: file.mimetype,
    file_size: fileSize,
    document_hash: documentHash,
    supplier_name: extracted.supplierName,
    supplier_tax_id: extracted.supplierTaxId || null,
    invoice_number: extracted.invoiceNumber,
    invoice_date: extracted.invoiceDate,
    due_date: extracted.dueDate || null,
    currency_code: extracted.currencyCode || 'INR',
    subtotal: roundCurrency(extracted.subtotal),
    tax_amount: roundCurrency(extracted.taxAmount),
    discount_amount: roundCurrency(extracted.discountAmount || 0),
    additional_charges: roundCurrency(extracted.additionalCharges || 0),
    total_amount: roundCurrency(extracted.totalAmount),
    category: extracted.category || 'Other',
    document_type: extracted.documentType || 'INVOICE',
    processing_status,
    review_status,
    validation_status,
    extraction_data: {
      ...extracted,
      isDemoMode: Boolean(isDemoMode),
      processingNote,
    },
  };

  const createdInvoice = await db.createInvoice(
    invoiceRecord,
    extracted.lineItems || [],
    validationResult.findings || []
  );

  // 8. Append-only audit log
  await db.addAuditLog({
    invoice_id: invoiceId,
    user_id: userId,
    action: 'UPLOAD',
    note: `${processingNote}. File "${file.originalname}" (${(fileSize / 1024).toFixed(1)} KB). Validation result: ${validation_status} with ${validationResult.findings.length} finding(s).`,
  });

  return {
    invoice: createdInvoice,
    validation: validationResult,
  };
}

/**
 * Correct extracted fields and rerun deterministic validation
 */
export async function correctInvoiceFields(userId, invoiceId, updates, correctionNote = '') {
  const existing = await db.getInvoiceById(userId, invoiceId);
  if (!existing) {
    throw new Error('Invoice not found or unauthorized');
  }

  const previousValues = {
    supplier_name: existing.supplier_name,
    invoice_number: existing.invoice_number,
    invoice_date: existing.invoice_date,
    due_date: existing.due_date,
    subtotal: existing.subtotal,
    tax_amount: existing.tax_amount,
    discount_amount: existing.discount_amount,
    additional_charges: existing.additional_charges,
    total_amount: existing.total_amount,
    category: existing.category,
  };

  const updatedInvoiceData = {
    supplier_name: updates.supplierName ?? existing.supplier_name,
    supplier_tax_id: updates.supplierTaxId ?? existing.supplier_tax_id,
    invoice_number: updates.invoiceNumber ?? existing.invoice_number,
    invoice_date: updates.invoiceDate ?? existing.invoice_date,
    due_date: updates.dueDate ?? existing.due_date,
    currency_code: updates.currencyCode ?? existing.currency_code,
    subtotal: updates.subtotal !== undefined ? roundCurrency(updates.subtotal) : Number(existing.subtotal),
    tax_amount: updates.taxAmount !== undefined ? roundCurrency(updates.taxAmount) : Number(existing.tax_amount),
    discount_amount: updates.discountAmount !== undefined ? roundCurrency(updates.discountAmount) : Number(existing.discount_amount),
    additional_charges: updates.additionalCharges !== undefined ? roundCurrency(updates.additionalCharges) : Number(existing.additional_charges),
    total_amount: updates.totalAmount !== undefined ? roundCurrency(updates.totalAmount) : Number(existing.total_amount),
    category: updates.category ?? existing.category,
  };

  // Re-run validation with updated fields
  const { invoices: allInvoices } = await db.getInvoicesByUser(userId, { limit: 200 });
  const revalidation = validateInvoice(
    {
      ...updatedInvoiceData,
      id: invoiceId,
      documentHash: existing.document_hash,
    },
    existing.invoice_line_items || [],
    allInvoices
  );

  updatedInvoiceData.validation_status = revalidation.validation_status;
  if (revalidation.isClean) {
    updatedInvoiceData.processing_status = 'Processed';
  }

  const saved = await db.updateInvoice(userId, invoiceId, updatedInvoiceData);

  // If arithmetic mismatch is resolved, resolve open arithmetic findings
  if (revalidation.checks.find((c) => c.name === 'Arithmetic Verification')?.status === 'PASSED') {
    const findings = await db.getFindingsByUser(userId, 'OPEN');
    for (const f of findings) {
      if (f.invoice_id === invoiceId && f.finding_type === 'ARITHMETIC_MISMATCH') {
        await db.updateFindingStatus(userId, f.id, 'RESOLVED', userId);
      }
    }
  }

  // Audit log for correction
  await db.addAuditLog({
    invoice_id: invoiceId,
    user_id: userId,
    action: 'FIELD_CORRECTED',
    previous_values: previousValues,
    new_values: updatedInvoiceData,
    note: correctionNote || 'User edited invoice values. Re-validation executed.',
  });

  return {
    invoice: saved,
    revalidation,
  };
}

/**
 * Perform human-in-the-loop review actions (Approve, Reject, Resolve Finding)
 */
export async function performReviewAction(userId, invoiceId, { action, note = '', findingId = null }) {
  const existing = await db.getInvoiceById(userId, invoiceId);
  if (!existing) {
    throw new Error('Invoice not found or unauthorized');
  }

  const now = new Date().toISOString();

  if (action === 'APPROVE') {
    const updated = await db.updateInvoice(userId, invoiceId, {
      review_status: 'Approved',
      reviewed_at: now,
      reviewed_by: userId,
    });

    await db.addAuditLog({
      invoice_id: invoiceId,
      user_id: userId,
      action: 'APPROVED',
      note: note || 'Invoice approved by reviewer.',
    });

    return updated;
  }

  if (action === 'REJECT') {
    const updated = await db.updateInvoice(userId, invoiceId, {
      review_status: 'Rejected',
      reviewed_at: now,
      reviewed_by: userId,
    });

    await db.addAuditLog({
      invoice_id: invoiceId,
      user_id: userId,
      action: 'REJECTED',
      note: note || 'Invoice rejected by reviewer.',
    });

    return updated;
  }

  if (action === 'RESOLVE_FINDING' && findingId) {
    const resolved = await db.updateFindingStatus(userId, findingId, 'RESOLVED', userId);

    await db.addAuditLog({
      invoice_id: invoiceId,
      user_id: userId,
      action: 'RESOLVED',
      note: note || `Finding ${findingId} marked as resolved.`,
    });

    return resolved;
  }

  throw new Error(`Unsupported review action: ${action}`);
}
