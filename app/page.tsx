import Header from '@/components/public/Header';
import SpiderCanvas from '@/components/public/SpiderCanvas';
import AboutModal from '@/components/public/AboutModal';
import ProjectCard from '@/components/public/ProjectCard';
import GetInTouch from '@/components/public/GetInTouch';
import LetsMeet from '@/components/public/LetsMeet';
import CustomCursor from '@/components/public/CustomCursor';
import SocialLinks from '@/components/public/SocialLinks';
import LatestWorksButton from '@/components/public/LatestWorksButton';
import ScrollToTopButton from '@/components/public/ScrollToTopButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProfile() {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/profile`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function getSocialLinks() {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/social`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function getLatestProjects() {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/projects?limit=5`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.projects || [];
  } catch { return []; }
}

async function getContactInfo() {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/contact`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function HomePage() {
  const [profile, socialLinks, projects, contactInfo] = await Promise.all([
    getProfile(),
    getSocialLinks(),
    getLatestProjects(),
    getContactInfo(),
  ]);

  const phoneSocial = socialLinks.find((s: { platform: string; url: string }) => s.platform?.toLowerCase().includes('phone') || s.platform?.toLowerCase().includes('call'));
  const waSocial = socialLinks.find((s: { platform: string; url: string }) => s.platform?.toLowerCase().includes('whatsapp'));

  const phoneVal = phoneSocial?.url || contactInfo?.phone;
  const whatsappVal = waSocial?.url || contactInfo?.whatsapp || contactInfo?.phone;

  return (
    <>
      <CustomCursor cursorUrl={profile?.cursorUrl} />

      {/* ─── HERO SECTION ─── */}
      <section id="section-1" className="flex flex-col justify-between min-h-screen pb-10 xl:pb-0 relative overflow-hidden">
        <SpiderCanvas />
        <div className="relative z-10">
          <Header phone={phoneVal} whatsapp={whatsappVal} links={socialLinks} />
        </div>

        {/* Main hero content */}
        <div className="pointer-events-none flex relative w-full max-w-screen-2xl mx-auto z-10 px-4">
          <div className="w-full">
            {/* Big S logo */}
            <svg
              className="drop-shadow-[0_0px_60px_rgba(59,130,246,0.8)] absolute h-[380px] top-1/2 xl:-top-8 -translate-y-1/2 xl:-translate-y-0 left-1/2 xl:left-2/3 -translate-x-1/2 xl:-translate-x-1/2 xl:rotate-[29deg] xl:mt-12 sm:h-[500px] xl:h-[520px] opacity-90"
              viewBox="0 0 224 473" fill="none" xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.5 327.5V457L66.5 424V295.5L9.5 327.5Z" fill="url(#p0)" />
              <path d="M214.5 339L160.5 371V317L9.5 232V15.5L214.5 130.5V191L160.5 223.5V166L66.5 111V201L214.5 286V339Z" fill="url(#p1)" />
              <path d="M9.5 327.5V457L66.5 424V295.5L9.5 327.5Z" stroke="url(#p2)" strokeWidth="18" />
              <path d="M214.5 339L160.5 371V317L9.5 232V15.5L214.5 130.5V191L160.5 223.5V166L66.5 111V201L214.5 286V339Z" stroke="url(#p3)" strokeWidth="18" />
              <defs>
                <linearGradient id="p0" x1="112" y1="15.5" x2="112" y2="457" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00FFE1" /><stop offset="1" stopColor="#03A2DC" />
                </linearGradient>
                <linearGradient id="p1" x1="112" y1="15.5" x2="112" y2="457" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00FFE1" /><stop offset="1" stopColor="#03A2DC" />
                </linearGradient>
                <linearGradient id="p2" x1="112" y1="15.5" x2="112" y2="457" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#53ACFF" /><stop offset="1" stopColor="#0A0094" />
                </linearGradient>
                <linearGradient id="p3" x1="112" y1="15.5" x2="112" y2="457" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#53ACFF" /><stop offset="1" stopColor="#0A0094" />
                </linearGradient>
              </defs>
            </svg>

            <div className="relative ml-6 sm:ml-14 xl:ml-48">
              <h1 className="font-bold text-2xl sm:text-5xl xl:text-6xl tracking-wide" style={{ fontFamily: 'var(--font-nunito)' }}>
                {profile?.name || 'Sujoy Kr. Mondal'}
              </h1>
              <p className="italic text-xs sm:text-xl mb-4 mt-1 sm:mb-6 sm:mt-3 text-gray-300">
                {profile?.intro || 'I am a Web Developer'}
              </p>
              <div className="pointer-events-auto">
                <AboutModal profile={profile || { name: 'Sujoy Kumar Mondal', about: '', photoUrl: '', cvUrl: '', skills: [] }} />
              </div>
            </div>
          </div>

          {/* Social links sidebar */}
          <SocialLinks links={socialLinks} />
        </div>

        {/* Scroll down button */}
        <div className="relative self-center z-10 mb-4">
          <div className="absolute h-5 sm:h-7 w-[2px] bg-[#444] left-1/2 -translate-x-1/2 bottom-0" />
          <LatestWorksButton />
        </div>
      </section>

      <hr className="max-w-screen-2xl mx-auto border-white/20" />

      {/* ─── LATEST WORKS SECTION ─── */}
      <section id="section-2" className="relative max-w-screen-2xl mx-auto py-4">
        <div className="inline-block relative z-10 bg-[#111] xl:border-b-2 xl:border-l-2 xl:border-r-2 border-white/30 rounded w-[270px] left-1/2 -translate-x-1/2 text-center py-1">
          <h2 className="text-2xl xl:text-[40px] font-bold bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text">
            Latest Works
          </h2>
        </div>

        {/* Vertical connector line */}
        <div className="hidden xl:block absolute z-0 bg-slate-300 w-[2px] top-[76px] bottom-[34px] left-1/2 -translate-x-1/2" />

        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No projects yet. Add some from the admin panel.</div>
        ) : (
          projects.map((project: Parameters<typeof ProjectCard>[0]['project'], i: number) => (
            <ProjectCard key={project._id} project={project} reverse={i % 2 !== 0} />
          ))
        )}

        {/* See More */}
        <div className="inline-block relative z-10 bg-[#111] xl:border-t-2 xl:border-l-2 xl:border-r-2 border-white/30 py-2 px-4 rounded left-1/2 -translate-x-1/2 mt-4">
          <Link href="/projects">
            <button className="relative left-1/2 -translate-x-1/2 bg-gradient-to-l from-[#1295b6] to-[#1f2667e6] hover:from-pink-500 hover:to-orange-500 text-xs sm:text-base py-1 px-3 sm:py-2 sm:px-4 rounded font-extrabold hover:scale-110 ease-in-out duration-100 text-white">
              Show More
            </button>
          </Link>
        </div>
      </section>

      <hr className="max-w-screen-2xl mx-auto border-white/20" />

      {/* ─── CONTACT SECTION ─── */}
      <section id="contact-section" className="relative flex flex-col xl:flex-row max-w-screen-2xl mx-auto items-center xl:items-start justify-center gap-8 xl:gap-20 py-10 px-4">
        <GetInTouch title={contactInfo?.getInTouchTitle} />
        {contactInfo && <LetsMeet info={contactInfo} />}
      </section>

      <hr className="max-w-screen-2xl mx-auto border-white/20" />

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#111] py-4 text-center text-sm text-gray-500">
        <p>Copyright © {new Date().getFullYear()} — {profile?.name || 'Sujoy Kumar Mondal'}. All rights reserved<Link href="/admin/login" className="hover:text-gray-400 cursor-default select-none">.</Link></p>
      </footer>

      {/* Scroll to top */}
      <ScrollToTopButton />
    </>
  );
}
