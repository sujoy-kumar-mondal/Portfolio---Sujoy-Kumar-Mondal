import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { sessionEmitter } from '@/lib/sessionEvents';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  const currentToken = (session.user as { sessionToken?: string }).sessionToken;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (err) {
          console.error('Error sending SSE event:', err);
        }
      };

      const listener = (eventData: { userId: string; newSessionToken: string }) => {
        if (eventData.userId === userId && eventData.newSessionToken !== currentToken) {
          sendEvent({
            invalidated: true,
            reason: 'Session invalidated by login on another device',
          });
        }
      };

      sessionEmitter.on('session-updated', listener);

      // Heartbeat ping every 15s to keep SSE connection alive
      const pingInterval = setInterval(() => {
        sendEvent({ type: 'ping' });
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        sessionEmitter.off('session-updated', listener);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
