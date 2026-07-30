import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { deleteFromCloudinary } from '@/lib/cloudinary';

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

    const project = await Project.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
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
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
