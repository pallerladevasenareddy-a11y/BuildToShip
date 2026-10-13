import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  console.error('[Unhandled Error]:', err.message);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Uploaded file exceeds the maximum allowed size limit (10MB).',
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    });
  }

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  // Return clean, safe error message without leaking sensitive server internals
  res.status(statusCode).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred',
  });
}
