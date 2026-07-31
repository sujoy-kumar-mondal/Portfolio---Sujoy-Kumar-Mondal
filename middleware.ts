import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Next.js Middleware (Protects /admin routes).
 * Supports both standard middleware.ts and proxy conventions.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName:
        req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https'
          ? '__Secure-authjs.session-token'
          : 'authjs.session-token',
      raw: true,
    });

    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const proxy = middleware;

export const config = {
  matcher: ['/admin/:path*'],
};
