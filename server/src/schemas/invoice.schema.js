import { z } from 'zod';

export const invoiceCorrectionSchema = z.object({
  supplierName: z.string().trim().min(1).optional(),
  supplierTaxId: z.string().trim().nullable().optional(),
  invoiceNumber: z.string().trim().min(1).optional(),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  currencyCode: z.string().trim().optional(),
  subtotal: z.number().nonnegative().optional(),
  taxAmount: z.number().nonnegative().optional(),
  discountAmount: z.number().nonnegative().nullable().optional(),
  additionalCharges: z.number().nonnegative().nullable().optional(),
  totalAmount: z.number().nonnegative().optional(),
  category: z.string().trim().optional(),
  correctionNote: z.string().trim().optional(),
});

export const invoiceQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  supplier: z.string().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});
