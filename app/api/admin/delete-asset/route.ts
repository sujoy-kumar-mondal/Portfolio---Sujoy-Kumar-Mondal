import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { url } = await req.json();
    if (url) {
      await deleteFromCloudinary(url);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete asset error:', error);
    return NextResponse.json({ error: 'Failed to delete asset from Cloudinary' }, { status: 500 });
  }
}
