import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
}

export function cleanDescriptionParts(parts: any[]): { text: string; url?: string }[] {
  if (!Array.isArray(parts)) return [];
  return parts
    .map(p => ({
      text: p?.text != null ? String(p.text) : '',
      url: (p?.url || '').trim(),
    }))
    .filter(p => p.text.trim().length > 0);
}

export function parseMongooseError(error: any): string {
  if (error?.name === 'ValidationError' && error?.errors) {
    const firstKey = Object.keys(error.errors)[0];
    const errObj = error.errors[firstKey];
    if (firstKey.includes('shortDescription')) {
      return 'Short Description text is required. Please enter text for all description parts.';
    }
    if (firstKey.includes('description')) {
      return 'Full Description text is required. Please enter text for all description parts.';
    }
    if (firstKey.includes('name')) {
      return 'Project name is required.';
    }
    return errObj?.message || 'Project validation failed. Please check all required fields.';
  }
  return error?.message || 'Failed to save project';
}

export async function renormalizeProjectOrders(updatedId?: string, targetOrder?: number) {
  try {
    let items = await Project.find().sort({ order: 1, createdAt: -1 }).lean();

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
      await Project.findByIdAndUpdate(items[i]._id, { order: i });
    }
  } catch (err) {
    console.error('Error in renormalizeProjectOrders:', err);
  }
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();

  // Normalize any existing order gaps/duplicates
  await renormalizeProjectOrders();

  const projects = await Project.find().sort({ order: 1, createdAt: -1 }).lean();
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const data = await req.json();

    if (!data.name || !data.name.trim()) {
      return NextResponse.json({ error: 'Project name is required.' }, { status: 400 });
    }

    const shortDescription = cleanDescriptionParts(data.shortDescription);
    const description = cleanDescriptionParts(data.description);

    if (shortDescription.length === 0) {
      return NextResponse.json({ error: 'Short Description text is required.' }, { status: 400 });
    }
    if (description.length === 0) {
      return NextResponse.json({ error: 'Full Description text is required.' }, { status: 400 });
    }

    const count = await Project.countDocuments();
    let slug = data.slug || slugify(data.name);

    // Ensure unique slug
    const existing = await Project.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const targetOrder = typeof data.order === 'number' ? data.order : count;
    const project = await Project.create({
      ...data,
      name: data.name.trim(),
      slug,
      shortDescription,
      description,
      order: targetOrder,
    });
    await renormalizeProjectOrders(project._id.toString(), targetOrder);

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error('Project creation error:', error);
    const userMessage = parseMongooseError(error);
    return NextResponse.json({ error: userMessage }, { status: 400 });
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
          await Project.findByIdAndUpdate(item.id, { order: item.order });
        }
      }
      await renormalizeProjectOrders();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (error: any) {
    console.error('Project batch update error:', error);
    const userMessage = parseMongooseError(error);
    return NextResponse.json({ error: userMessage }, { status: 400 });
  }
}
