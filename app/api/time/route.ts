import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    return NextResponse.json({
      timestamp: now.getTime(),
      datetime: now.toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ timestamp: Date.now() }, { status: 500 });
  }
}
