'use client';
import Link from 'next/link';
import { IDescriptionPart } from '@/models/Project';

function RenderDescription({ parts }: { parts: IDescriptionPart[] }) {
  return (
    <>
      {parts.map((part, i) =>
        part.url ? (
          <a key={i} href={part.url} target="_blank" rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline">
            {part.text}
          </a>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  );
}

function getDisplayDate(date?: string): string {
  if (date && date.trim()) return ` • ${date.trim()}`;
  return '';
}

interface ProjectCardProps {
  project: {
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
  };
  reverse?: boolean;
}

export default function ProjectCard({ project, reverse = false }: ProjectCardProps) {
  const color = project.accentColor || '#5292ff';

  return (
    <div className={`border-dashed border-y-2 xl:border-none w-full h-auto xl:h-[335px] relative xl:z-10 py-6 xl:py-0 ${reverse ? 'flex-row-reverse' : ''}`}>
      <div className={`w-full xl:w-1/2 ${reverse ? 'xl:float-right' : 'xl:float-left'} h-auto xl:h-[335px]`}>
        {!reverse && (
          <div className="hidden xl:block h-[2px] w-60 bg-slate-300 absolute top-1/2 -translate-y-1/2 right-1/2" />
        )}
        {reverse && (
          <div className="hidden xl:block h-[2px] w-60 bg-slate-300 absolute top-1/2 -translate-y-1/2 left-1/2" />
        )}
        <div className="w-[340px] sm:w-[380px] relative left-1/2 -translate-x-1/2 top-1 xl:top-1/2 xl:-translate-y-1/2 group drop-shadow-[0_0px_60px_rgba(59,130,246,0.8)]">
          {/* Tooltip (Fixed at bottom on <1280px, behind image & slides up on hover on >=1280px) */}
          <a href={project.projectUrl || '#'} target="_blank" rel="noopener noreferrer">
            <span
              className="absolute flex flex-row w-max px-4 py-1.5 gap-2 items-center rounded-lg -bottom-10 xl:bottom-auto xl:top-2 left-1/2 -translate-x-1/2 xl:group-hover:-top-12 transition-all xl:duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] text-white text-sm z-20 xl:z-0 shadow-lg pointer-events-auto"
              style={{ backgroundColor: color }}
            >
              {project.name}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              {/* Pointer Arrow Tail (shown only on xl screens) */}
              <span
                className="hidden xl:block absolute rotate-45 w-3 h-3 -bottom-1 left-1/2 -translate-x-1/2 -z-10"
                style={{ backgroundColor: color }}
              />
            </span>
          </a>

          {/* Laptop Main Image */}
          <Link href={`/projects/${project.slug}`} className="relative z-10 block">
            {project.mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="w-full hover:scale-[1.03] ease-in-out duration-200 rounded object-cover relative z-10 bg-transparent"
                src={project.mainImage}
                alt={project.name}
              />
            ) : (
              <div className="w-full h-[200px] rounded flex items-center justify-center bg-gradient-to-br from-[#1f2667] to-[#0a0094] relative z-10">
                <span className="text-white/40 text-sm">No Image</span>
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Center arrow */}
      <Link
        className={`hidden xl:block absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 ${reverse ? '-rotate-90' : ''}`}
        href={`/projects/${project.slug}`}
      >
        <svg
          className="hover:scale-125 ease-in-out duration-200 w-8 bg-black rounded-full"
          xmlns="http://www.w3.org/2000/svg"
          fill={color}
          viewBox="0 0 16 16"
        >
          <path d="M0 8a8 8 0 1 0 16 0A8 8 0 0 0 0 8m5.904 2.803a.5.5 0 1 1-.707-.707L9.293 6H6.525a.5.5 0 1 1 0-1H10.5a.5.5 0 0 1 .5.5v3.975a.5.5 0 0 1-1 0V6.707z" />
        </svg>
      </Link>

      {/* Text Side (Removed large mt-[265px] gap on mobile/tablet) */}
      <div className={`w-full xl:w-1/2 ${reverse ? 'xl:float-left' : 'xl:float-right'} h-auto xl:h-[335px] mt-14 xl:mt-0`}>
        <div className="mx-2 xl:mx-8 my-2 xl:my-8">
          {/* Hyperlinked Project Name */}
          <Link href={`/projects/${project.slug}`} className="hover:underline block">
            <h3 className="text-3xl xl:text-4xl font-bold ml-4 truncate" style={{ color }}>
              {project.name}
            </h3>
          </Link>
          <span className="font-bold ml-4 text-sm block mt-0.5" style={{ color: color + 'aa' }}>
            ({project.category}){getDisplayDate(project.date)}
          </span>
          <p className="ml-4 mt-2 text-sm xl:text-base text-gray-300 line-clamp-3">
            <RenderDescription parts={project.shortDescription} />
          </p>
          <ul className="flex flex-wrap max-w-sm xl:max-w-md p-3 gap-1">
            {project.tags.slice(0, 12).map((tag) => (
              <li key={tag} className="px-2 py-0.5 rounded border border-[#757575] text-xs text-gray-300">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
