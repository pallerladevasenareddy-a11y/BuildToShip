import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { db } from '../services/db.service.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

function signToken(userId, email) {
  return jwt.sign({ id: userId, email }, env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

export async function register(req, res, next) {
  try {
    const validated = registerSchema.parse(req.body);

    const existing = await db.findProfileByEmail(validated.email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    const user = await db.createProfile({
      full_name: validated.fullName,
      email: validated.email,
      password_hash: passwordHash,
    });

    const token = signToken(user.id, user.email);

    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await db.findProfileByEmail(validated.email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email address or password.',
      });
    }

    const isMatch = await bcrypt.compare(validated.password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email address or password.',
      });
    }

    const token = signToken(user.id, user.email);

    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

export async function getMe(req, res) {
  res.status(200).json({
    success: true,
    user: req.user,
  });
}
