# DocuSense AI — Testing Specification (TESTING_SPEC.md)

## 1. Test Architecture
- **Framework**: Vitest for fast ESM unit testing.
- **HTTP Testing**: Supertest for endpoint integration tests.
- **Mock Strategy**: Mock `@google/genai` and `@supabase/supabase-js` in automated test suites to guarantee fast, deterministic, non-flaky test execution without third-party network egress or credential requirements.

## 2. Mandatory Test Suites
1. **Deterministic Financial Validation**:
   - Arithmetic tolerance checking (`subtotal - discount + tax + charges = total`).
   - Line items summation vs subtotal.
   - Quantity * unit price check.
   - Missing required fields validation.
   - Date format and due-date logic validation.
2. **Duplicate Detection Engine**:
   - Exact document SHA256 hash match.
   - Supplier name and normalized invoice number collision.
   - High-confidence vs soft similarity alerts.
3. **Authentication & Authorization**:
   - User registration input validation and password hashing.
   - JWT issuance and bearer verification.
   - Multi-tenant data isolation (User A cannot view User B's invoices or findings).
4. **End-to-End Invoice Scenarios**:
   - Sample A (Clean Invoice): Verified, 0 blocking findings.
   - Sample B (Possible Duplicate): Flagged for Review, Duplicate Finding generated.
   - Sample C (Arithmetic Mismatch): Flagged for Review, Arithmetic Discrepancy explained with expected vs observed amounts.
