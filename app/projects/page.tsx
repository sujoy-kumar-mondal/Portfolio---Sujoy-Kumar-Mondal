'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IDescriptionPart } from '@/models/Project';

function RenderDescription({ parts, plainText = false }: { parts: IDescriptionPart[]; plainText?: boolean }) {
  if (!parts || !Array.isArray(parts)) return null;
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (!part.url || plainText) {
          return <span key={i}>{part.text}</span>;
        }

        const prevPart = i > 0 ? parts[i - 1] : null;
        const nextPart = i < parts.length - 1 ? parts[i + 1] : null;

        let prefixSpace = '';
        let suffixSpace = '';

        if (prevPart && prevPart.text && !/\s$/.test(prevPart.text) && !/^\s/.test(part.text)) {
          prefixSpace = ' ';
        }

        if (nextPart && nextPart.text && !/^\s|[.,!?:;)]/.test(nextPart.text) && !/\s$/.test(part.text)) {
          suffixSpace = ' ';
        }

        return (
          <span key={i}>
            {prefixSpace}
            <a
              href={part.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {part.text}
            </a>
            {suffixSpace}
          </span>
        );
      })}
    </span>
  );
}

function getDisplayDate(date?: string): string {
  if (date && date.trim()) return ` • ${date.trim()}`;
  return '';
}

interface Project {
  _id: string;
  name: string;
  slug: string;
  category: string;
  date?: string;
  createdAt?: string | Date;
  shortDescription: IDescriptionPart[];
  mainImage: string;
  projectUrl: string;
  tags: string[];
  accentColor: string;
}

const ITEMS_PER_PAGE = 6;

export default function AllProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(ITEMS_PER_PAGE), page: String(page) });
    if (selectedTag) params.set('tag', selectedTag);
    fetch(`/api/projects?${params}`)
      .then(r => r.json())
      .then(data => {
        setProjects(data.projects || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      });
  }, [page, selectedTag]);

  // Collect all unique tags from all projects
  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => {
        const tags = new Set<string>();
        (data.projects || []).forEach((p: Project) => p.tags.forEach((t: string) => tags.add(t)));
        setAllTags(Array.from(tags));
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#111]/90 backdrop-blur-sm border-b border-white/10 px-4 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:text-cyan-400 transition-colors">
              <svg width="20" viewBox="0 0 224 473" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M75 429L1 472V322L75 281V429Z" fill="white" />
                <path d="M152 322V386L223 344V281L75 196V126L152 171V238.715L223 196V126L1 1V236L152 322Z" fill="white" />
              </svg>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text">
              All Projects
            </h1>
            <span className="text-gray-500 text-sm">({total} total)</span>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedTag(''); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${!selectedTag ? 'bg-gradient-to-r from-pink-500 to-orange-500 border-transparent text-white' : 'border-white/20 text-gray-400 hover:border-white/50'}`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => { setSelectedTag(tag); setPage(1); }}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${selectedTag === tag ? 'bg-gradient-to-r from-pink-500 to-orange-500 border-transparent text-white' : 'border-white/20 text-gray-400 hover:border-white/50'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Project Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white/5 animate-pulse h-64" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No projects found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {projects.map(project => (
              <Link key={project._id} href={`/projects/${project.slug}`} className="group flex flex-col h-full">
                <div className="rounded-xl border border-white/10 overflow-hidden hover:border-white/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] bg-[#1a1a1a] flex flex-col h-full justify-between">
                  <div>
                    {project.mainImage ? (
                      <div className="w-full h-48 sm:h-52 bg-[#0d0d0d] p-2 flex items-center justify-center overflow-hidden border-b border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.mainImage}
                          alt={project.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 sm:h-52 flex items-center justify-center bg-gradient-to-br from-[#1f2667] to-[#0a0094]">
                        <span className="text-white/20 text-5xl font-bold">{project.name[0]}</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-lg truncate block" style={{ color: project.accentColor || '#5292ff' }}>
                        {project.name}
                      </h3>
                      <span className="text-xs font-medium block mt-0.5" style={{ color: (project.accentColor || '#5292ff') + 'aa' }}>
                        ({project.category}){getDisplayDate(project.date)}
                      </span>
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                        <RenderDescription parts={project.shortDescription} plainText={true} />
                      </p>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 5).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 rounded border border-[#757575] text-xs text-gray-400">{tag}</span>
                      ))}
                      {project.tags.length > 5 && (
                        <span className="px-1.5 py-0.5 rounded border border-[#757575] text-xs text-gray-500">+{project.tags.length - 5}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded border border-white/20 text-sm disabled:opacity-30 hover:border-white/50 transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded border text-sm transition-colors ${p === page ? 'bg-gradient-to-r from-pink-500 to-orange-500 border-transparent text-white font-bold' : 'border-white/20 text-gray-400 hover:border-white/50'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded border border-white/20 text-sm disabled:opacity-30 hover:border-white/50 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
