import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import SocialLink from '@/models/SocialLink';

async function renormalizePosition(position: 'top' | 'right' | string, updatedId?: string, targetOrder?: number) {
  const targetPos = (position === 'top' ? 'top' : 'right') as 'top' | 'right';
  let items = await SocialLink.find({ position: targetPos }).sort({ order: 1, createdAt: 1 }).lean();

  if (updatedId && typeof targetOrder === 'number') {
    const targetItem = items.find(i => i._id.toString() === updatedId.toString());
    const otherItems = items.filter(i => i._id.toString() !== updatedId.toString());

    if (targetItem) {
      const clampedOrder = Math.max(0, Math.min(targetOrder, otherItems.length));
      otherItems.splice(clampedOrder, 0, targetItem);
      items = otherItems;
    }
  }

  for (let i = 0; i < items.length; i++) {
    await SocialLink.findByIdAndUpdate(items[i]._id, { order: i });
  }
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();

  // Ensure top and right categories have clean, non-duplicate 0-indexed orders
  await renormalizePosition('top');
  await renormalizePosition('right');

  const links = await SocialLink.find().sort({ position: 1, order: 1, createdAt: 1 }).lean();
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const data = await req.json();
    const pos = data.position || 'right';
    const count = await SocialLink.countDocuments({ position: pos });
    const targetOrder = typeof data.order === 'number' ? data.order : count;

    const link = await SocialLink.create({ ...data, position: pos, order: targetOrder });
    await renormalizePosition(pos, link._id.toString(), targetOrder);
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
    const body = await req.json();

    // Support batch reordering
    if (Array.isArray(body)) {
      for (const item of body) {
        if (item.id && typeof item.order === 'number') {
          await SocialLink.findByIdAndUpdate(item.id, { order: item.order });
        }
      }
      return NextResponse.json({ success: true });
    }

    const { id, ...data } = body;
    const existing = await SocialLink.findById(id);
    const link = await SocialLink.findByIdAndUpdate(id, data, { new: true });

    if (link) {
      const pos = link.position || 'right';
      await renormalizePosition(pos, link._id.toString(), data.order);
      if (existing && existing.position !== pos) {
        await renormalizePosition(existing.position);
      }
    }

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

    let id: string | null = null;
    try {
      const body = await req.json();
      id = body?.id || body?._id || null;
    } catch {
      // Body may be empty or invalid JSON
    }

    if (!id) {
      id = req.nextUrl.searchParams.get('id') || req.nextUrl.searchParams.get('_id');
    }

    if (!id) {
      return NextResponse.json({ error: 'Social link ID is required' }, { status: 400 });
    }

    const link = await SocialLink.findById(id);
    if (link) {
      const pos = link.position || 'right';
      await SocialLink.findByIdAndDelete(id);
      await renormalizePosition(pos);
      return NextResponse.json({ success: true, deletedId: id });
    }

    return NextResponse.json({ error: 'Social link not found' }, { status: 404 });
  } catch (error) {
    console.error('Error deleting social link:', error);
    return NextResponse.json({ error: 'Failed to delete social link' }, { status: 500 });
  }
}

