import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import SocialLink from '@/models/SocialLink';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const links = await SocialLink.find().sort({ order: 1 }).lean();
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const data = await req.json();
    const count = await SocialLink.countDocuments();
    const link = await SocialLink.create({ ...data, order: count });
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create social link' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const { id, ...data } = await req.json();
    const link = await SocialLink.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(link);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update social link' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const { id } = await req.json();

    const link = await SocialLink.findById(id);
    if (link) {
      if ((link as unknown as { iconUrl?: string }).iconUrl) {
        await deleteFromCloudinary((link as unknown as { iconUrl: string }).iconUrl);
      }
      await SocialLink.findByIdAndDelete(id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete social link' }, { status: 500 });
  }
}
