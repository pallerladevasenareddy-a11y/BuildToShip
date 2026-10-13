import multer from 'multer';
import { env } from '../config/env.js';

// Multer memory storage
const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: PDF, PNG, JPEG, WebP.`), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
  },
  fileFilter,
});

/**
 * Validate magic bytes (file signature) to prevent MIME spoofing
 */
export function validateFileSignature(req, res, next) {
  if (!req.file || !req.file.buffer) {
    return next();
  }

  const buffer = req.file.buffer;
  const mime = req.file.mimetype;

  // Check PDF signature: %PDF- (0x25 0x50 0x44 0x46)
  if (mime === 'application/pdf') {
    const isPdf = buffer.length >= 4 &&
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46;

    if (!isPdf) {
      return res.status(400).json({
        success: false,
        error: 'File signature mismatch: Uploaded file claims to be a PDF but does not have valid PDF headers.',
      });
    }
  }

  // Check PNG signature: 89 50 4E 47
  if (mime === 'image/png') {
    const isPng = buffer.length >= 4 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4E &&
      buffer[3] === 0x47;

    if (!isPng) {
      return res.status(400).json({
        success: false,
        error: 'File signature mismatch: Invalid PNG header.',
      });
    }
  }

  // Check JPEG signature: FF D8 FF
  if (mime === 'image/jpeg') {
    const isJpg = buffer.length >= 3 &&
      buffer[0] === 0xFF &&
      buffer[1] === 0xD8 &&
      buffer[2] === 0xFF;

    if (!isJpg) {
      return res.status(400).json({
        success: false,
        error: 'File signature mismatch: Invalid JPEG header.',
      });
    }
  }

  next();
}
