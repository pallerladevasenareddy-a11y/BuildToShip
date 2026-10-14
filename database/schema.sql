-- ============================================================================
-- DocuSense AI — PostgreSQL Database Schema
-- Supabase Schema Definition with UUID PKs, Numeric Precision & Audit Immutability
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Profiles Table (Authenticated Users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL for OAuth / Google Sign-In users
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ----------------------------------------------------------------------------
-- 2. Invoices Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    storage_path VARCHAR(512) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    document_hash VARCHAR(64) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_tax_id VARCHAR(100),
    invoice_number VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    currency_code VARCHAR(10) NOT NULL DEFAULT 'INR',
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(14, 2) DEFAULT 0.00,
    additional_charges NUMERIC(14, 2) DEFAULT 0.00,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    category VARCHAR(100) NOT NULL DEFAULT 'Other',
    document_type VARCHAR(50) NOT NULL DEFAULT 'INVOICE',
    processing_status VARCHAR(50) NOT NULL DEFAULT 'Uploaded',
    review_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    validation_status VARCHAR(50) NOT NULL DEFAULT 'Needs Review',
    extraction_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    CONSTRAINT chk_processing_status CHECK (processing_status IN ('Uploaded', 'Processing', 'Processed', 'Needs Review', 'Failed')),
    CONSTRAINT chk_review_status CHECK (review_status IN ('Pending', 'In Review', 'Approved', 'Rejected', 'Resolved')),
    CONSTRAINT chk_validation_status CHECK (validation_status IN ('Verified', 'Needs Review', 'Failed'))
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_supplier_name ON invoices(supplier_name);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_processing_status ON invoices(processing_status);
CREATE INDEX IF NOT EXISTS idx_invoices_review_status ON invoices(review_status);
CREATE INDEX IF NOT EXISTS idx_invoices_doc_hash ON invoices(document_hash);

-- Composite index for fast duplicate checks per tenant
CREATE INDEX IF NOT EXISTS idx_invoices_dup_check ON invoices(user_id, LOWER(supplier_name), LOWER(invoice_number));

-- ----------------------------------------------------------------------------
-- 3. Invoice Line Items Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(12, 3),
    unit_price NUMERIC(14, 2),
    line_total NUMERIC(14, 2) NOT NULL,
    currency_code VARCHAR(10) NOT NULL DEFAULT 'INR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_line_items_invoice_id ON invoice_line_items(invoice_id);

-- ----------------------------------------------------------------------------
-- 4. Invoice Findings Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoice_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    finding_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    related_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    CONSTRAINT chk_finding_severity CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_finding_status CHECK (status IN ('OPEN', 'RESOLVED', 'DISMISSED'))
);

CREATE INDEX IF NOT EXISTS idx_findings_invoice_id ON invoice_findings(invoice_id);
CREATE INDEX IF NOT EXISTS idx_findings_user_id ON invoice_findings(user_id);
CREATE INDEX IF NOT EXISTS idx_findings_status ON invoice_findings(status);

-- ----------------------------------------------------------------------------
-- 5. Audit Logs Table (Append-Only)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    previous_values JSONB,
    new_values JSONB,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_invoice_id ON audit_logs(invoice_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Trigger to prevent UPDATE or DELETE on audit_logs (Append-Only Enforcement)
CREATE OR REPLACE FUNCTION prevent_audit_logs_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_logs_mutation ON audit_logs;
CREATE TRIGGER trg_prevent_audit_logs_mutation
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_logs_mutation();

-- ----------------------------------------------------------------------------
-- 6. Row Level Security (RLS) Setup
-- ----------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Note: The Express backend connects via the service-role or authenticated JWT.
-- When using direct Supabase client with auth UID:
CREATE POLICY "Users can only access their own profile"
    ON profiles FOR ALL
    USING (id = auth.uid());

CREATE POLICY "Users can only access their own invoices"
    ON invoices FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own line items"
    ON invoice_line_items FOR ALL
    USING (invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid()));

CREATE POLICY "Users can only access their own findings"
    ON invoice_findings FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can only read their own audit logs"
    ON audit_logs FOR SELECT
    USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 7. Supabase Auth Automatic Profile Provisioning & Migration Helper
-- ----------------------------------------------------------------------------
-- Migration commands for existing databases:
-- ALTER TABLE profiles ALTER COLUMN password_hash DROP NOT NULL;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Auto-provision or update public.profiles whenever an auth.users record is created/updated (e.g., via Google OAuth)
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, avatar_url, updated_at)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture'
        ),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger firing on auth.users insert/update
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_auth_user();
