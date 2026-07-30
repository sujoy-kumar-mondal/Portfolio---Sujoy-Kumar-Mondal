import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import OTP from '@/models/OTP';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { newEmail, otp } = await req.json();

    if (!newEmail || !otp) {
      return NextResponse.json({ error: 'New email address and OTP code are required' }, { status: 400 });
    }

    const normalizedEmail = newEmail.trim().toLowerCase();

    await connectDB();

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired verification OTP' }, { status: 400 });
    }

    const user = await AdminUser.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    // Update email and generate a new session token
    user.email = normalizedEmail;
    user.sessionToken = crypto.randomUUID();
    await user.save();

    // Delete used OTP
    await OTP.deleteMany({ email: normalizedEmail });

    return NextResponse.json({
      success: true,
      email: normalizedEmail,
      message: 'Admin email updated successfully!',
    });
  } catch (error) {
    console.error('Verify change email error:', error);
    return NextResponse.json({ error: 'Failed to update admin email' }, { status: 500 });
  }
}
