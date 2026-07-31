import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const profile = await Profile.findOne().lean() || await Profile.create({});
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const data = await req.json();

    const existing = await Profile.findOne();
    if (existing) {
      if (existing.photoUrl && existing.photoUrl !== data.photoUrl) {
        await deleteFromCloudinary(existing.photoUrl);
      }
      if (existing.cvUrl && existing.cvUrl !== data.cvUrl) {
        await deleteFromCloudinary(existing.cvUrl);
      }
    }

    const profile = await Profile.findOneAndUpdate({}, data, { new: true, upsert: true });
    return NextResponse.json(profile);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
