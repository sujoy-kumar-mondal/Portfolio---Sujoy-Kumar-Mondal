import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContactInfo from '@/models/ContactInfo';

export async function GET() {
  try {
    await connectDB();
    let info = await ContactInfo.findOne().lean();
    if (!info) {
      info = await ContactInfo.create({});
    }
    return NextResponse.json(info);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch contact info' }, { status: 500 });
  }
}
