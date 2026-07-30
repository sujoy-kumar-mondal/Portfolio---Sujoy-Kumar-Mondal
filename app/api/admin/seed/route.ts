import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';

export async function GET() {
  try {
    await connectDB();
    let admin = await AdminUser.findOne({ email: 'thegamersujoy@gmail.com' });
    if (!admin) {
      admin = await AdminUser.create({ email: 'thegamersujoy@gmail.com', password: 'Sujoy@2003' });
    } else {
      admin.password = 'Sujoy@2003';
      await admin.save();
    }
    return NextResponse.json({ success: true, email: 'thegamersujoy@gmail.com' });
  } catch (error) {
    console.error('Seed API error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
