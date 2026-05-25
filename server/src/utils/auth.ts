import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import type { User } from '../types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kenkan-books-secret-key-2024';

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function createOtp(email: string, purpose: string = 'register'): { id: string; otp: string } {
  const id = uuidv4();
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO otp_verifications (id, email, otp, purpose, expires_at) VALUES (?, ?, ?, ?, ?)')
    .run(id, email, otp, purpose, expiresAt);
  return { id, otp };
}

export function verifyOtp(email: string, otp: string, purpose: string = 'register'): boolean {
  const record = db.prepare(
    'SELECT * FROM otp_verifications WHERE email = ? AND otp = ? AND purpose = ? AND used = 0 AND expires_at > datetime(\'now\')'
  ).get(email, otp, purpose) as { id: string } | undefined;

  if (!record) return false;

  db.prepare('UPDATE otp_verifications SET used = 1 WHERE id = ?').run(record.id);
  return true;
}
