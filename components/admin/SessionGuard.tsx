'use client';
import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function SessionGuard() {
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;
    let isMounted = true;
    const controller = new AbortController();

    const checkSessionFallback = async () => {
      if (!isMounted) return;
      try {
        const res = await fetch('/api/admin/check-session', {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!isMounted) return;
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.invalidated) {
            console.warn('Fallback check: Session invalidated by login on another device. Signing out...');
            signOut({ callbackUrl: '/admin/login' });
          }
        }
      } catch (e: unknown) {
        if (!isMounted) return;
        const msg = e instanceof Error ? e.message : String(e);
        // Ignore expected network aborts or temporary fetch interruptions during page transitions
        if (msg.includes('aborted') || msg.includes('Failed to fetch') || (e as Error)?.name === 'AbortError') {
          return;
        }
        console.error(`Session fallback check error: ${msg}`);
      }
    };

    // 1. Establish Real-Time SSE Listener
    try {
      eventSource = new EventSource('/api/admin/session-events');

      eventSource.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          if (data.invalidated) {
            console.warn('Real-time SSE: Session invalidated on another device. Signing out...');
            if (eventSource) eventSource.close();
            signOut({ callbackUrl: '/admin/login' });
          }
        } catch {}
      };

      eventSource.onerror = () => {
        // EventSource automatically retries connection when interrupted.
        // Quietly close if unmounted.
        if (!isMounted && eventSource) {
          eventSource.close();
        }
      };
    } catch {}

    // 2. Fallback Polling (Every 10 seconds) & Window Focus Event for sleep/wake recovery
    fallbackInterval = setInterval(checkSessionFallback, 10000);
    const onFocus = () => checkSessionFallback();
    window.addEventListener('focus', onFocus);

    return () => {
      isMounted = false;
      controller.abort();
      if (eventSource) eventSource.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return null;
}
