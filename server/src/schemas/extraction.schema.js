import { z } from 'zod';

export const lineItemSchema = z.object({
  description: z.string().trim().min(1, 'Item description is required'),
  quantity: z.number().nullable().optional().default(1),
  unitPrice: z.number().nullable().optional().default(0),
  lineTotal: z.number().default(0),
});

export const invoiceExtractionSchema = z.object({
  supplierName: z.string().trim().min(1, 'Supplier name is required'),
  supplierTaxId: z.string().nullable().optional(),
  invoiceNumber: z.string().trim().min(1, 'Invoice number is required'),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invoice date must be in YYYY-MM-DD format'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format').nullable().optional(),
  currencyCode: z.string().trim().default('INR'),
  subtotal: z.number().nonnegative('Subtotal must be non-negative'),
  taxAmount: z.number().nonnegative('Tax amount must be non-negative').default(0),
  discountAmount: z.number().nonnegative('Discount amount must be non-negative').nullable().optional().default(0),
  additionalCharges: z.number().nonnegative('Additional charges must be non-negative').nullable().optional().default(0),
  totalAmount: z.number().nonnegative('Total amount must be non-negative'),
  documentType: z.enum(['INVOICE', 'CREDIT_NOTE', 'RECEIPT', 'PURCHASE_ORDER', 'OTHER']).default('INVOICE'),
  category: z.enum([
    'Software',
    'Logistics',
    'Office Supplies',
    'Equipment',
    'Raw Materials',
    'Utilities',
    'Professional Services',
    'Other',
  ]).default('Other'),
  lineItems: z.array(lineItemSchema).default([]),
  confidence: z.number().min(0).max(1).default(0.95),
  missingFields: z.array(z.string()).default([]),
  uncertainNotes: z.string().nullable().optional(),
});
