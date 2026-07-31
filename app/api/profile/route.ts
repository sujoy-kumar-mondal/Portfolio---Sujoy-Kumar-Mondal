import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';

export async function GET() {
  try {
    await connectDB();
    let profile = await Profile.findOne().lean();
    if (!profile) {
      profile = await Profile.create({});
    }
    const profileObj = { ...profile };
    if (!profileObj.cvUrl) {
      profileObj.cvUrl = '';
    }
    return NextResponse.json(profileObj);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
