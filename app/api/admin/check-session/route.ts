import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    // Session hydrating or not logged in; return non-invalidating response
    return NextResponse.json({ valid: true });
  }

  try {
    await connectDB();
    const userId = (session.user as { id?: string }).id;
    const sessionToken = (session.user as { sessionToken?: string }).sessionToken;

    if (!userId || !sessionToken) {
      return NextResponse.json({ valid: true });
    }

    const dbUser = await AdminUser.findById(userId).select('sessionToken').lean();
    if (dbUser && dbUser.sessionToken && dbUser.sessionToken !== sessionToken) {
      // ONLY invalidate if DB has a newer sessionToken from another login
      return NextResponse.json({
        valid: false,
        invalidated: true,
        reason: 'Session token invalidated by login on another device',
      }, { status: 401 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Check session error:', error);
    return NextResponse.json({ valid: true });
  }
}
