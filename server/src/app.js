import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import reviewRoutes from './routes/review.routes.js';
import insightsRoutes from './routes/insights.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration: support local development, production Vercel frontend, and env.FRONTEND_URL
const allowedOrigins = [
  'https://build-to-ship-three.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

if (env.FRONTEND_URL) {
  env.FRONTEND_URL.split(',').forEach((url) => {
    const trimmed = url.trim().replace(/\/$/, '');
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (Postman, server-to-server, health checks)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/insights', insightsRoutes);

// Central error handler
app.use(errorHandler);

export default app;
