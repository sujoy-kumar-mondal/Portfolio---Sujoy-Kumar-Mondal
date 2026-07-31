import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';

import CustomCursor from '@/components/public/CustomCursor';

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' });

export const metadata: Metadata = {
  title: 'Sujoy Kumar Mondal - Portfolio',
  description: 'Full-stack developer and web designer from Purba Medinipur. Explore my projects, skills, and get in touch.',
  keywords: ['portfolio', 'web developer', 'full stack', 'Sujoy Kumar Mondal'],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Sujoy Kumar Mondal - Portfolio',
    description: 'Full-stack developer and web designer from Purba Medinipur.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${nunito.variable} font-sans bg-[#111] text-white antialiased`}>
        <AuthProvider>
          <CustomCursor />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
