'use client';

interface SocialLink {
  _id: string;
  platform: string;
  url: string;
  svgPath: string;
  hoverColor: string;
}

export default function SocialLinks({ links }: { links: SocialLink[] }) {
  if (!links || links.length === 0) return null;

  return (
    <ul className="pointer-events-auto mr-4 sm:mr-8 space-y-4 text-[#b0b2c3] absolute right-0 top-1/2 -translate-y-1/2 z-10">
      {links.map((link) => (
        <li key={link._id} className="transition-all duration-200" title={link.platform}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:drop-shadow-[0px_0px_10px_rgba(255,255,255,0.8)] transition-all duration-200"
            style={{ color: '#b0b2c3' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = link.hoverColor || '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#b0b2c3')}
            dangerouslySetInnerHTML={{ __html: link.svgPath }}
          />
        </li>
      ))}
    </ul>
  );
}
