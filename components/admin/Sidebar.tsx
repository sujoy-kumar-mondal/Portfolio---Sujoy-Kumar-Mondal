'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import SessionGuard from './SessionGuard';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '🏠' },
  { label: 'Profile', href: '/admin/profile', icon: '👤' },
  { label: 'Social Links', href: '/admin/social', icon: '🔗' },
  { label: 'Projects', href: '/admin/projects', icon: '💼' },
  { label: 'Contact', href: '/admin/contact', icon: '📬' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <SessionGuard />

      {/* Mobile Top Navigation Header */}
      <div className="md:hidden bg-[#111] border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40 w-full">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <svg width="20" viewBox="0 0 224 473" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M75 429L1 472V322L75 281V429Z" fill="url(#sg0m)" />
            <path d="M152 322V386L223 344V281L75 196V126L152 171V238.715L223 196V126L1 1V236L152 322Z" fill="url(#sg1m)" />
            <defs>
              <linearGradient id="sg0m" x1="112" y1="0" x2="112" y2="473" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00FFE1" /><stop offset="1" stopColor="#03A2DC" />
              </linearGradient>
              <linearGradient id="sg1m" x1="112" y1="0" x2="112" y2="473" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00FFE1" /><stop offset="1" stopColor="#03A2DC" />
              </linearGradient>
            </defs>
          </svg>
          <div>
            <p className="text-xs font-bold text-white leading-none">SKM Portfolio</p>
            <p className="text-[9px] text-gray-500 mt-0.5 leading-none">Admin Panel</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/" target="_blank" className="p-2 rounded-lg bg-white/5 text-gray-300 hover:text-white text-xs flex items-center gap-1">
            🌐 <span className="hidden sm:inline">View Site</span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar (Desktop: Fixed Sticky Sidebar, Mobile: Sliding Drawer) */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 bottom-0 z-50
          w-64 md:w-60 h-full md:min-h-screen bg-[#111] border-r border-white/10 flex flex-col flex-shrink-0
          transition-transform duration-200 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Desktop Logo Header */}
        <div className="p-6 border-b border-white/10 hidden md:flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <svg width="22" viewBox="0 0 224 473" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M75 429L1 472V322L75 281V429Z" fill="url(#sg0)" />
              <path d="M152 322V386L223 344V281L75 196V126L152 171V238.715L223 196V126L1 1V236L152 322Z" fill="url(#sg1)" />
              <defs>
                <linearGradient id="sg0" x1="112" y1="0" x2="112" y2="473" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00FFE1" /><stop offset="1" stopColor="#03A2DC" />
                </linearGradient>
                <linearGradient id="sg1" x1="112" y1="0" x2="112" y2="473" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00FFE1" /><stop offset="1" stopColor="#03A2DC" />
                </linearGradient>
              </defs>
            </svg>
            <div>
              <p className="text-xs font-bold text-white">SKM Portfolio</p>
              <p className="text-[10px] text-gray-500">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Mobile Header Inside Drawer */}
        <div className="p-4 border-b border-white/10 flex md:hidden items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="20" viewBox="0 0 224 473" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M75 429L1 472V322L75 281V429Z" fill="url(#sg0d)" />
              <path d="M152 322V386L223 344V281L75 196V126L152 171V238.715L223 196V126L1 1V236L152 322Z" fill="url(#sg1d)" />
              <defs>
                <linearGradient id="sg0d" x1="112" y1="0" x2="112" y2="473" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00FFE1" /><stop offset="1" stopColor="#03A2DC" />
                </linearGradient>
                <linearGradient id="sg1d" x1="112" y1="0" x2="112" y2="473" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00FFE1" /><stop offset="1" stopColor="#03A2DC" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-bold text-white text-sm">Navigation Menu</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-gradient-to-r from-pink-500/20 to-orange-500/20 text-white border border-pink-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <span>🌐</span> View Site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
