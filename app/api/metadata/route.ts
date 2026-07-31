import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MetadataModel from '@/models/Metadata';

export async function GET() {
  try {
    await connectDB();
    const meta = await MetadataModel.findById('site_metadata').lean();
    if (!meta) {
      return NextResponse.json({
        _id: '',
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
    console.error('Failed to fetch metadata:', error);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}
