import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import OTP from '@/models/OTP';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    await connectDB();

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP code' }, { status: 400 });
    }

    const user = await AdminUser.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    // Update password and invalidate previous sessions
    user.password = newPassword;
    user.sessionToken = crypto.randomUUID();
    await user.save();

    // Delete used OTP
    await OTP.deleteMany({ email: normalizedEmail });

    return NextResponse.json({ success: true, message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
