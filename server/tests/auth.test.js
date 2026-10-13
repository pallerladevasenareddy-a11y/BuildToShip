import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Authentication and Ownership Isolation', () => {
  const testUser = {
    fullName: 'Priya Sharma',
    email: `priya_${Date.now()}@fintech.test`,
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
  };

  let authToken = null;

  it('successfully registers a new user and returns JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.user.password_hash).toBeUndefined(); // Never leak password hashes
  });

  it('rejects duplicate registration with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('enforces password policy (uppercase, number, min length 8)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Weak User',
        email: 'weak@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('authenticates with valid credentials and issues session token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  it('rejects invalid password with generic 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword999!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('allows access to protected route /api/auth/me with Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
  });

  it('blocks unauthenticated requests to protected endpoints with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
