'use client';
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
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-[#111] border-r border-white/10 flex flex-col flex-shrink-0">
      <SessionGuard />
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" target="_blank" className="flex items-center gap-3">
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

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
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
        <Link href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
          <span>🌐</span> View Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
