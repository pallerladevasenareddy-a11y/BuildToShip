import { describe, it, expect } from 'vitest';
import {
  validateInvoice,
  roundCurrency,
  areAmountsEqual,
  normalizeSupplier,
  normalizeInvoiceNumber,
} from '../src/services/validation.service.js';

describe('Deterministic Financial Validation Engine', () => {
  describe('Helper precision functions', () => {
    it('accurately rounds currency to 2 decimal places avoiding floating precision errors', () => {
      expect(roundCurrency(19.999)).toBe(20);
      expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
      expect(areAmountsEqual(100.00, 100.04, 0.05)).toBe(true);
      expect(areAmountsEqual(100.00, 100.06, 0.05)).toBe(false);
    });

    it('correctly normalizes supplier names and invoice numbers', () => {
      expect(normalizeSupplier('Apex Cloud Solutions Pvt Ltd')).toBe('apexcloudsolutions');
      expect(normalizeInvoiceNumber('INV-2026/1042#A')).toBe('inv20261042a');
    });
  });

  describe('Scenario A: Clean Verified Invoice', () => {
    it('passes all checks with status Verified and 0 blocking findings', () => {
      const invoiceData = {
        supplierName: 'Apex Cloud Solutions Pvt Ltd',
        invoiceNumber: 'INV-2026-9001',
        invoiceDate: '2026-10-10',
        dueDate: '2026-11-10',
        currencyCode: 'INR',
        subtotal: 45000.0,
        taxAmount: 8100.0,
        discountAmount: 0.0,
        additionalCharges: 0.0,
        totalAmount: 53100.0,
        documentHash: 'clean_hash_9001',
      };

      const lineItems = [
        { description: 'Cloud VM Tier 1', quantity: 1, unitPrice: 35000.0, lineTotal: 35000.0 },
        { description: 'Support Retainer', quantity: 1, unitPrice: 10000.0, lineTotal: 10000.0 },
      ];

      const result = validateInvoice(invoiceData, lineItems, []);

      expect(result.validation_status).toBe('Verified');
      expect(result.isClean).toBe(true);
      expect(result.findings.length).toBe(0);
      expect(result.checks.find((c) => c.name === 'Arithmetic Verification')?.status).toBe('PASSED');
      expect(result.checks.find((c) => c.name === 'Required Fields')?.status).toBe('PASSED');
    });
  });

  describe('Scenario B: Duplicate Candidate Invoice', () => {
    it('flags high-confidence duplicate when normalized supplier and invoice number collide', () => {
      const existingInvoices = [
        {
          id: 'existing-id-1',
          supplier_name: 'Apex Cloud Solutions Pvt Ltd',
          invoice_number: 'INV-2026-1042',
          total_amount: 53100.0,
          currency_code: 'INR',
          invoice_date: '2026-09-15',
          document_hash: 'hash_original_123',
        },
      ];

      const duplicateSubmission = {
        supplierName: 'Apex Cloud Solutions Limited', // slight legal form variant
        invoiceNumber: 'inv-2026-1042',
        invoiceDate: '2026-09-15',
        currencyCode: 'INR',
        subtotal: 45000.0,
        taxAmount: 8100.0,
        totalAmount: 53100.0,
        documentHash: 'hash_different_rescan',
      };

      const result = validateInvoice(duplicateSubmission, [], existingInvoices);

      expect(result.validation_status).toBe('Needs Review');
      expect(result.isClean).toBe(false);
      const dupFinding = result.findings.find((f) => f.finding_type === 'DUPLICATE_CANDIDATE');
      expect(dupFinding).toBeDefined();
      expect(dupFinding.severity).toBe('CRITICAL');
      expect(dupFinding.related_invoice_id).toBe('existing-id-1');
    });

    it('flags exact duplicate when cryptographic document SHA-256 hash collides', () => {
      const existingInvoices = [
        {
          id: 'existing-id-hash',
          supplier_name: 'Vendor X',
          invoice_number: 'VX-100',
          document_hash: 'abc123exacthash',
        },
      ];

      const uploadData = {
        supplierName: 'Different Name Read',
        invoiceNumber: 'VX-999',
        invoiceDate: '2026-10-01',
        totalAmount: 5000.0,
        documentHash: 'abc123exacthash',
      };

      const result = validateInvoice(uploadData, [], existingInvoices);
      const hashDup = result.findings.find((f) => f.finding_type === 'DUPLICATE_CANDIDATE');
      expect(hashDup).toBeDefined();
      expect(hashDup.severity).toBe('CRITICAL');
    });
  });

  describe('Scenario C: Arithmetic Mismatch Invoice', () => {
    it('detects calculation discrepancy and computes exact expected vs observed total', () => {
      const mismatchInvoice = {
        supplierName: 'Quantum Logistics India Ltd',
        invoiceNumber: 'QL-8819',
        invoiceDate: '2026-10-02',
        currencyCode: 'INR',
        subtotal: 25000.0,
        taxAmount: 4500.0,
        discountAmount: 1000.0,
        additionalCharges: 500.0,
        totalAmount: 32500.0, // Expected: 25000 - 1000 + 4500 + 500 = 29000. Stated: 32500. Delta: 3500
      };

      const result = validateInvoice(mismatchInvoice, [], []);

      expect(result.validation_status).toBe('Needs Review');
      const mathFinding = result.findings.find((f) => f.finding_type === 'ARITHMETIC_MISMATCH');
      expect(mathFinding).toBeDefined();
      expect(mathFinding.severity).toBe('HIGH');
      expect(mathFinding.evidence.calculated_total).toBe(29000);
      expect(mathFinding.evidence.stated_total).toBe(32500);
      expect(mathFinding.evidence.delta).toBe(3500);
    });
  });

  describe('Required Fields & Date Logic Anomaly Checks', () => {
    it('flags missing supplier name and invoice number', () => {
      const incomplete = {
        totalAmount: 1000,
        currencyCode: 'INR',
      };

      const result = validateInvoice(incomplete, [], []);
      expect(result.validation_status).toBe('Needs Review');
      const missingFinding = result.findings.find((f) => f.finding_type === 'MISSING_FIELD');
      expect(missingFinding).toBeDefined();
      expect(missingFinding.evidence.missing_fields).toContain('supplier_name');
      expect(missingFinding.evidence.missing_fields).toContain('invoice_number');
    });

    it('flags when payment due date precedes invoice issue date', () => {
      const dateAnomaly = {
        supplierName: 'Acme Corp',
        invoiceNumber: 'INV-1',
        invoiceDate: '2026-10-20',
        dueDate: '2026-10-10', // 10 days before issue!
        totalAmount: 1000,
      };

      const result = validateInvoice(dateAnomaly, [], []);
      const dateFinding = result.findings.find((f) => f.finding_type === 'DATE_ANOMALY');
      expect(dateFinding).toBeDefined();
      expect(dateFinding.severity).toBe('HIGH');
    });
  });
});
