import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import OTP from '@/models/OTP';
import { sendOTPEmail } from '@/lib/nodemailer';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { newEmail } = await req.json();
    if (!newEmail || typeof newEmail !== 'string') {
      return NextResponse.json({ error: 'New email address is required' }, { status: 400 });
    }

    const normalizedEmail = newEmail.trim().toLowerCase();
    if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    await connectDB();

    // Check if another admin already uses this email
    const existing = await AdminUser.findOne({ email: normalizedEmail, _id: { $ne: session.user.id } });
    if (existing) {
      return NextResponse.json({ error: 'This email address is already registered' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTP.deleteMany({ email: normalizedEmail });
    await OTP.create({
      email: normalizedEmail,
      otp,
      expiresAt,
    });

    // Send OTP to new email address
    await sendOTPEmail(normalizedEmail, otp);

    return NextResponse.json({ success: true, message: `Verification OTP sent to ${normalizedEmail}` });
  } catch (error) {
    console.error('Request change email OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP to new email address' }, { status: 500 });
  }
}
