import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/Sidebar';
import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import SocialLink from '@/models/SocialLink';

async function getStats() {
  try {
    await connectDB();
    const [projectCount, socialCount] = await Promise.all([
      Project.countDocuments(),
      SocialLink.countDocuments(),
    ]);
    return { projectCount, socialCount };
  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
    return { projectCount: 0, socialCount: 0 };
  }
}

const cards = [
  { label: 'Edit Profile', desc: 'Name, intro, photo, CV, cursor, skills', href: '/admin/profile', icon: '👤', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20' },
  { label: 'Social Links', desc: 'Add, edit, reorder or remove social links', href: '/admin/social', icon: '🔗', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/20' },
  { label: 'Projects', desc: 'Add new projects or edit existing ones', href: '/admin/projects', icon: '💼', color: 'from-orange-500/20 to-yellow-500/20 border-orange-500/20' },
  { label: 'Contact Info', desc: 'Update contact form & Let\'s Meet section', href: '/admin/contact', icon: '📬', color: 'from-green-500/20 to-emerald-500/20 border-green-500/20' },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/admin/login');
  const { projectCount, socialCount } = await getStats();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0a]">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Welcome back! 👋</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your portfolio from here. All changes reflect instantly.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#111] border border-white/10 rounded-xl p-5">
              <p className="text-3xl font-bold text-white">{projectCount}</p>
              <p className="text-gray-500 text-sm mt-1">Projects</p>
            </div>
            <div className="bg-[#111] border border-white/10 rounded-xl p-5">
              <p className="text-3xl font-bold text-white">{socialCount}</p>
              <p className="text-gray-500 text-sm mt-1">Social Links</p>
            </div>
          </div>

          {/* Quick Actions */}
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map(card => (
              <Link key={card.href} href={card.href}>
                <div className={`bg-gradient-to-br ${card.color} border rounded-xl p-5 hover:scale-[1.02] transition-transform duration-150 cursor-pointer`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{card.icon}</span>
                    <h3 className="font-semibold text-white">{card.label}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">{card.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* View Site CTA */}
          <div className="mt-8 p-5 bg-gradient-to-r from-pink-500/10 to-orange-500/10 border border-pink-500/20 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Your portfolio is live</p>
              <p className="text-gray-500 text-sm">All changes are reflected immediately</p>
            </div>
            <Link href="/" target="_blank">
              <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg text-sm font-semibold hover:scale-105 transition-transform text-white">
                View Site →
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
