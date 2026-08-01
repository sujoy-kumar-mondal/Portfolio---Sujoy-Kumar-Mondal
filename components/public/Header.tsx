'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface HeaderSocialLink {
  _id?: string;
  platform: string;
  url: string;
  svgPath: string;
  hoverColor: string;
  position?: 'top' | 'right';
  isActive?: boolean;
}

interface HeaderProps {
  links?: HeaderSocialLink[];
  logoUrl?: string;
  showDateTime?: boolean;
}

function formatDateTime(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();

  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  const formattedHours = pad(hours);
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return `${day}-${month}-${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
}

export default function Header({ links, logoUrl, showDateTime = true }: HeaderProps) {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'light') {
      setDarkMode(false);
      document.documentElement.classList.add('light');
    } else {
      setDarkMode(true);
      document.documentElement.classList.remove('light');
    }

    // Secret shortcut: Ctrl + Shift + A to open Admin Login
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        router.push('/admin/login');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // Live Internet Clock Sync
  useEffect(() => {
    let offset = 0;

    const syncTime = async () => {
      try {
        const res = await fetch('/api/time');
        if (res.ok) {
          const data = await res.json();
          if (data?.timestamp) {
            offset = data.timestamp - Date.now();
          }
        }
      } catch {
        offset = 0;
      }
    };

    syncTime();

    const timer = setInterval(() => {
      const now = new Date(Date.now() + offset);
      setTimeStr(formatDateTime(now));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (!nextMode) {
      document.documentElement.classList.add('light');
      localStorage.setItem('portfolio-theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('portfolio-theme', 'dark');
    }
  };

  // Secret 3-Click on Header Logo opens Admin Login
  const handleLogoClick = (e: React.MouseEvent) => {
    const nextCount = clickCount + 1;
    if (nextCount >= 3) {
      e.preventDefault();
      router.push('/admin/login');
      setClickCount(0);
    } else {
      setClickCount(nextCount);
      setTimeout(() => setClickCount(0), 1200);
    }
  };

  const topSocials = links
    ? links
      .filter(l => l.isActive !== false && (l.position === 'top'))
      .sort((a, b) => ((a as { order?: number }).order ?? 0) - ((b as { order?: number }).order ?? 0))
    : [];

  return (
    <header className="h-20 bg-white/10 backdrop-blur-sm z-50 rounded pointer-events-none flex items-center justify-between w-full px-4 max-w-screen-2xl mx-auto sticky top-0 transition-colors">
      <Link className="pointer-events-auto" href="/" onClick={handleLogoClick}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Website Logo" className="h-9 w-auto max-w-[160px] object-contain hover:scale-105 transition-transform" />
        ) : (
          <svg width="25" viewBox="0 0 224 473" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M75 429L1 472V322L75 281V429Z" fill="white" />
            <path d="M152 322V386L223 344V281L75 196V126L152 171V238.715L223 196V126L1 1V236L152 322Z" fill="white" />
            <path d="M75 429L1 472V322L75 281V429Z" stroke="white" />
            <path d="M152 322V386L223 344V281L75 196V126L152 171V238.715L223 196V126L1 1V236L152 322Z" stroke="white" />
          </svg>
        )}
      </Link>
      <div className="flex flex-col items-end justify-center pointer-events-auto gap-0.5">
        {/* Live Internet Date & Time (Positioned Above Social Links) */}
        {mounted && showDateTime && timeStr && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-md font-mono text-[10px] sm:text-[11px] text-gray-300 tracking-wider shadow-sm select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live Time Sync" />
            <span className="font-semibold text-gray-200">{timeStr}</span>
          </div>
        )}

        {/* Social Links & Theme Toggle Row */}
        <div className="flex gap-4 sm:gap-5 items-center mt-0.5">
          {/* Dynamic Top Social Links (Navbar) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {topSocials.map(link => (
              <a
                key={link._id || link.platform}
                className="pointer-events-auto transition-all duration-200 hover:scale-130 hover:drop-shadow-[0px_0px_10px_rgba(255,255,255,0.8)] flex items-center justify-center text-[#b0b2c3]"
                href={link.url}
                target={link.url.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                title={link.platform}
                style={{ color: '#b0b2c3' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = link.hoverColor || '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#b0b2c3')}
                dangerouslySetInnerHTML={{ __html: link.svgPath }}
              />
            ))}
          </div>

          {/* Theme Toggle Button */}
          {mounted && (
            <button
              className="pointer-events-auto p-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 hover:scale-120 transition-all duration-200">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800 hover:scale-120 transition-all duration-200">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
