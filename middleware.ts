import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Next.js Proxy / Middleware (Protects /admin routes).
 * Never intercepts /api/auth endpoints.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip authentication check for Auth.js API endpoints
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

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

export default middleware;

export const config = {
  matcher: ['/admin/:path*'],
};
