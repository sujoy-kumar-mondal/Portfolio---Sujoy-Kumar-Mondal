'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageGalleryModalProps {
  mainImage?: string;
  galleryImages?: string[];
  projectName?: string;
  accentColor?: string;
  children?: ReactNode;
}

export default function ImageGalleryModal({
  mainImage,
  galleryImages = [],
  projectName = 'Project',
  accentColor = '#5292ff',
  children,
}: ImageGalleryModalProps) {
  // Combine mainImage (first) with galleryImages (excluding duplicates)
  const allImages: string[] = [];
  if (mainImage) allImages.push(mainImage);
  galleryImages.forEach((img) => {
    if (img && !allImages.includes(img)) {
      allImages.push(img);
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
  }, []);

  const nextImage = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const prevImage = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  // Keyboard navigation listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeLightbox, nextImage, prevImage]);

  return (
    <>
      {/* ─── 1. TOP MAIN BANNER IMAGE ─── */}
      {mainImage && (
        <div
          onClick={() => openLightbox(0)}
          className="max-w-3xl sm:max-w-4xl mx-auto rounded-2xl overflow-hidden mb-10 shadow-2xl bg-[#0d0d0d]/80 p-3 sm:p-5 flex items-center justify-center border border-white/10 cursor-pointer group relative"
          style={{ boxShadow: `0 0 50px ${accentColor}25` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainImage}
            alt={projectName}
            className="w-auto max-w-full h-auto max-h-[380px] sm:max-h-[460px] object-contain rounded-lg drop-shadow-xl group-hover:scale-[1.02] transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-2xl pointer-events-none">
            <span className="bg-black/70 text-white text-sm font-semibold px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 shadow-lg backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              Click to Expand Image
            </span>
          </div>
        </div>
      )}

      {/* ─── 2. CONTENT WITH GALLERY GRID IN LEFT COLUMN ─── */}
      {typeof children === 'function'
        ? (children as (props: { openLightbox: (i: number) => void; allImages: string[] }) => ReactNode)({
            openLightbox,
            allImages,
          })
        : children}

      {/* ─── 3. FULL-SCREEN LIGHTBOX MODAL CAROUSEL ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6"
          >
            {/* Top Bar */}
            <div className="w-full max-w-screen-xl flex items-center justify-between z-10 py-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-base sm:text-lg text-white truncate max-w-[200px] sm:max-w-md">
                  {projectName}
                </span>
                <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-white/10 text-gray-300 font-medium">
                  {activeIndex + 1} / {allImages.length}
                </span>
              </div>

              <button
                onClick={closeLightbox}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/20 focus:outline-none"
                aria-label="Close image modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Main Carousel Display */}
            <div className="relative w-full max-w-screen-xl flex-1 flex items-center justify-center px-4 sm:px-16 my-4 overflow-hidden">
              {/* Left Arrow Button */}
              {allImages.length > 1 && (
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:left-6 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all border border-white/20 shadow-xl hover:scale-110 active:scale-95"
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}

              {/* Active Image */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={allImages[activeIndex]}
                    alt={`${projectName} slide ${activeIndex + 1}`}
                    className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Right Arrow Button */}
              {allImages.length > 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:right-6 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all border border-white/20 shadow-xl hover:scale-110 active:scale-95"
                  aria-label="Next image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )}
            </div>

            {/* Bottom Thumbnail Bar */}
            {allImages.length > 1 && (
              <div className="w-full max-w-screen-md flex items-center justify-center gap-3 overflow-x-auto py-2 px-4 z-10 scrollbar-thin">
                {allImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 bg-[#1a1a1a] ${
                      i === activeIndex
                        ? 'scale-110 shadow-lg'
                        : 'opacity-50 hover:opacity-100 border-white/20'
                    }`}
                    style={{ borderColor: i === activeIndex ? accentColor : undefined }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
