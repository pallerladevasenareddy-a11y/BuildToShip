import { Router } from 'express';
import {
  uploadInvoice,
  getInvoices,
  getInvoiceById,
  getDocument,
  updateInvoice,
} from '../controllers/invoice.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { upload, validateFileSignature } from '../middleware/upload.js';

const router = Router();

// All invoice routes require authentication
router.use(requireAuth);

router.post('/upload', upload.single('file'), validateFileSignature, uploadInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.get('/:id/document', getDocument);
router.patch('/:id', updateInvoice);

export default router;
