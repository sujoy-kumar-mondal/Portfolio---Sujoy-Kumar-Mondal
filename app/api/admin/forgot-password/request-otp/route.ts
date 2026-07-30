import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import OTP from '@/models/OTP';
import { sendOTPEmail } from '@/lib/nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const normalizedEmail = email.trim().toLowerCase();

    await connectDB();
    const user = await AdminUser.findOne({ email: normalizedEmail });
    if (!user) {
      // Return error if user does not exist
      return NextResponse.json({ error: 'Admin user with this email not found' }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Clear old OTPs for this email
    await OTP.deleteMany({ email: normalizedEmail });

    // Save new OTP
    await OTP.create({
      email: normalizedEmail,
      otp,
      expiresAt,
    });

    // Send email
    await sendOTPEmail(normalizedEmail, otp);

    return NextResponse.json({ success: true, message: 'OTP sent to your email successfully.' });
  } catch (error) {
    console.error('Request OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP. Please check server email credentials.' }, { status: 500 });
  }
}
