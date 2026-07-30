import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { newEmail } = await req.json();
    if (!newEmail || typeof newEmail !== 'string') {
      return NextResponse.json({ error: 'Valid new email address is required' }, { status: 400 });
    }

    const normalizedEmail = newEmail.trim().toLowerCase();
    if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    await connectDB();

    // Check if another admin already uses this email
    const existing = await AdminUser.findOne({ email: normalizedEmail, _id: { $ne: session.user.id } });
    if (existing) {
      return NextResponse.json({ error: 'This email is already registered to another admin user' }, { status: 400 });
    }

    const user = await AdminUser.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    user.email = normalizedEmail;
    await user.save();

    return NextResponse.json({ success: true, message: 'Admin email updated successfully', email: normalizedEmail });
  } catch (error) {
    console.error('Change email error:', error);
    return NextResponse.json({ error: 'Failed to change admin email' }, { status: 500 });
  }
}
