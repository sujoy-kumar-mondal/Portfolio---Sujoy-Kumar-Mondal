'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface CustomCursorProps {
  cursorUrl?: string;
}

export default function CustomCursor({ cursorUrl: initialUrl }: CustomCursorProps) {
  const pathname = usePathname();
  const [cursorUrl, setCursorUrl] = useState<string | undefined>(initialUrl);

  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return;
    if (initialUrl) {
      setCursorUrl(initialUrl);
      return;
    }
    fetch('/api/metadata')
      .then((r) => r.json())
      .then((data) => {
        if (data?.cursorUrl) setCursorUrl(data.cursorUrl);
      })
      .catch(() => {});
  }, [initialUrl, isAdmin]);

  useEffect(() => {
    if (isAdmin || !cursorUrl) {
      const existing = document.getElementById('custom-cursor-style');
      if (existing) existing.remove();
      return;
    }

    const existing = document.getElementById('custom-cursor-style');
    if (existing) existing.remove();

    const style = document.createElement('style');
    style.innerHTML = `* { cursor: url('${cursorUrl}') 0 0, auto !important; }`;
    style.id = 'custom-cursor-style';
    document.head.appendChild(style);

    return () => {
      const el = document.getElementById('custom-cursor-style');
      if (el) el.remove();
    };
  }, [cursorUrl, isAdmin]);

  return null;
}

