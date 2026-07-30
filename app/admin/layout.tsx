import { Geist } from 'next/font/google';

const geist = Geist({ subsets: ['latin'] });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${geist.className} min-h-screen bg-[#0d0d0d] text-white`}>
      {children}
    </div>
  );
}
