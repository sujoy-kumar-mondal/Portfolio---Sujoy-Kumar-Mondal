'use client';
import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function SessionGuard() {
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    const checkSessionFallback = async () => {
      try {
        const res = await fetch('/api/admin/check-session', { cache: 'no-store' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.invalidated) {
            console.warn('Fallback check: Session invalidated by login on another device. Signing out...');
            signOut({ callbackUrl: '/admin/login' });
          }
        }
      } catch (e) {
        console.error('Session fallback check failed:', e);
      }
    };

    // 1. Establish Real-Time SSE Listener
    try {
      eventSource = new EventSource('/api/admin/session-events');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.invalidated) {
            console.warn('Real-time SSE: Session invalidated on another device. Signing out...');
            if (eventSource) eventSource.close();
            signOut({ callbackUrl: '/admin/login' });
          }
        } catch (e) {
          console.error('Error parsing SSE message:', e);
        }
      };

      eventSource.onerror = () => {
        // SSE disconnected (e.g. laptop went to sleep or network drop)
        // Fallback polling will handle checking session state on reconnect
      };
    } catch (e) {
      console.error('Failed to initialize SSE EventSource:', e);
    }

    // 2. Fallback Polling (Every 5 seconds) & Window Focus Event for sleep/wake recovery
    fallbackInterval = setInterval(checkSessionFallback, 5000);
    const onFocus = () => checkSessionFallback();
    window.addEventListener('focus', onFocus);

    return () => {
      if (eventSource) eventSource.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return null;
}
