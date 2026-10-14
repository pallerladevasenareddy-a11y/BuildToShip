import jwt from 'jsonwebtoken';
import { env, isLiveSupabaseAvailable } from '../config/env.js';
import { supabase } from '../config/supabase.js';
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

    // 1. Verify with Supabase Auth if Supabase is configured
    if (isLiveSupabaseAvailable && supabase) {
      try {
        const { data: sbData, error: sbError } = await supabase.auth.getUser(token);
        if (!sbError && sbData?.user) {
          const sbUser = sbData.user;
          const meta = sbUser.user_metadata || {};
          const profile = await db.upsertProfileFromAuthUser({
            id: sbUser.id,
            email: sbUser.email || '',
            full_name: meta.full_name || meta.name || (sbUser.email ? sbUser.email.split('@')[0] : 'User'),
            avatar_url: meta.avatar_url || meta.picture || null,
          });

          req.user = {
            id: profile.id,
            fullName: profile.full_name,
            email: profile.email,
            avatarUrl: profile.avatar_url || null,
            authProvider: sbUser.app_metadata?.provider || 'google',
          };

          return next();
        }
      } catch (sbErr) {
        // If Supabase call failed, log and attempt local verification fallback below
        console.warn('[DocuSense Auth] Supabase getUser check note:', sbErr.message);
      }
    }

    // 2. Legacy / Local / Test JWT verification fallback
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
      avatarUrl: user.avatar_url || null,
      authProvider: 'local',
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error.message);
    res.status(500).json({ success: false, error: 'Internal authentication error' });
  }
}

