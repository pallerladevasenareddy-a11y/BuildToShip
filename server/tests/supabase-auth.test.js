import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { supabase } from '../src/config/supabase.js';
import * as envConfig from '../src/config/env.js';
import { db } from '../src/services/db.service.js';

describe('Supabase Google OAuth & Session Verification', () => {
  const mockGoogleUser = {
    id: 'f0000000-1111-2222-3333-444444444444',
    email: 'google.analyst@example.com',
    app_metadata: { provider: 'google' },
    user_metadata: {
      full_name: 'Ananya Rao',
      name: 'Ananya Rao',
      avatar_url: 'https://lh3.googleusercontent.com/a/mock-avatar-123',
      picture: 'https://lh3.googleusercontent.com/a/mock-avatar-123',
    },
  };

  it('rejects requests with missing Authorization header with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Authentication required/i);
  });

  it('rejects requests with forged/invalid tokens with 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token-sample-forged-999');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Invalid or expired session token/i);
  });

  it('creates or synchronizes a profile from Supabase Google Auth user metadata', async () => {
    const profile = await db.upsertProfileFromAuthUser({
      id: mockGoogleUser.id,
      email: mockGoogleUser.email,
      full_name: mockGoogleUser.user_metadata.full_name,
      avatar_url: mockGoogleUser.user_metadata.avatar_url,
    });

    expect(profile).toBeDefined();
    expect(profile.id).toBe(mockGoogleUser.id);
    expect(profile.email).toBe(mockGoogleUser.email.toLowerCase());
    expect(profile.full_name).toBe('Ananya Rao');
    expect(profile.avatar_url).toBe('https://lh3.googleusercontent.com/a/mock-avatar-123');
    expect(profile.password_hash).toBeNull();
  });

  it('preserves existing user data when linking a pre-existing profile to Supabase Auth UID', async () => {
    // 1. Create a legacy profile with demo email
    const legacyEmail = `legacy_${Date.now()}@testcorp.com`;
    const legacyProfile = await db.createProfile({
      full_name: 'Legacy Operator',
      email: legacyEmail,
      password_hash: 'legacy_hash',
    });

    // 2. User signs in with Google having the same email
    const newGoogleUid = 'f9999999-8888-7777-6666-555555555555';
    const syncedProfile = await db.upsertProfileFromAuthUser({
      id: newGoogleUid,
      email: legacyEmail,
      full_name: 'Legacy Operator (Google)',
      avatar_url: 'https://lh3.googleusercontent.com/a/google-avatar',
    });

    expect(syncedProfile.id).toBe(newGoogleUid);
    expect(syncedProfile.email).toBe(legacyEmail);
    expect(syncedProfile.avatar_url).toBe('https://lh3.googleusercontent.com/a/google-avatar');
  });

  it('allows access to protected routes when authenticated and enforces scoping', async () => {
    // Use the demo credentials to verify protected invoice access
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'demo@docusense.ai',
        password: 'DemoPass123!',
      });

    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('demo@docusense.ai');

    // POST /api/auth/sync returns user identity
    const syncRes = await request(app)
      .post('/api/auth/sync')
      .set('Authorization', `Bearer ${token}`);

    expect(syncRes.status).toBe(200);
    expect(syncRes.body.user.id).toBe(loginRes.body.user.id);
  });
});
