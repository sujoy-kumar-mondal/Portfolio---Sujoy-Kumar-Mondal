import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import MetadataModel from '@/models/Metadata';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    let meta = await MetadataModel.findById('site_metadata').lean();
    if (!meta) {
      meta = await MetadataModel.create({
        _id: 'site_metadata',
        title: '',
        description: '',
        keywords: [],
        icons: {
          icon: '',
          shortcut: '',
          apple: '',
        },
        openGraph: {
          title: '',
          description: '',
          type: '',
        },
        logos: {
          navbarLogo: '',
          bannerLogo: '',
        },
        cursorUrl: '',
      });
    }
    return NextResponse.json(meta);
  } catch (error) {
    console.error('Error fetching admin metadata:', error);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const data = await req.json();

    const existing = await MetadataModel.findById('site_metadata');
    if (existing) {
      // Clean up old Cloudinary images if replaced
      if (existing.icons?.icon && existing.icons.icon !== data.icons?.icon) {
        await deleteFromCloudinary(existing.icons.icon).catch(console.error);
      }
      if (existing.icons?.shortcut && existing.icons.shortcut !== data.icons?.shortcut) {
        await deleteFromCloudinary(existing.icons.shortcut).catch(console.error);
      }
      if (existing.icons?.apple && existing.icons.apple !== data.icons?.apple) {
        await deleteFromCloudinary(existing.icons.apple).catch(console.error);
      }
      if (existing.logos?.navbarLogo && existing.logos.navbarLogo !== data.logos?.navbarLogo) {
        await deleteFromCloudinary(existing.logos.navbarLogo).catch(console.error);
      }
      if (existing.logos?.bannerLogo && existing.logos.bannerLogo !== data.logos?.bannerLogo) {
        await deleteFromCloudinary(existing.logos.bannerLogo).catch(console.error);
      }
      if (existing.cursorUrl && existing.cursorUrl !== data.cursorUrl) {
        await deleteFromCloudinary(existing.cursorUrl).catch(console.error);
      }
    }

    const iconVal = data.icons?.icon || data.icons?.shortcut || data.icons?.apple || '';

    const updated = await MetadataModel.findOneAndUpdate(
      { _id: 'site_metadata' },
      {
        title: data.title,
        description: data.description,
        keywords: Array.isArray(data.keywords) ? data.keywords : [],
        icons: {
          icon: iconVal,
          shortcut: iconVal,
          apple: iconVal,
        },
        openGraph: {
          title: data.openGraph?.title || data.title || '',
          description: data.openGraph?.description || data.description || '',
          type: data.openGraph?.type || 'website',
        },
        logos: {
          navbarLogo: data.logos?.navbarLogo || '',
          bannerLogo: data.logos?.bannerLogo || '',
        },
        cursorUrl: data.cursorUrl || '',
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating admin metadata:', error);
    return NextResponse.json({ error: 'Failed to update metadata' }, { status: 500 });
  }
}
