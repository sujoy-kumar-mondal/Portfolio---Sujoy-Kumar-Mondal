import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import OTP from '@/models/OTP';
import crypto from 'crypto';
import { sessionEmitter } from '@/lib/sessionEvents';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  basePath: '/api/auth',
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'OTP', type: 'text' },
        step: { label: 'Step', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        await connectDB();

        const user = await AdminUser.findOne({ email: (credentials.email as string).toLowerCase() });
        if (!user) return null;

        // Step 1: Standard Password Login
        if (!credentials.step || credentials.step === 'password') {
          if (!credentials.password) return null;
          const isValid = await user.comparePassword(credentials.password as string);
          if (!isValid) return null;
        }

        // Step 2: OTP Login (Forgot Password or 2FA OTP)
        if (credentials.step === 'otp') {
          if (!credentials.otp) return null;
          const otpRecord = await OTP.findOne({
            email: (credentials.email as string).toLowerCase(),
            otp: credentials.otp,
            expiresAt: { $gt: new Date() },
          });
          if (!otpRecord) return null;
          await OTP.deleteOne({ _id: otpRecord._id });
        }

        // Generate a new Session Token on every login to invalidate previous sessions (Single Active Session)
        const sessionToken = crypto.randomUUID();
        user.sessionToken = sessionToken;
        await user.save();

        // Broadcast real-time SSE event to invalidate older sessions on other devices
        sessionEmitter.emit('session-updated', {
          userId: user._id.toString(),
          newSessionToken: sessionToken,
        });

        return {
          id: user._id.toString(),
          email: user.email,
          sessionToken,
        };
      },
    }),
  ],
});
