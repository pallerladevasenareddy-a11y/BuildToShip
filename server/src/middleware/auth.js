import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { db } from '../services/db.service.js';

export async function requireAuth(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session token. Please log in again.',
      });
    }

    const user = await db.findProfileById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account not found or has been deactivated.',
      });
    }

    req.user = {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error.message);
    res.status(500).json({ success: false, error: 'Internal authentication error' });
  }
}
