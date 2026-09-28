import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_COOKIE_NAME = 'aureus_admin_session';
const JWT_SECRET = process.env.AUTH_SECRET || 'aureus_motors_secure_admin_jwt_secret_token_2026';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin Login Page handling
  if (pathname === '/admin/login') {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, encodedSecret);
        if (payload.role === 'admin') {
          // Already authenticated, redirect to admin dashboard
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      } catch {
        // Expired or invalid token, allow viewing login page
      }
    }
    return NextResponse.next();
  }

  // 2. Protect Admin Frontend Routes (/admin and all sub-paths)
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    let isAuthenticated = false;

    if (token) {
      try {
        const { payload } = await jwtVerify(token, encodedSecret);
        if (payload.role === 'admin') {
          isAuthenticated = true;
        }
      } catch {
        isAuthenticated = false;
      }
    }

    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 3. Protect Admin API Routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    // Whitelist login endpoint
    if (pathname === '/api/admin/auth/login') {
      return NextResponse.next();
    }

    const token =
      request.cookies.get(ADMIN_COOKIE_NAME)?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    let isAuthenticated = false;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, encodedSecret);
        if (payload.role === 'admin') {
          isAuthenticated = true;
        }
      } catch {
        isAuthenticated = false;
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Administrative credentials required',
        },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
