'use client';

export default function LatestWorksButton() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('section-2')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleClick}
      className="relative bg-gradient-to-l from-[#1295b6] to-[#1f2667e6] hover:from-pink-500 hover:to-orange-500 text-xs sm:text-base py-2 px-5 sm:py-3 sm:px-7 mb-16 sm:mb-20 rounded font-extrabold hover:scale-110 ease-in-out duration-100 group text-white"
    >
      Latest Works
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="absolute rotate-90 left-1/2 -translate-x-1/2 w-8 sm:w-10 top-8 sm:top-12 group-hover:top-10 sm:group-hover:top-14 ease-in-out duration-300">
        <g transform="translate(0,-952.36218)">
          <path d="m 88.999835,1002.3621 c 0,-0.4628 -0.2799,-1.0773 -0.5639,-1.3755 l -15.9997,-17.00026 c -0.747,-0.7723 -1.9572,-0.8618 -2.8281,-0.078 -0.7786,0.7007 -0.798,2.0673 -0.078,2.8282 l 12.8435,13.62516 -69.37347,0 c -1.1046,0 -2,0.8954 -2,2 0,1.1046 0.8954,2.0001 2,2.0001 l 69.37347,0 -12.8435,13.6252 c -0.7199,0.7608 -0.6688,2.0938 0.078,2.8281 0.7885,0.7752 2.0925,0.7062 2.8281,-0.078 l 15.9997,-17.0002 c 0.4701,-0.4611 0.556,-0.9052 0.5639,-1.3748 z" fill="#fff" stroke="white" strokeWidth="2" />
        </g>
      </svg>
    </button>
  );
}
