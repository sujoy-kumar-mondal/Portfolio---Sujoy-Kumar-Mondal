'use client';

export default function ScrollToTopButton() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('section-1')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Scroll to top"
      className="fixed right-5 bottom-5 z-20 bg-black/70 hover:bg-black rounded-full border border-white/10 transition-colors p-0.5"
    >
      <svg fill="#ffffff" height="40px" width="40px" viewBox="0 0 300.003 300.003" xmlns="http://www.w3.org/2000/svg">
        <path d="M150,0C67.159,0,0.001,67.159,0.001,150c0,82.838,67.157,150.003,149.997,150.003S300.002,232.838,300.002,150C300.002,67.159,232.842,0,150,0z M217.685,189.794c-5.47,5.467-14.338,5.47-19.81,0l-48.26-48.27l-48.522,48.516c-5.467,5.467-14.338,5.47-19.81,0c-2.731-2.739-4.098-6.321-4.098-9.905s1.367-7.166,4.103-9.897l56.292-56.297c0.539-0.838,1.157-1.637,1.888-2.368c2.796-2.796,6.476-4.142,10.146-4.077c3.662-0.062,7.348,1.281,10.141,4.08c0.734,0.729,1.349,1.528,1.886,2.365l56.043,56.043C223.152,175.454,223.156,184.322,217.685,189.794z" />
      </svg>
    </button>
  );
}
