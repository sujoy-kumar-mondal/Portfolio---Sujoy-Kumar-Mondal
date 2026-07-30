import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import ContactInfo from '@/models/ContactInfo';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const info = await ContactInfo.findOne().lean() || await ContactInfo.create({});
  return NextResponse.json(info);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const data = await req.json();
    const info = await ContactInfo.findOneAndUpdate({}, data, { new: true, upsert: true });
    return NextResponse.json(info);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update contact info' }, { status: 500 });
  }
}
