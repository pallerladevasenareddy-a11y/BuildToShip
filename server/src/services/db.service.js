import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

// Pre-seeded demo user
const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000001';
const DEMO_PASSWORD_HASH = bcrypt.hashSync('DemoPass123!', 10);

// In-Memory store for offline/local development fallback
const localStore = {
  profiles: [
    {
      id: DEMO_USER_ID,
      full_name: 'Arjun Mehta',
      email: 'demo@docusense.ai',
      password_hash: DEMO_PASSWORD_HASH,
      avatar_url: null,
      created_at: new Date('2026-09-01T10:00:00Z').toISOString(),
      updated_at: new Date('2026-09-01T10:00:00Z').toISOString(),
    },
  ],
  invoices: [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      user_id: DEMO_USER_ID,
      storage_path: 'synthetic/apex_cloud_inv_1042.pdf',
      original_filename: 'apex_cloud_inv_1042.pdf',
      mime_type: 'application/pdf',
      file_size: 104200,
      document_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      supplier_name: 'Apex Cloud Solutions Pvt Ltd',
      supplier_tax_id: '27AAPCA1234F1Z8',
      invoice_number: 'INV-2026-1042',
      invoice_date: '2026-09-15',
      due_date: '2026-10-15',
      currency_code: 'INR',
      subtotal: 45000.0,
      tax_amount: 8100.0,
      discount_amount: 0.0,
      additional_charges: 0.0,
      total_amount: 53100.0,
      category: 'Software',
      document_type: 'INVOICE',
      processing_status: 'Processed',
      review_status: 'Approved',
      validation_status: 'Verified',
      extraction_data: {
        supplier: 'Apex Cloud Solutions Pvt Ltd',
        tax_id: '27AAPCA1234F1Z8',
        invoice_number: 'INV-2026-1042',
        confidence: 0.98,
      },
      created_at: new Date('2026-09-15T12:00:00Z').toISOString(),
      updated_at: new Date('2026-09-16T09:00:00Z').toISOString(),
      reviewed_at: new Date('2026-09-16T09:00:00Z').toISOString(),
      reviewed_by: DEMO_USER_ID,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      user_id: DEMO_USER_ID,
      storage_path: 'synthetic/apex_cloud_inv_1042_dup.pdf',
      original_filename: 'apex_cloud_inv_1042_dup.pdf',
      mime_type: 'application/pdf',
      file_size: 104200,
      document_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      supplier_name: 'Apex Cloud Solutions Pvt Ltd',
      supplier_tax_id: '27AAPCA1234F1Z8',
      invoice_number: 'INV-2026-1042',
      invoice_date: '2026-09-15',
      due_date: '2026-10-15',
      currency_code: 'INR',
      subtotal: 45000.0,
      tax_amount: 8100.0,
      discount_amount: 0.0,
      additional_charges: 0.0,
      total_amount: 53100.0,
      category: 'Software',
      document_type: 'INVOICE',
      processing_status: 'Needs Review',
      review_status: 'Pending',
      validation_status: 'Needs Review',
      extraction_data: {
        supplier: 'Apex Cloud Solutions Pvt Ltd',
        invoice_number: 'INV-2026-1042',
        confidence: 0.97,
      },
      created_at: new Date('2026-10-08T14:30:00Z').toISOString(),
      updated_at: new Date('2026-10-08T14:30:00Z').toISOString(),
      reviewed_at: null,
      reviewed_by: null,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000003',
      user_id: DEMO_USER_ID,
      storage_path: 'synthetic/quantum_logistics_bill_8819.pdf',
      original_filename: 'quantum_logistics_bill_8819.pdf',
      mime_type: 'application/pdf',
      file_size: 84200,
      document_hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      supplier_name: 'Quantum Logistics India Ltd',
      supplier_tax_id: '29AABCQ8819G1Z2',
      invoice_number: 'QL-2026-8819',
      invoice_date: '2026-10-02',
      due_date: '2026-10-22',
      currency_code: 'INR',
      subtotal: 25000.0,
      tax_amount: 4500.0,
      discount_amount: 1000.0,
      additional_charges: 500.0,
      total_amount: 32500.0, // Calculated total = 29000, mismatch = 3500
      category: 'Logistics',
      document_type: 'INVOICE',
      processing_status: 'Needs Review',
      review_status: 'Pending',
      validation_status: 'Needs Review',
      extraction_data: {
        supplier: 'Quantum Logistics India Ltd',
        invoice_number: 'QL-2026-8819',
        confidence: 0.95,
      },
      created_at: new Date('2026-10-10T16:15:00Z').toISOString(),
      updated_at: new Date('2026-10-10T16:15:00Z').toISOString(),
      reviewed_at: null,
      reviewed_by: null,
    },
  ],
  invoice_line_items: [
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      invoice_id: 'b0000000-0000-0000-0000-000000000001',
      description: 'Cloud Infrastructure Tier 3 (Sep 2026)',
      quantity: 1,
      unit_price: 35000.0,
      line_total: 35000.0,
      currency_code: 'INR',
      created_at: new Date('2026-09-15T12:00:00Z').toISOString(),
    },
    {
      id: 'd0000000-0000-0000-0000-000000000002',
      invoice_id: 'b0000000-0000-0000-0000-000000000001',
      description: 'Managed Kubernetes Cluster Support',
      quantity: 1,
      unit_price: 10000.0,
      line_total: 10000.0,
      currency_code: 'INR',
      created_at: new Date('2026-09-15T12:00:00Z').toISOString(),
    },
    {
      id: 'd0000000-0000-0000-0000-000000000003',
      invoice_id: 'b0000000-0000-0000-0000-000000000003',
      description: 'Interstate Freight Dispatch (Bengaluru - Mumbai)',
      quantity: 2,
      unit_price: 10000.0,
      line_total: 20000.0,
      currency_code: 'INR',
      created_at: new Date('2026-10-10T16:15:00Z').toISOString(),
    },
    {
      id: 'd0000000-0000-0000-0000-000000000004',
      invoice_id: 'b0000000-0000-0000-0000-000000000003',
      description: 'Cold-chain Temperature Monitoring Pack',
      quantity: 1,
      unit_price: 5000.0,
      line_total: 5000.0,
      currency_code: 'INR',
      created_at: new Date('2026-10-10T16:15:00Z').toISOString(),
    },
  ],
  invoice_findings: [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      invoice_id: 'b0000000-0000-0000-0000-000000000002',
      user_id: DEMO_USER_ID,
      finding_type: 'DUPLICATE_CANDIDATE',
      severity: 'CRITICAL',
      title: 'Exact Duplicate Invoice Detected',
      description: 'An existing processed invoice (INV-2026-1042) from Apex Cloud Solutions Pvt Ltd with total ₹53,100.00 and identical SHA-256 hash was previously submitted on 2026-09-15.',
      evidence: {
        matched_invoice_number: 'INV-2026-1042',
        matched_amount: 53100.0,
        similarity_score: 1.0,
      },
      related_invoice_id: 'b0000000-0000-0000-0000-000000000001',
      status: 'OPEN',
      created_at: new Date('2026-10-08T14:30:00Z').toISOString(),
      resolved_at: null,
      resolved_by: null,
    },
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      invoice_id: 'b0000000-0000-0000-0000-000000000003',
      user_id: DEMO_USER_ID,
      finding_type: 'ARITHMETIC_MISMATCH',
      severity: 'HIGH',
      title: 'Invoice Total Calculation Discrepancy',
      description: 'Calculated total (Subtotal ₹25,000 - Discount ₹1,000 + Tax ₹4,500 + Charges ₹500 = ₹29,000.00) does not match Stated Total ₹32,500.00. Unaccounted difference of ₹3,500.00.',
      evidence: {
        subtotal: 25000.0,
        discount: 1000.0,
        tax: 4500.0,
        charges: 500.0,
        calculated_total: 29000.0,
        stated_total: 32500.0,
        delta: 3500.0,
      },
      related_invoice_id: null,
      status: 'OPEN',
      created_at: new Date('2026-10-10T16:15:00Z').toISOString(),
      resolved_at: null,
      resolved_by: null,
    },
  ],
  audit_logs: [
    {
      id: 'e0000000-0000-0000-0000-000000000001',
      invoice_id: 'b0000000-0000-0000-0000-000000000001',
      user_id: DEMO_USER_ID,
      action: 'UPLOAD',
      previous_values: null,
      new_values: null,
      note: 'Invoice uploaded and verified with zero findings.',
      created_at: new Date('2026-09-15T12:00:00Z').toISOString(),
    },
    {
      id: 'e0000000-0000-0000-0000-000000000002',
      invoice_id: 'b0000000-0000-0000-0000-000000000001',
      user_id: DEMO_USER_ID,
      action: 'APPROVED',
      previous_values: { review_status: 'Pending' },
      new_values: { review_status: 'Approved' },
      note: 'Approved by Arjun Mehta after review.',
      created_at: new Date('2026-09-16T09:00:00Z').toISOString(),
    },
  ],
};

export const db = {
  // --- Profiles ---
  async findProfileByEmail(email) {
    const normalized = email.toLowerCase().trim();
    if (supabase) {
      const { data, error } = await supabase.from('profiles').select('*').eq('email', normalized).maybeSingle();
      if (error) throw error;
      return data;
    }
    return localStore.profiles.find((p) => p.email.toLowerCase() === normalized) || null;
  },

  async findProfileById(id) {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    }
    return localStore.profiles.find((p) => p.id === id) || null;
  },

  async createProfile({ full_name, email, password_hash, avatar_url = null }) {
    const newProfile = {
      id: uuidv4(),
      full_name,
      email: email.toLowerCase().trim(),
      password_hash: password_hash || null,
      avatar_url: avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase.from('profiles').insert(newProfile).select().single();
      if (error) throw error;
      return data;
    }

    localStore.profiles.push(newProfile);
    return newProfile;
  },

  async syncProfileId(oldId, newId, { full_name, avatar_url } = {}) {
    if (oldId === newId) {
      return this.findProfileById(newId);
    }

    if (supabase) {
      // 1. Fetch old profile data
      const { data: oldProfile } = await supabase.from('profiles').select('*').eq('id', oldId).maybeSingle();
      if (!oldProfile) {
        return this.upsertProfileFromAuthUser({ id: newId, email: '', full_name, avatar_url });
      }

      // 2. Check if new profile already exists
      const { data: existingNew } = await supabase.from('profiles').select('*').eq('id', newId).maybeSingle();
      let targetProfile = existingNew;

      if (!targetProfile) {
        const { data: created, error: insertErr } = await supabase.from('profiles').insert({
          id: newId,
          full_name: full_name || oldProfile.full_name,
          email: oldProfile.email,
          avatar_url: avatar_url || oldProfile.avatar_url || null,
          password_hash: oldProfile.password_hash || null,
          created_at: oldProfile.created_at,
          updated_at: new Date().toISOString(),
        }).select().single();

        if (insertErr) throw insertErr;
        targetProfile = created;
      }

      // 3. Migrate invoices and findings to the new Supabase Auth UID
      try {
        await supabase.from('invoices').update({ user_id: newId }).eq('user_id', oldId);
        await supabase.from('invoice_findings').update({ user_id: newId }).eq('user_id', oldId);
        await supabase.from('profiles').delete().eq('id', oldId);
      } catch (migrationErr) {
        console.warn('[DocuSense] Profile migration note:', migrationErr.message);
      }

      return targetProfile;
    }

    // In-memory store
    const oldP = localStore.profiles.find((p) => p.id === oldId);
    if (oldP) {
      oldP.id = newId;
      if (full_name) oldP.full_name = full_name;
      if (avatar_url) oldP.avatar_url = avatar_url;
      oldP.updated_at = new Date().toISOString();
      localStore.invoices.forEach((inv) => { if (inv.user_id === oldId) inv.user_id = newId; });
      localStore.invoice_findings.forEach((f) => { if (f.user_id === oldId) f.user_id = newId; });
      localStore.audit_logs.forEach((a) => { if (a.user_id === oldId) a.user_id = newId; });
      return oldP;
    }

    return this.upsertProfileFromAuthUser({ id: newId, email: '', full_name, avatar_url });
  },

  async upsertProfileFromAuthUser({ id, email, full_name, avatar_url }) {
    const normalized = (email || '').toLowerCase().trim();

    if (supabase) {
      // Check if profile exists by ID
      const { data: existingById } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (existingById) {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            full_name: full_name || existingById.full_name,
            avatar_url: avatar_url || existingById.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();
        if (error) {
          console.warn('[DocuSense] Profile update notice:', error.message);
          return existingById;
        }
        return data;
      }

      // Check if profile exists by email (link if found)
      if (normalized) {
        const { data: existingByEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', normalized)
          .maybeSingle();

        if (existingByEmail) {
          return await this.syncProfileId(existingByEmail.id, id, { full_name, avatar_url });
        }
      }

      // Insert new profile
      const newProfile = {
        id,
        full_name: full_name || (normalized ? normalized.split('@')[0] : 'User'),
        email: normalized,
        avatar_url: avatar_url || null,
        password_hash: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('profiles').insert(newProfile).select().single();
      if (error) {
        console.warn('[DocuSense] Error inserting profile from auth user:', error.message);
        const { data: retry } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
        if (retry) return retry;
        throw error;
      }
      return data;
    }

    // In-memory localStore fallback
    let profile = localStore.profiles.find((p) => p.id === id);
    if (profile) {
      if (full_name) profile.full_name = full_name;
      if (avatar_url) profile.avatar_url = avatar_url;
      profile.updated_at = new Date().toISOString();
      return profile;
    }

    if (normalized) {
      const existingEmail = localStore.profiles.find((p) => p.email.toLowerCase() === normalized);
      if (existingEmail) {
        return this.syncProfileId(existingEmail.id, id, { full_name, avatar_url });
      }
    }

    const newProfile = {
      id,
      full_name: full_name || (normalized ? normalized.split('@')[0] : 'User'),
      email: normalized,
      avatar_url: avatar_url || null,
      password_hash: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localStore.profiles.push(newProfile);
    return newProfile;
  },

  // --- Invoices ---
  async getInvoicesByUser(userId, { search, status, supplier, category, limit = 50, offset = 0 } = {}) {
    if (supabase) {
      let query = supabase.from('invoices').select('*, invoice_findings(*)', { count: 'exact' }).eq('user_id', userId);
      if (status && status !== 'ALL') query = query.eq('review_status', status);
      if (supplier) query = query.ilike('supplier_name', `%${supplier}%`);
      if (category) query = query.eq('category', category);
      if (search) {
        query = query.or(`invoice_number.ilike.%${search}%,supplier_name.ilike.%${search}%`);
      }
      query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
      const { data, count, error } = await query;
      if (error) throw error;
      return { invoices: data || [], total: count || 0 };
    }

    let list = localStore.invoices.filter((inv) => inv.user_id === userId);
    if (status && status !== 'ALL') {
      list = list.filter((inv) => inv.review_status === status || inv.processing_status === status);
    }
    if (supplier) {
      list = list.filter((inv) => inv.supplier_name.toLowerCase().includes(supplier.toLowerCase()));
    }
    if (category) {
      list = list.filter((inv) => inv.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((inv) => inv.invoice_number.toLowerCase().includes(s) || inv.supplier_name.toLowerCase().includes(s));
    }

    const total = list.length;
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const paginated = list.slice(offset, offset + limit).map((inv) => ({
      ...inv,
      invoice_findings: localStore.invoice_findings.filter((f) => f.invoice_id === inv.id),
    }));

    return { invoices: paginated, total };
  },

  async getInvoiceById(userId, invoiceId) {
    if (supabase) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, invoice_line_items(*), invoice_findings(*), audit_logs(*)')
        .eq('id', invoiceId)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    }

    const inv = localStore.invoices.find((i) => i.id === invoiceId && i.user_id === userId);
    if (!inv) return null;

    return {
      ...inv,
      invoice_line_items: localStore.invoice_line_items.filter((li) => li.invoice_id === inv.id),
      invoice_findings: localStore.invoice_findings.filter((f) => f.invoice_id === inv.id),
      audit_logs: localStore.audit_logs.filter((a) => a.invoice_id === inv.id),
    };
  },

  async findDuplicateCandidates(userId, { document_hash, supplier_name, invoice_number, total_amount }) {
    if (supabase) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .or(`document_hash.eq.${document_hash},and(supplier_name.ilike.${supplier_name},invoice_number.ilike.${invoice_number})`);
      if (error) throw error;
      return data || [];
    }

    const normSupplier = (supplier_name || '').toLowerCase().trim();
    const normNumber = (invoice_number || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    return localStore.invoices.filter((inv) => {
      if (inv.user_id !== userId) return false;
      if (inv.document_hash && inv.document_hash === document_hash) return true;
      const existSupplier = inv.supplier_name.toLowerCase().trim();
      const existNumber = inv.invoice_number.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (existSupplier === normSupplier && existNumber === normNumber) return true;
      return false;
    });
  },

  async createInvoice(invoiceData, lineItems = [], findings = []) {
    const id = invoiceData.id || uuidv4();
    const record = {
      ...invoiceData,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      const { data: createdInvoice, error: invError } = await supabase.from('invoices').insert(record).select().single();
      if (invError) throw invError;

      if (lineItems.length > 0) {
        const itemsWithId = lineItems.map((li) => ({ ...li, id: uuidv4(), invoice_id: id }));
        const { error: liError } = await supabase.from('invoice_line_items').insert(itemsWithId);
        if (liError) throw liError;
      }

      if (findings.length > 0) {
        const findingsWithId = findings.map((f) => ({ ...f, id: uuidv4(), invoice_id: id, user_id: invoiceData.user_id }));
        const { error: fError } = await supabase.from('invoice_findings').insert(findingsWithId);
        if (fError) throw fError;
      }

      return createdInvoice;
    }

    localStore.invoices.push(record);

    lineItems.forEach((li) => {
      localStore.invoice_line_items.push({
        id: uuidv4(),
        invoice_id: id,
        description: li.description || 'Line Item',
        quantity: li.quantity || 1,
        unit_price: li.unit_price || 0,
        line_total: li.line_total || 0,
        currency_code: li.currency_code || record.currency_code,
        created_at: new Date().toISOString(),
      });
    });

    findings.forEach((f) => {
      localStore.invoice_findings.push({
        id: uuidv4(),
        invoice_id: id,
        user_id: record.user_id,
        finding_type: f.finding_type,
        severity: f.severity,
        title: f.title,
        description: f.description,
        evidence: f.evidence || {},
        related_invoice_id: f.related_invoice_id || null,
        status: f.status || 'OPEN',
        created_at: new Date().toISOString(),
        resolved_at: null,
        resolved_by: null,
      });
    });

    return record;
  },

  async updateInvoice(userId, invoiceId, updates) {
    const now = new Date().toISOString();
    const cleanUpdates = { ...updates, updated_at: now };

    if (supabase) {
      const { data, error } = await supabase
        .from('invoices')
        .update(cleanUpdates)
        .eq('id', invoiceId)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const idx = localStore.invoices.findIndex((inv) => inv.id === invoiceId && inv.user_id === userId);
    if (idx === -1) throw new Error('Invoice not found or unauthorized');

    localStore.invoices[idx] = {
      ...localStore.invoices[idx],
      ...cleanUpdates,
    };
    return localStore.invoices[idx];
  },

  // --- Findings ---
  
  async getFindingsByUser(userId, status = 'OPEN') {
    if (supabase) {
      let query = supabase
        .from('invoice_findings')
        .select(`
          *,
          invoice:invoices!invoice_findings_invoice_id_fkey(
            invoice_number,
            supplier_name,
            total_amount,
            currency_code,
            original_filename
          )
        `)
        .eq('user_id', userId);

      if (status && status !== 'ALL') {
        query = query.eq('status', status);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    }

    let findings = localStore.invoice_findings.filter(
      (f) => f.user_id === userId
    );

    if (status && status !== 'ALL') {
      findings = findings.filter((f) => f.status === status);
    }

    return findings.map((f) => {
      const inv = localStore.invoices.find(
        (i) => i.id === f.invoice_id
      );

      return {
        ...f,
        invoice: inv
          ? {
              invoice_number: inv.invoice_number,
              supplier_name: inv.supplier_name,
              total_amount: inv.total_amount,
              currency_code: inv.currency_code,
              original_filename: inv.original_filename,
            }
          : null,
      };
    });
  },

  async updateFindingStatus(userId, findingId, status, resolvedBy) {
    const now = new Date().toISOString();
    const updates = {
      status,
      resolved_at: status === 'RESOLVED' ? now : null,
      resolved_by: status === 'RESOLVED' ? resolvedBy : null,
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('invoice_findings')
        .update(updates)
        .eq('id', findingId)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const f = localStore.invoice_findings.find((item) => item.id === findingId && item.user_id === userId);
    if (!f) throw new Error('Finding not found');
    Object.assign(f, updates);
    return f;
  },

  // --- Audit Logs (Append-Only) ---
  async addAuditLog({ invoice_id, user_id, action, previous_values = null, new_values = null, note = '' }) {
    const entry = {
      id: uuidv4(),
      invoice_id,
      user_id,
      action,
      previous_values,
      new_values,
      note,
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase.from('audit_logs').insert(entry).select().single();
      if (error) throw error;
      return data;
    }

    localStore.audit_logs.push(entry);
    return entry;
  },

  async getAuditLogs(userId, invoiceId) {
    if (supabase) {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }

    return localStore.audit_logs
      .filter((a) => a.user_id === userId && a.invoice_id === invoiceId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
};
