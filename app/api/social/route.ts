import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SocialLink from '@/models/SocialLink';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    const links = await SocialLink.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json(links);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch social links' }, { status: 500 });
  }
}
