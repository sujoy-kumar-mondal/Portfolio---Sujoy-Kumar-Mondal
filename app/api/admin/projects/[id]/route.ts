import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { renormalizeProjectOrders, cleanDescriptionParts, parseMongooseError } from '../route';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const project = await Project.findById(id).lean();
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(project);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const { id } = await params;
    const data = await req.json();

    if (data.name !== undefined && (!data.name || !data.name.trim())) {
      return NextResponse.json({ error: 'Project name is required.' }, { status: 400 });
    }

    if (data.shortDescription !== undefined) {
      data.shortDescription = cleanDescriptionParts(data.shortDescription);
      if (data.shortDescription.length === 0) {
        return NextResponse.json({ error: 'Short Description text is required.' }, { status: 400 });
      }
    }

    if (data.description !== undefined) {
      data.description = cleanDescriptionParts(data.description);
      if (data.description.length === 0) {
        return NextResponse.json({ error: 'Full Description text is required.' }, { status: 400 });
      }
    }

    const existing = await Project.findById(id);
    if (existing) {
      // Check if mainImage changed or removed
      if (existing.mainImage && existing.mainImage !== data.mainImage) {
        await deleteFromCloudinary(existing.mainImage);
      }
      // Check for removed gallery images
      if (existing.images && Array.isArray(existing.images)) {
        const newImages = Array.isArray(data.images) ? data.images : [];
        for (const oldImg of existing.images) {
          if (oldImg && !newImages.includes(oldImg)) {
            await deleteFromCloudinary(oldImg);
          }
        }
      }
    }

    const project = await Project.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (project) {
      await renormalizeProjectOrders(id, typeof data.order === 'number' ? data.order : undefined);
    }
    return NextResponse.json(project);
  } catch (error: any) {
    console.error('Project update error:', error);
    const userMessage = parseMongooseError(error);
    return NextResponse.json({ error: userMessage }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const { id } = await params;

    const project = await Project.findById(id);
    if (project) {
      // Delete mainImage from Cloudinary
      if (project.mainImage) {
        await deleteFromCloudinary(project.mainImage);
      }
      // Delete gallery images from Cloudinary
      if (project.images && Array.isArray(project.images)) {
        for (const imgUrl of project.images) {
          if (imgUrl) await deleteFromCloudinary(imgUrl);
        }
      }
      await Project.findByIdAndDelete(id);
      await renormalizeProjectOrders();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Project deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
