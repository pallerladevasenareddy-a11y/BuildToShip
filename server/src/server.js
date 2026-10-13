import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  DocuSense AI Backend Server listening on port ${PORT} `);
  console.log(`  Environment: ${env.NODE_ENV}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

// Handle graceful termination
process.on('SIGTERM', () => {
  console.log('[DocuSense] SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('[DocuSense] HTTP server closed');
  });
});
