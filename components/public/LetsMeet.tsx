'use client';
import { motion } from 'framer-motion';

interface LetsMeetProps {
  info: {
    letsMeetTitle?: string;
    address: string;
    addressMapUrl: string;
    mapEmbedUrl: string;
    phone: string;
    email: string;
  };
}

export default function LetsMeet({ info }: LetsMeetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative h-auto min-h-[480px] w-full max-w-[380px] mx-auto border-2 rounded-2xl bg-gradient-to-tl from-pink-500 to-orange-500 p-4 sm:p-6 shadow-2xl"
    >
      <h3 className="text-2xl font-bold mb-1">{info.letsMeetTitle || "Let's Meet"}</h3>
      <div className="border-b border-white/30 mb-4" />

      <a
        href={info.addressMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold block mb-4 hover:text-blue-900 transition-colors text-sm leading-relaxed"
      >
        {info.address}
      </a>

      <div className="rounded-xl overflow-hidden mb-4 border border-white/20">
        <div className="relative">
          <a
            href={info.addressMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 left-2 z-10 bg-white text-black text-xs font-semibold px-3 py-1 rounded flex items-center gap-1 shadow hover:bg-gray-100 transition-colors"
          >
            Open in Maps
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
          <iframe
            className="w-full h-[200px]"
            src={info.mapEmbedUrl}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <a href={`tel:${info.phone.replace(/\D/g, '')}`} className="block mt-3 hover:text-blue-900 transition-colors font-medium text-sm">
        {info.phone}
      </a>
      <a href={`mailto:${info.email}`} className="block hover:text-blue-900 transition-colors font-medium text-sm">
        {info.email}
      </a>
    </motion.div>
  );
}
