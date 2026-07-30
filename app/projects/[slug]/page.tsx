import { notFound } from 'next/navigation';
import Link from 'next/link';
import { IDescriptionPart } from '@/models/Project';
import ProjectGalleryGrid from '@/components/public/ProjectGalleryGrid';

function getDisplayDate(date?: string): string {
  if (date && date.trim()) return ` • ${date.trim()}`;
  return '';
}

function getVisitLabel(category?: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('youtube') || cat.includes('channel') || cat.includes('video')) return 'Visit Channel';
  if (cat.includes('app') || cat.includes('application')) return 'Visit App';
  if (cat.includes('site') || cat.includes('website') || cat.includes('portfolio')) return 'Visit Site';
  return 'Visit Link';
}

function RenderDescription({ parts }: { parts: IDescriptionPart[] }) {
  if (!parts || parts.length === 0) return null;
  return (
    <>
      {parts.map((part, i) =>
        part.url ? (
          <a key={i} href={part.url} target="_blank" rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline">{part.text}</a>
        ) : <span key={i}>{part.text}</span>
      )}
    </>
  );
}

async function getProject(slug: string) {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/projects/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: 'Project Not Found' };
  return {
    title: `${project.name} — SKM Portfolio`,
    description: project.shortDescription?.map((p: IDescriptionPart) => p.text).join('') || '',
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) return notFound();

  const color = project.accentColor || '#5292ff';

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-[#111]/90 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="max-w-screen-xl mx-auto flex items-center gap-4">
          <Link href="/">
            <svg width="20" viewBox="0 0 224 473" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M75 429L1 472V322L75 281V429Z" fill="white" />
              <path d="M152 322V386L223 344V281L75 196V126L152 171V238.715L223 196V126L1 1V236L152 322Z" fill="white" />
            </svg>
          </Link>
          <Link href="/projects" className="text-sm text-gray-400 hover:text-white transition-colors">← All Projects</Link>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8 sm:py-12">
        {/* Main Banner Image (Clickable for Lightbox Modal) */}
        <ProjectGalleryGrid
          mainImage={project.mainImage}
          galleryImages={project.images}
          projectName={project.name}
          accentColor={color}
          onlyBanner={true}
        />

        {/* Project Name + Link */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
          <h1 className="text-3xl sm:text-5xl font-bold" style={{ color }}>
            {project.name}
          </h1>
          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold hover:scale-105 transition-transform w-fit"
              style={{ borderColor: color, color }}
            >
              {getVisitLabel(project.category)}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>

        {/* Category & Date */}
        <p className="text-base font-semibold mb-6" style={{ color: color + 'bb' }}>
          ({project.category}){getDisplayDate(project.date)}
        </p>

        {/* Short Description */}
        {project.shortDescription?.length > 0 && (
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-6">
            <RenderDescription parts={project.shortDescription} />
          </p>
        )}

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {project.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 rounded-full border border-white/20 text-xs text-gray-300">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Full Description + How it Works + Gallery Section */}
          <div className="lg:col-span-2 space-y-8">
            {project.description?.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-3 text-white border-b border-white/10 pb-2">About {project.name}</h2>
                <p className="text-gray-300 leading-relaxed">
                  <RenderDescription parts={project.description} />
                </p>
              </section>
            )}

            {/* Working Principle */}
            {project.workingPrinciple && (
              <section>
                <h2 className="text-xl font-bold mb-3 text-white border-b border-white/10 pb-2">How it Works</h2>
                <p className="text-gray-300 leading-relaxed">{project.workingPrinciple}</p>
              </section>
            )}

            {/* Gallery Section Grid (Positioned in Left Column directly below How it Works) */}
            <ProjectGalleryGrid
              mainImage={project.mainImage}
              galleryImages={project.images}
              projectName={project.name}
              accentColor={color}
              onlyGrid={true}
            />
          </div>

          {/* Right: Features Sidebar */}
          {project.features?.length > 0 && (
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-white/10 p-6 bg-[#1a1a1a]">
                <h2 className="text-lg font-bold mb-4" style={{ color }}>Key Features</h2>
                <ul className="space-y-3">
                  {project.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                      <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ backgroundColor: color }}>
                        {i + 1}
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-white/10 py-6 text-center text-sm text-gray-600 mt-10">
        <Link href="/projects" className="hover:text-white transition-colors">← Back to All Projects</Link>
      </footer>
    </div>
  );
}
