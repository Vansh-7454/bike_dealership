import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import connectToDatabase from './mongodb';
import Admin from '@/models/Admin';

export const ADMIN_COOKIE_NAME = 'torque_bike_admin_session';
const JWT_SECRET = process.env.AUTH_SECRET || 'torque_two_wheelers_jwt_secret_token_2026';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export interface AdminSessionPayload {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

/**
 * Hash a plain-text password using bcrypt
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compare plain-text password with bcrypt hash
 */
export async function comparePassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}

/**
 * Sign a JWT token for the authenticated admin
 */
export async function signAdminToken(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: 'admin',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedSecret);
}

/**
 * Verify and decode an admin JWT token
 */
export async function verifyAdminToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    if (payload.role !== 'admin' || !payload.id || !payload.email) {
      return null;
    }
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: (payload.name as string) || 'Administrator',
      role: 'admin',
    };
  } catch {
    return null;
  }
}

/**
 * Safe Admin Creation / Seed Helper
 * Ensures the single admin account exists using environment variables.
 * Prevents duplicate admin creation.
 */
export async function seedAdminUser(): Promise<{ created: boolean; email: string }> {
  await connectToDatabase();

  const count = await Admin.countDocuments();
  if (count > 0) {
    const existing = await Admin.findOne().lean();
    return { created: false, email: (existing as { email?: string } | null)?.email || 'admin@torquemoto.in' };
  }

  const email = (process.env.ADMIN_EMAIL || 'admin@torquemoto.in').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || 'TorqueAdmin2026!';
  const hashedPassword = await hashPassword(password);

  await Admin.create({
    email,
    password: hashedPassword,
    name: 'Torque Two-Wheelers Principal',
    role: 'admin',
  });

  console.log(`[Torque Two-Wheelers] Initial administrator account created for: ${email}`);
  return { created: true, email };
}

/**
 * Authenticate admin by credentials and return session token
 */
export async function authenticateAdmin(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; token?: string; admin?: AdminSessionPayload; error?: string }> {
  try {
    await connectToDatabase();
    await seedAdminUser();

    const normalizedEmail = emailInput.trim().toLowerCase();
    const admin = await Admin.findOne({ email: normalizedEmail }).lean();

    if (!admin) {
      return { success: false, error: 'Invalid email or password' };
    }

    const isValid = await comparePassword(passwordInput, admin.password);
    if (!isValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    const payload: AdminSessionPayload = {
      id: String((admin as { _id: unknown })._id),
      email: admin.email,
      name: admin.name,
      role: 'admin',
    };

    const token = await signAdminToken(payload);
    return { success: true, token, admin: payload };
  } catch (error: unknown) {
    console.error('[Torque Two-Wheelers] Admin authentication error:', error);
    return { success: false, error: 'Authentication service temporarily unavailable' };
  }
}

/**
 * Extract and verify admin session from NextRequest cookies or Authorization header
 */
export async function getAdminSession(request: NextRequest): Promise<AdminSessionPayload | null> {
  // Check HTTP-only cookie first
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME);
  if (cookie?.value) {
    const verified = await verifyAdminToken(cookie.value);
    if (verified) return verified;
  }

  // Fallback to Bearer authorization header if present
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7).trim();
    const verified = await verifyAdminToken(bearerToken);
    if (verified) return verified;
  }

  return null;
}

/**
 * Guard for protected admin API routes.
 * Returns the admin payload if authenticated, or a 401 Unauthorized NextResponse.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ admin: AdminSessionPayload } | { errorResponse: NextResponse }> {
  const admin = await getAdminSession(request);
  if (!admin) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Administrative access required',
        },
        { status: 401 }
      ),
    };
  }
  return { admin };
}
