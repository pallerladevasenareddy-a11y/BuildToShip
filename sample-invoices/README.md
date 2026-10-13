# DocuSense AI — Synthetic Sample Invoices & Test Benchmarks

This directory contains three realistic synthetic test scenarios designed to verify deterministic validation, duplicate collision detection, and arithmetic mismatch flagging.

## Scenario A: Clean Verified Invoice
- **File**: `sample_a_clean.pdf` (Metadata: `sample_a_clean.json`)
- **Supplier**: Apex Cloud Solutions Pvt Ltd
- **Invoice Number**: `INV-2026-9042`
- **Math**: Subtotal ₹45,000 + Tax ₹8,100 = Total ₹53,100.00
- **Expected Outcome**: Status `Verified`, 0 blocking findings, passes arithmetic and header checks.

## Scenario B: Duplicate Candidate Invoice
- **File**: `sample_b_duplicate.pdf` (Metadata: `sample_b_duplicate.json`)
- **Supplier**: Apex Cloud Solutions Pvt Ltd
- **Invoice Number**: `INV-2026-1042` (Identical supplier & invoice number to an existing historical invoice)
- **Expected Outcome**: Status `Needs Review`, 1 Critical Finding (`DUPLICATE_CANDIDATE`). Prevents accidental double payment.

## Scenario C: Arithmetic Calculation Mismatch
- **File**: `sample_c_arithmetic_mismatch.pdf` (Metadata: `sample_c_arithmetic_mismatch.json`)
- **Supplier**: Quantum Logistics India Ltd
- **Invoice Number**: `QL-2026-8819`
- **Math**: Subtotal ₹25,000 - Discount ₹1,000 + Tax ₹4,500 + Charges ₹500 = **Calculated ₹29,000.00**, but document states **₹32,500.00**!
- **Discrepancy**: Unaccounted difference of **₹3,500.00**.
- **Expected Outcome**: Status `Needs Review`, 1 High Finding (`ARITHMETIC_MISMATCH`). Explains calculated vs stated total.
