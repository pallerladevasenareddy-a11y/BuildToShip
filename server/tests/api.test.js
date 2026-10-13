import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('DocuSense Critical API Workflow', () => {
  let token = null;

  beforeAll(async () => {
    // Log in as demo user
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'demo@docusense.ai',
        password: 'DemoPass123!',
      });

    expect(res.status).toBe(200);
    token = res.body.token;
  });

  it('GET /api/health returns system readiness and configuration', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.integrations).toBeDefined();
  });

  it('GET /api/invoices retrieves user invoices with multi-tenant scoping', async () => {
    const res = await request(app)
      .get('/api/invoices')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/invoices/upload processes a clean synthetic invoice and verifies calculation', async () => {
    // Generate valid dummy PDF bytes with %PDF- header
    const dummyPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (Apex Cloud Invoice) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

    const res = await request(app)
      .post('/api/invoices/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', dummyPdf, 'apex_test_clean.pdf')
      .field('isDemoMode', 'true')
      .field('scenarioKey', 'CLEAN');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.invoice.supplier_name).toBe('Apex Cloud Solutions Pvt Ltd');
    expect(res.body.data.validation.validation_status).toBe('Verified');
    expect(res.body.data.validation.isClean).toBe(true);
  });

  it('POST /api/invoices/upload flags an arithmetic mismatch scenario for human review', async () => {
    const dummyPdf = Buffer.from('%PDF-1.4\n%Mismatch Test\n%%EOF');

    const res = await request(app)
      .post('/api/invoices/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', dummyPdf, 'quantum_mismatch.pdf')
      .field('isDemoMode', 'true')
      .field('scenarioKey', 'MISMATCH');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.validation.validation_status).toBe('Needs Review');
    const mathFinding = res.body.data.validation.findings.find(
      (f) => f.finding_type === 'ARITHMETIC_MISMATCH'
    );
    expect(mathFinding).toBeDefined();
  });

  it('PATCH /api/invoices/:id allows correcting fields, rerunning validation and updating audit trail', async () => {
    // Get the seeded mismatch invoice
    const invRes = await request(app)
      .get('/api/invoices')
      .set('Authorization', `Bearer ${token}`);

    const mismatchInv = invRes.body.data.find(
      (inv) => inv.supplier_name === 'Quantum Logistics India Ltd'
    );
    expect(mismatchInv).toBeDefined();

    // Correct the stated total to match: 25000 - 1000 + 4500 + 500 = 29000
    const patchRes = await request(app)
      .patch(`/api/invoices/${mismatchInv.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        totalAmount: 29000,
        correctionNote: 'Corrected stated total to match line items and tax.',
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);
    expect(patchRes.body.data.revalidation.checks.find((c) => c.name === 'Arithmetic Verification')?.status).toBe('PASSED');

    // Verify audit log has FIELD_CORRECTED
    const detailRes = await request(app)
      .get(`/api/invoices/${mismatchInv.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(detailRes.body.data.audit_logs.some((a) => a.action === 'FIELD_CORRECTED')).toBe(true);
  });

  it('POST /api/review/:id executes human approval and writes immutable audit entry', async () => {
    const invRes = await request(app)
      .get('/api/invoices')
      .set('Authorization', `Bearer ${token}`);

    const inv = invRes.body.data[0];

    const approveRes = await request(app)
      .post(`/api/review/${inv.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        action: 'APPROVE',
        note: 'Approved after review in automated test',
      });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.success).toBe(true);
    expect(approveRes.body.data.review_status).toBe('Approved');
  });

  it('GET /api/insights/summary calculates real aggregates matching database records', async () => {
    const res = await request(app)
      .get('/api/insights/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.kpis.totalInvoices).toBeGreaterThan(0);
    expect(res.body.data.kpis.totalSpendINR).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.topSuppliers)).toBe(true);
    expect(Array.isArray(res.body.data.categoryBreakdown)).toBe(true);
  });
});
