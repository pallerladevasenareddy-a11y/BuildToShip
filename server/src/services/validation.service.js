/**
 * Deterministic Financial Validation Engine for DocuSense AI
 * Financial arithmetic is computed deterministically with decimal rounding tolerances.
 */

// Rounding helper for currency amounts (2 decimal places)
export function roundCurrency(num) {
  if (typeof num !== 'number' || isNaN(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

// Compare two currency amounts within tolerance
export function areAmountsEqual(a, b, tolerance = 0.05) {
  return Math.abs(roundCurrency(a) - roundCurrency(b)) <= tolerance;
}

// Normalize supplier name for comparison
export function normalizeSupplier(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\b(pvt|ltd|limited|inc|corp|co|llc|gmbh|sa)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Normalize invoice number
export function normalizeInvoiceNumber(num) {
  return (num || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Run deterministic validation checks on extracted invoice data.
 * @param {Object} invoiceData Extracted or edited invoice fields
 * @param {Array} lineItems Array of line items
 * @param {Array} existingInvoices Pre-fetched candidate invoices for the tenant to check duplicates
 * @returns {Object} { validation_status, checks, findings, isClean }
 */
export function validateInvoice(invoiceData, lineItems = [], existingInvoices = []) {
  const checks = [];
  const findings = [];

  const supplierName = invoiceData.supplierName ?? invoiceData.supplier_name;
  const invoiceNumber = invoiceData.invoiceNumber ?? invoiceData.invoice_number;
  const invoiceDate = invoiceData.invoiceDate ?? invoiceData.invoice_date;
  const dueDate = invoiceData.dueDate ?? invoiceData.due_date;
  const currencyCode = invoiceData.currencyCode ?? invoiceData.currency_code ?? 'INR';
  const subtotal = invoiceData.subtotal !== undefined ? invoiceData.subtotal : 0;
  const taxAmount = invoiceData.taxAmount ?? invoiceData.tax_amount ?? 0;
  const discountAmount = invoiceData.discountAmount ?? invoiceData.discount_amount ?? 0;
  const additionalCharges = invoiceData.additionalCharges ?? invoiceData.additional_charges ?? 0;
  const totalAmount = invoiceData.totalAmount ?? invoiceData.total_amount ?? 0;
  const documentHash = invoiceData.documentHash ?? invoiceData.document_hash ?? null;

  // --------------------------------------------------------------------------
  // 1. Required Fields Check
  // --------------------------------------------------------------------------
  const missing = [];
  if (!supplierName || supplierName.trim() === '') missing.push('supplier_name');
  if (!invoiceNumber || invoiceNumber.trim() === '') missing.push('invoice_number');
  if (!invoiceDate || invoiceDate.trim() === '') missing.push('invoice_date');
  if (totalAmount === undefined || totalAmount === null) missing.push('total_amount');

  if (missing.length > 0) {
    checks.push({
      name: 'Required Fields',
      status: 'FAILED',
      message: `Missing required invoice fields: ${missing.join(', ')}`,
    });
    findings.push({
      finding_type: 'MISSING_FIELD',
      severity: 'HIGH',
      title: 'Missing Required Fields',
      description: `The invoice is missing essential fields required for auditing: ${missing.join(', ')}.`,
      evidence: { missing_fields: missing },
    });
  } else {
    checks.push({
      name: 'Required Fields',
      status: 'PASSED',
      message: 'All mandatory invoice header fields are present.',
    });
  }

  // --------------------------------------------------------------------------
  // 2. Deterministic Arithmetic Validation
  // Formula: Subtotal - Discount + Tax + Additional Charges = Stated Total
  // --------------------------------------------------------------------------
  const roundedSubtotal = roundCurrency(subtotal);
  const roundedDiscount = roundCurrency(discountAmount || 0);
  const roundedTax = roundCurrency(taxAmount || 0);
  const roundedCharges = roundCurrency(additionalCharges || 0);
  const roundedStatedTotal = roundCurrency(totalAmount);

  const calculatedTotal = roundCurrency(roundedSubtotal - roundedDiscount + roundedTax + roundedCharges);
  const delta = roundCurrency(Math.abs(calculatedTotal - roundedStatedTotal));

  if (!areAmountsEqual(calculatedTotal, roundedStatedTotal, 0.05)) {
    checks.push({
      name: 'Arithmetic Verification',
      status: 'FAILED',
      message: `Calculated total (${roundedSubtotal} - ${roundedDiscount} + ${roundedTax} + ${roundedCharges} = ${calculatedTotal}) differs from stated total (${roundedStatedTotal}) by ${delta}.`,
    });

    findings.push({
      finding_type: 'ARITHMETIC_MISMATCH',
      severity: delta > 100 ? 'HIGH' : 'MEDIUM',
      title: 'Arithmetic Total Mismatch',
      description: `Calculated total (${currencyCode} ${calculatedTotal.toLocaleString()}) does not match Stated Total (${currencyCode} ${roundedStatedTotal.toLocaleString()}). Discrepancy of ${currencyCode} ${delta.toLocaleString()}.`,
      evidence: {
        subtotal: roundedSubtotal,
        discount: roundedDiscount,
        tax: roundedTax,
        charges: roundedCharges,
        calculated_total: calculatedTotal,
        stated_total: roundedStatedTotal,
        delta,
      },
    });
  } else {
    checks.push({
      name: 'Arithmetic Verification',
      status: 'PASSED',
      message: `Arithmetic verified: Subtotal (${roundedSubtotal}) - Discount (${roundedDiscount}) + Tax (${roundedTax}) + Charges (${roundedCharges}) = Stated Total (${roundedStatedTotal}).`,
    });
  }

  // --------------------------------------------------------------------------
  // 3. Line-Item Aggregations and Line Totals Check
  // --------------------------------------------------------------------------
  if (Array.isArray(lineItems) && lineItems.length > 0) {
    let sumLineTotals = 0;
    const lineItemDiscrepancies = [];

    lineItems.forEach((item, index) => {
      const qty = item.quantity;
      const unit = item.unitPrice;
      const statedLineTotal = roundCurrency(item.lineTotal || 0);
      sumLineTotals = roundCurrency(sumLineTotals + statedLineTotal);

      if (qty !== null && qty !== undefined && unit !== null && unit !== undefined) {
        const expectedLineTotal = roundCurrency(qty * unit);
        if (!areAmountsEqual(expectedLineTotal, statedLineTotal, 0.1)) {
          lineItemDiscrepancies.push({
            index,
            description: item.description,
            quantity: qty,
            unit_price: unit,
            expected: expectedLineTotal,
            observed: statedLineTotal,
          });
        }
      }
    });

    // Check sum of line items vs subtotal
    if (roundedSubtotal > 0 && !areAmountsEqual(sumLineTotals, roundedSubtotal, 0.5)) {
      findings.push({
        finding_type: 'ARITHMETIC_MISMATCH',
        severity: 'MEDIUM',
        title: 'Line Items Sum Mismatch',
        description: `Sum of individual line items (${currencyCode} ${sumLineTotals.toLocaleString()}) does not equal invoice subtotal (${currencyCode} ${roundedSubtotal.toLocaleString()}).`,
        evidence: {
          sum_line_totals: sumLineTotals,
          stated_subtotal: roundedSubtotal,
          difference: roundCurrency(Math.abs(sumLineTotals - roundedSubtotal)),
        },
      });
    }

    if (lineItemDiscrepancies.length > 0) {
      findings.push({
        finding_type: 'ARITHMETIC_MISMATCH',
        severity: 'MEDIUM',
        title: 'Line Item Unit Price Inconsistency',
        description: `${lineItemDiscrepancies.length} line item(s) have unit price × quantity calculations that do not equal the line total.`,
        evidence: { discrepancies: lineItemDiscrepancies },
      });
    }

    checks.push({
      name: 'Line Item Audit',
      status: lineItemDiscrepancies.length === 0 ? 'PASSED' : 'FLAGGED',
      message: `Audited ${lineItems.length} line item(s). Sum: ${sumLineTotals}. Discrepancies: ${lineItemDiscrepancies.length}.`,
    });
  }

  // --------------------------------------------------------------------------
  // 4. Date Logic Validation
  // --------------------------------------------------------------------------
  if (invoiceDate) {
    const invDateObj = new Date(invoiceDate);
    if (isNaN(invDateObj.getTime())) {
      findings.push({
        finding_type: 'DATE_ANOMALY',
        severity: 'HIGH',
        title: 'Invalid Invoice Date',
        description: `The invoice date "${invoiceDate}" is not a valid calendar date.`,
        evidence: { invoice_date: invoiceDate },
      });
    }

    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        findings.push({
          finding_type: 'DATE_ANOMALY',
          severity: 'MEDIUM',
          title: 'Invalid Due Date',
          description: `The payment due date "${dueDate}" is not a valid calendar date.`,
          evidence: { due_date: dueDate },
        });
      } else if (dueDateObj < invDateObj) {
        findings.push({
          finding_type: 'DATE_ANOMALY',
          severity: 'HIGH',
          title: 'Due Date Precedes Invoice Date',
          description: `The due date (${dueDate}) is earlier than the invoice issue date (${invoiceDate}), which is an abnormal payment term.`,
          evidence: { invoice_date: invoiceDate, due_date: dueDate },
        });
      }
    }

    checks.push({
      name: 'Date Logic Audit',
      status: findings.some((f) => f.finding_type === 'DATE_ANOMALY') ? 'FAILED' : 'PASSED',
      message: 'Verified invoice issuance and payment maturity timeline.',
    });
  }

  // --------------------------------------------------------------------------
  // 5. Duplicate Detection Engine
  // --------------------------------------------------------------------------
  if (Array.isArray(existingInvoices) && existingInvoices.length > 0) {
    const normSupp = normalizeSupplier(supplierName);
    const normNum = normalizeInvoiceNumber(invoiceNumber);

    existingInvoices.forEach((existing) => {
      // Ignore self-comparison if updating
      if (invoiceData.id && existing.id === invoiceData.id) return;

      // Check A: Exact SHA256 document hash match
      if (documentHash && existing.document_hash && documentHash === existing.document_hash) {
        findings.push({
          finding_type: 'DUPLICATE_CANDIDATE',
          severity: 'CRITICAL',
          title: 'Exact Duplicate Document (Hash Collision)',
          description: `An identical document file was previously uploaded for invoice "${existing.invoice_number}" from "${existing.supplier_name}".`,
          evidence: {
            matched_invoice_id: existing.id,
            matched_invoice_number: existing.invoice_number,
            document_hash: documentHash,
          },
          related_invoice_id: existing.id,
        });
        return;
      }

      // Check B: Normalized supplier name + normalized invoice number
      const existingSupp = normalizeSupplier(existing.supplier_name);
      const existingNum = normalizeInvoiceNumber(existing.invoice_number);

      if (normSupp && normNum && existingSupp === normSupp && existingNum === normNum) {
        findings.push({
          finding_type: 'DUPLICATE_CANDIDATE',
          severity: 'CRITICAL',
          title: 'Duplicate Supplier Invoice Number',
          description: `An existing invoice (#${existing.invoice_number}) from supplier "${existing.supplier_name}" for ${existing.currency_code || 'INR'} ${existing.total_amount} was already processed on ${existing.invoice_date}.`,
          evidence: {
            matched_invoice_id: existing.id,
            matched_invoice_number: existing.invoice_number,
            matched_amount: existing.total_amount,
            matched_date: existing.invoice_date,
          },
          related_invoice_id: existing.id,
        });
      }
    });

    checks.push({
      name: 'Duplicate Ingestion Check',
      status: findings.some((f) => f.finding_type === 'DUPLICATE_CANDIDATE') ? 'FLAGGED' : 'PASSED',
      message: `Checked against ${existingInvoices.length} historical invoices in tenant workspace.`,
    });
  }

  // Final Validation State
  const blockingFindings = findings.filter((f) => f.severity === 'HIGH' || f.severity === 'CRITICAL');
  const isClean = findings.length === 0;

  let validation_status = 'Verified';
  if (blockingFindings.length > 0 || findings.length > 0) {
    validation_status = 'Needs Review';
  }

  return {
    validation_status,
    checks,
    findings,
    isClean,
  };
}
