import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Named "middleware" export required by Next.js 16+.
 * Uses Edge-Runtime-safe authConfig only — no Node.js/Mongoose imports.
 * Uses getToken with the correct cookie names for NextAuth v5.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // NextAuth v5 cookie names (different from v4):
    //   HTTP:  authjs.session-token
    //   HTTPS: __Secure-authjs.session-token
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

export const config = {
  matcher: ['/admin/:path*'],
};
