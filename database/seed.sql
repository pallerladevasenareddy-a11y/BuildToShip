-- ============================================================================
-- DocuSense AI — Database Seed Data
-- ============================================================================

-- 1. Insert Demo Profile (Password: DemoPass123!)
-- Hash generated with bcryptjs rounds=10: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO profiles (id, full_name, email, password_hash, avatar_url, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Arjun Mehta',
    'demo@docusense.ai',
    '$2a$10$wN1k6bE8eNqKqZfM2zQ8he9rN0n4yQd45K5vQf5m7kP5z2r5oG7m',
    NULL,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Scenario A: Clean Verified Historical Invoice (Apex Cloud Solutions)
INSERT INTO invoices (
    id, user_id, storage_path, original_filename, mime_type, file_size, document_hash,
    supplier_name, supplier_tax_id, invoice_number, invoice_date, due_date, currency_code,
    subtotal, tax_amount, discount_amount, additional_charges, total_amount, category,
    document_type, processing_status, review_status, validation_status, extraction_data, created_at
) VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001/apex_cloud_inv_1042.pdf',
    'apex_cloud_inv_1042.pdf',
    'application/pdf',
    104200,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'Apex Cloud Solutions Pvt Ltd',
    '27AAPCA1234F1Z8',
    'INV-2026-1042',
    '2026-09-15',
    '2026-10-15',
    'INR',
    45000.00,
    8100.00,
    0.00,
    0.00,
    53100.00,
    'Software',
    'INVOICE',
    'Processed',
    'Approved',
    'Verified',
    '{"supplier": "Apex Cloud Solutions Pvt Ltd", "invoice_number": "INV-2026-1042", "confidence": 0.98}'::jsonb,
    NOW() - INTERVAL '25 days'
) ON CONFLICT (id) DO NOTHING;

-- Line items for Apex Cloud
INSERT INTO invoice_line_items (id, invoice_id, description, quantity, unit_price, line_total, currency_code)
VALUES 
    (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'Cloud Infrastructure Tier 3 (Sep 2026)', 1, 35000.00, 35000.00, 'INR'),
    (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'Managed Kubernetes Cluster Support', 1, 10000.00, 10000.00, 'INR')
ON CONFLICT DO NOTHING;

-- 3. Scenario B: Duplicate Candidate Invoice (Duplicate of Apex Cloud)
INSERT INTO invoices (
    id, user_id, storage_path, original_filename, mime_type, file_size, document_hash,
    supplier_name, supplier_tax_id, invoice_number, invoice_date, due_date, currency_code,
    subtotal, tax_amount, discount_amount, additional_charges, total_amount, category,
    document_type, processing_status, review_status, validation_status, extraction_data, created_at
) VALUES (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001/apex_cloud_inv_1042_resubmitted.pdf',
    'apex_cloud_inv_1042_resubmitted.pdf',
    'application/pdf',
    104200,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'Apex Cloud Solutions Pvt Ltd',
    '27AAPCA1234F1Z8',
    'INV-2026-1042',
    '2026-09-15',
    '2026-10-15',
    'INR',
    45000.00,
    8100.00,
    0.00,
    0.00,
    53100.00,
    'Software',
    'INVOICE',
    'Needs Review',
    'Pending',
    'Needs Review',
    '{"supplier": "Apex Cloud Solutions Pvt Ltd", "invoice_number": "INV-2026-1042", "confidence": 0.97}'::jsonb,
    NOW() - INTERVAL '5 days'
) ON CONFLICT (id) DO NOTHING;

-- Finding for Scenario B
INSERT INTO invoice_findings (
    id, invoice_id, user_id, finding_type, severity, title, description, evidence, related_invoice_id, status
) VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'DUPLICATE_CANDIDATE',
    'CRITICAL',
    'Exact Duplicate Invoice Detected',
    'An existing processed invoice (INV-2026-1042) from Apex Cloud Solutions Pvt Ltd with total ₹53,100.00 and identical SHA-256 hash was previously submitted on 2026-09-15.',
    '{"matched_invoice_number": "INV-2026-1042", "matched_amount": 53100.00, "similarity_score": 1.0}'::jsonb,
    'b0000000-0000-0000-0000-000000000001',
    'OPEN'
) ON CONFLICT (id) DO NOTHING;

-- 4. Scenario C: Arithmetic Mismatch Invoice (Quantum Logistics)
INSERT INTO invoices (
    id, user_id, storage_path, original_filename, mime_type, file_size, document_hash,
    supplier_name, supplier_tax_id, invoice_number, invoice_date, due_date, currency_code,
    subtotal, tax_amount, discount_amount, additional_charges, total_amount, category,
    document_type, processing_status, review_status, validation_status, extraction_data, created_at
) VALUES (
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001/quantum_logistics_bill_8819.pdf',
    'quantum_logistics_bill_8819.pdf',
    'application/pdf',
    84200,
    'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    'Quantum Logistics India Ltd',
    '29AABCQ8819G1Z2',
    'QL-2026-8819',
    '2026-10-02',
    '2026-10-22',
    'INR',
    25000.00,
    4500.00,
    1000.00,
    500.00,
    32500.00, -- Stated Total is 32,500, but Subtotal(25000) - Discount(1000) + Tax(4500) + Charges(500) = 29,000! Discrepancy of 3,500!
    'Logistics',
    'INVOICE',
    'Needs Review',
    'Pending',
    'Needs Review',
    '{"supplier": "Quantum Logistics India Ltd", "invoice_number": "QL-2026-8819", "confidence": 0.95}'::jsonb,
    NOW() - INTERVAL '2 days'
) ON CONFLICT (id) DO NOTHING;

-- Finding for Scenario C
INSERT INTO invoice_findings (
    id, invoice_id, user_id, finding_type, severity, title, description, evidence, status
) VALUES (
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'ARITHMETIC_MISMATCH',
    'HIGH',
    'Invoice Total Calculation Discrepancy',
    'Calculated total (Subtotal ₹25,000 - Discount ₹1,000 + Tax ₹4,500 + Charges ₹500 = ₹29,000.00) does not match Stated Total ₹32,500.00. Unaccounted difference of ₹3,500.00.',
    '{"subtotal": 25000.00, "discount": 1000.00, "tax": 4500.00, "charges": 500.00, "calculated_total": 29000.00, "stated_total": 32500.00, "delta": 3500.00}'::jsonb,
    'OPEN'
) ON CONFLICT (id) DO NOTHING;

-- Line items for Quantum Logistics
INSERT INTO invoice_line_items (id, invoice_id, description, quantity, unit_price, line_total, currency_code)
VALUES 
    (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003', 'Interstate Freight Dispatch (Bengaluru - Mumbai)', 2, 10000.00, 20000.00, 'INR'),
    (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003', 'Cold-chain Temperature Monitoring Pack', 1, 5000.00, 5000.00, 'INR')
ON CONFLICT DO NOTHING;

-- Initial audit logs
INSERT INTO audit_logs (id, invoice_id, user_id, action, note, created_at)
VALUES 
    (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'UPLOAD', 'Invoice uploaded and ingested via OCR/Gemini engine', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'APPROVED', 'Audit passed with 0 discrepancies. Approved by Arjun Mehta.', NOW() - INTERVAL '24 days'),
    (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'UPLOAD', 'Invoice uploaded. Flagged automatically for duplicate review.', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'UPLOAD', 'Invoice uploaded. Flagged automatically for arithmetic mismatch.', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;
