import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Middleware uses only the Edge-Runtime-safe authConfig.
 * No Node.js-only imports (Mongoose, crypto, EventEmitter) are pulled in here.
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ['/admin/:path*'],
};
