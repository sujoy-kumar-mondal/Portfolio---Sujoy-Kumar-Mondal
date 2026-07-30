import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-Runtime-safe auth config.
 * NO Node.js-only imports (Mongoose, crypto, EventEmitter, etc.) allowed here.
 * This file is used by middleware which runs on Vercel Edge Runtime.
 */
export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: { signIn: '/admin/login' },
  session: { strategy: 'jwt' },
  providers: [], // providers are added in auth.ts (Node.js runtime only)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sessionToken = (user as { sessionToken?: string }).sessionToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { sessionToken?: string }).sessionToken = token.sessionToken as string;
      }
      return session;
    },
  },
};
