'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface AboutModalProps {
  profile: {
    name: string;
    about: string;
    photoUrl: string;
    cvUrl: string;
    skills: string[];
  };
}

export default function AboutModal({ profile }: AboutModalProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-full max-w-4xl bg-[#111] border-2 border-white rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 sticky top-0 bg-[#111] z-20">
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text">
                About Me
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full bg-gradient-to-r from-pink-500 to-orange-500 p-0.5 hover:scale-110 transition-transform"
                aria-label="Close modal"
              >
                <svg height="22px" width="22px" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#030104" d="M21.125,0H4.875C2.182,0,0,2.182,0,4.875v16.25C0,23.818,2.182,26,4.875,26h16.25C23.818,26,26,23.818,26,21.125V4.875C26,2.182,23.818,0,21.125,0z M18.78,17.394l-1.388,1.387c-0.254,0.255-0.67,0.255-0.924,0L13,15.313L9.533,18.78c-0.255,0.255-0.67,0.255-0.925-0.002L7.22,17.394c-0.253-0.256-0.253-0.669,0-0.926l3.468-3.467L7.221,9.534c-0.254-0.256-0.254-0.672,0-0.925l1.388-1.388c0.255-0.257,0.671-0.257,0.925,0L13,10.689l3.468-3.468c0.255-0.257,0.671-0.257,0.924,0l1.388,1.386c0.254,0.255,0.254,0.671,0.001,0.927l-3.468,3.467l3.468,3.467C19.033,16.725,19.033,17.138,18.78,17.394z" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col xl:flex-row">
              {/* Photo */}
              <div className="xl:w-1/2 flex items-center justify-center p-6 min-h-[200px] xl:min-h-[400px]">
                {profile.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photoUrl}
                    alt={profile.name}
                    className="max-h-[350px] object-contain drop-shadow-[0px_0px_20px_rgba(255,255,255,0.6)]"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#1f2667] to-[#0a0094] flex items-center justify-center">
                    <span className="text-white/40 text-4xl font-bold">{profile.name?.[0]}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="xl:w-1/2 p-6 xl:pt-10">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                  Hi, I&apos;m <span className="text-blue-400">{profile.name}</span>
                </h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed ml-4">
                  &emsp;&emsp;{profile.about}
                </p>

                <div className="flex gap-3 mt-6 ml-6">
                  {profile.cvUrl && (
                    <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer">
                      <button className="border-2 border-amber-400 px-6 py-1.5 rounded-2xl hover:text-green-400 transition-colors text-sm font-semibold">
                        View CV
                      </button>
                    </a>
                  )}
                  <button
                    onClick={() => { setOpen(false); document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="border-2 border-amber-400 px-6 py-1.5 rounded-2xl hover:text-green-400 transition-colors text-sm font-semibold"
                  >
                    Contact Me
                  </button>
                </div>

                <ul className="flex flex-wrap gap-2 p-3 ml-3 mt-2">
                  {profile.skills.map((skill) => (
                    <li key={skill} className="px-2 py-0.5 rounded border border-[#757575] text-xs text-gray-300">
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        id="about-me-btn"
        onClick={() => setOpen(true)}
        className="relative bg-gradient-to-l from-[#1295b6] to-[#1f2667e6] hover:from-pink-500 hover:to-orange-500 text-white text-xs sm:text-base py-2 px-5 sm:py-3 sm:px-8 rounded font-extrabold hover:scale-105 ease-in-out duration-150 group"
      >
        About Me
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="absolute top-1/2 -translate-y-1/2 -right-5 w-8 group-hover:-right-8 sm:w-10 sm:-right-6 sm:group-hover:-right-10 ease-in-out duration-300">
          <g transform="translate(0,-952.36218)">
            <path d="m 88.999835,1002.3621 c 0,-0.4628 -0.2799,-1.0773 -0.5639,-1.3755 l -15.9997,-17.00026 c -0.747,-0.7723 -1.9572,-0.8618 -2.8281,-0.078 -0.7786,0.7007 -0.798,2.0673 -0.078,2.8282 l 12.8435,13.62516 -69.37347,0 c -1.1046,0 -2,0.8954 -2,2 0,1.1046 0.8954,2.0001 2,2.0001 l 69.37347,0 -12.8435,13.6252 c -0.7199,0.7608 -0.6688,2.0938 0.078,2.8281 0.7885,0.7752 2.0925,0.7062 2.8281,-0.078 l 15.9997,-17.0002 c 0.4701,-0.4611 0.556,-0.9052 0.5639,-1.3748 z" fill="#fff" stroke="white" strokeWidth="2" />
          </g>
        </svg>
      </button>

      {mounted ? createPortal(modalContent, document.body) : null}
    </>
  );
}
