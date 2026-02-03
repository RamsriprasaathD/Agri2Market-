import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Prisma, Role, User } from '@prisma/client';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET ?? '';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined. Please add it to your environment configuration.');
}

export type AppRole = 'farmer' | 'buyer' | 'admin';

export interface AuthPayload {
  id: string;
  email: string;
  name: string;
  role: AppRole;
}

const IST_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

export function formatToIST(date: Date): string {
  return IST_FORMATTER.format(date);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: AuthPayload): string {
  const tokenPayload: AuthPayload = {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };

  return jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & Partial<AuthPayload>;

    if (!decoded || typeof decoded !== 'object') {
      return null;
    }

    const { id, email, name, role } = decoded;

    if (!id || !email || !role) {
      return null;
    }

    return {
      id: String(id),
      email: String(email),
      name: String(name ?? ''),
      role: role as AppRole,
    };
  } catch {
    return null;
  }
}

interface PublicUser extends Omit<User, 'password' | 'resetToken' | 'resetTokenExpiry'> {}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role: Exclude<AppRole, 'admin'>;
  phone?: string;
}) {
  const hashedPassword = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      name: data.name,
      role: (data.role.toUpperCase() as Role),
      phone: data.phone,
      password: hashedPassword,
    },
  });

  return sanitizeUser(user);
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) return null;

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return null;

  return sanitizeUser(user);
}

export async function recordLogin(userId: string) {
  const now = new Date();
  const lastLoginAtIST = formatToIST(now);

  await prisma.user.update({
    where: { id: userId },
    data: {
      lastLoginAt: now,
      lastLoginAtIST,
    } as Prisma.UserUncheckedUpdateInput,
  });

  return { lastLoginAt: now, lastLoginAtIST };
}

const DEFAULT_ADMIN_EMAIL = 'ramsriprasaath@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'Ramsri@2006';

export async function ensureAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD must be set via environment variable when DEFAULT_ADMIN_PASSWORD is removed.');
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existingAdmin) {
    const passwordMatches = await verifyPassword(adminPassword, existingAdmin.password);

    if (!passwordMatches) {
      const hashedPassword = await hashPassword(adminPassword);
      const updatedAdmin = await prisma.user.update({
        where: { email: adminEmail },
        data: { password: hashedPassword },
      });

      return sanitizeUser(updatedAdmin);
    }

    return sanitizeUser(existingAdmin);
  }

  const hashedPassword = await hashPassword(adminPassword);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Agri2Market+ Admin',
      role: 'ADMIN',
      password: hashedPassword,
    },
  });

  return sanitizeUser(admin);
}

export function sanitizeUser(user: User): PublicUser {
  const { password, resetToken, resetTokenExpiry, ...rest } = user;
  return rest;
}
