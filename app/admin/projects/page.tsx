'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/admin/Sidebar';

interface ProjectItem {
  _id: string;
  name: string;
  slug: string;
  category: string;
  date?: string;
  mainImage?: string;
  accentColor?: string;
  isActive: boolean;
  tags?: string[];
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.error('Failed to fetch projects', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/projects/${deletingId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p._id !== deletingId));
        setDeletingId(null);
      } else {
        alert('Failed to delete project');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting project');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Projects</h1>
              <p className="text-gray-500 text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
            </div>
            <Link href="/admin/projects/new">
              <button className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-sm font-semibold hover:scale-105 transition-transform text-white">
                + New Project
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-white/5 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <p className="text-4xl mb-4">💼</p>
              <p>No projects yet. Add your first project!</p>
              <Link href="/admin/projects/new">
                <button className="mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-sm font-semibold text-white">
                  + Add First Project
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p._id} className={`bg-[#111] border rounded-xl p-4 flex items-center gap-4 ${p.isActive ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
                  {p.mainImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.mainImage} alt={p.name} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-[#1f2667] to-[#0a0094] flex items-center justify-center flex-shrink-0">
                      <span className="text-white/30 text-lg font-bold">{p.name[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate" style={{ color: p.accentColor || '#5292ff' }}>
                      {p.name}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {p.category}{p.date ? ` • ${p.date}` : ''} • {p.tags?.slice(0, 3).join(', ')}{p.tags?.length && p.tags.length > 3 ? '...' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${p.isActive ? 'border-green-500/30 text-green-400' : 'border-white/10 text-gray-600'}`}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                    <Link href={`/projects/${p.slug}`} target="_blank" className="text-xs px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded transition-colors">
                      View
                    </Link>
                    <Link href={`/admin/projects/${p._id}/edit`} className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors">
                      Edit
                    </Link>
                    <button
                      onClick={() => { setDeletingId(p._id); setDeletingName(p.name); }}
                      className="text-xs px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deletingId && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-2">Delete Project?</h3>
              <p className="text-gray-300 text-sm mb-6">
                Are you sure you want to delete <span className="font-semibold text-pink-400">&quot;{deletingName}&quot;</span>? All associated images will be deleted from Cloudinary storage. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeletingId(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
