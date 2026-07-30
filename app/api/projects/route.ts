import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '0');
    const page = parseInt(searchParams.get('page') || '1');
    const tag = searchParams.get('tag') || '';

    const query: Record<string, unknown> = { isActive: true };
    if (tag) query.tags = tag;

    const total = await Project.countDocuments(query);

    let projectsQuery = Project.find(query).sort({ order: 1, createdAt: -1 }).lean();

    if (limit > 0) {
      projectsQuery = projectsQuery.skip((page - 1) * limit).limit(limit);
    }

    const projects = await projectsQuery;

    return NextResponse.json({
      projects,
      total,
      page,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
