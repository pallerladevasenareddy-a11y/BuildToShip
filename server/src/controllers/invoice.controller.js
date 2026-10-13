import { processInvoiceUpload, correctInvoiceFields } from '../services/invoice.service.js';
import { db } from '../services/db.service.js';
import { getDocumentAccess, getDocumentBuffer } from '../services/storage.service.js';
import { invoiceCorrectionSchema, invoiceQuerySchema } from '../schemas/invoice.schema.js';

export async function uploadInvoice(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No document file provided. Please upload a PDF or image.',
      });
    }

    const isDemoMode = req.body.isDemoMode === 'true' || req.body.isDemoMode === true;
    const scenarioKey = req.body.scenarioKey || null;

    const result = await processInvoiceUpload({
      userId: req.user.id,
      file: req.file,
      isDemoMode,
      scenarioKey,
    });

    res.status(201).json({
      success: true,
      message: 'Invoice uploaded and processed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getInvoices(req, res, next) {
  try {
    const filters = invoiceQuerySchema.parse(req.query);
    const { invoices, total } = await db.getInvoicesByUser(req.user.id, filters);

    res.status(200).json({
      success: true,
      data: invoices,
      pagination: {
        total,
        limit: filters.limit,
        offset: filters.offset,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getInvoiceById(req, res, next) {
  try {
    const invoice = await db.getInvoiceById(req.user.id, req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found or access denied',
      });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDocument(req, res, next) {
  try {
    const invoice = await db.getInvoiceById(req.user.id, req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice document not found',
      });
    }

    const access = await getDocumentAccess({ storagePath: invoice.storage_path });
    if (access.signedUrl) {
      return res.redirect(access.signedUrl);
    }

    // Stream directly from storage/buffer
    const buffer = await getDocumentBuffer(invoice.storage_path);
    if (!buffer) {
      // If synthetic pre-seeded sample invoice, send a clean placeholder PDF buffer or HTML
      res.setHeader('Content-Type', invoice.mime_type || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${invoice.original_filename}"`);
      return res.send(Buffer.from(`%PDF-1.4\n1 0 obj\n<< /Title (${invoice.original_filename}) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`));
    }

    res.setHeader('Content-Type', invoice.mime_type || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${invoice.original_filename}"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
}

export async function updateInvoice(req, res, next) {
  try {
    const updates = invoiceCorrectionSchema.parse(req.body);
    const result = await correctInvoiceFields(
      req.user.id,
      req.params.id,
      updates,
      req.body.correctionNote
    );

    res.status(200).json({
      success: true,
      message: 'Invoice fields corrected and re-validated',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
