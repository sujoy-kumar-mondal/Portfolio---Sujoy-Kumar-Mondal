import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import CustomCursor from '@/components/public/CustomCursor';
import connectDB from '@/lib/mongodb'; // Ensure this points to your MongoDB connection utility
import MetadataModel from '@/models/Metadata'; // Points to your Mongoose Metadata model

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' });

// Fallback metadata in case the database is unreachable or empty
const defaultMetadata: Metadata = {
  title: 'Sujoy Kumar Mondal - Portfolio',
  description: 'Full-stack developer and web designer from Purba Medinipur.',
  keywords: ['portfolio', 'web developer', 'full stack', 'Sujoy Kumar Mondal'],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

// Dynamic metadata generator
export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectDB();
    
    // Fetch document by ID or query the first document
    const meta = await MetadataModel.findById('site_metadata').lean();

    if (!meta) return defaultMetadata;

    return {
      title: meta.title,
      description: meta.description,
      keywords: meta.keywords,
      icons: {
        icon: meta.icons?.icon,
        shortcut: meta.icons?.shortcut,
        apple: meta.icons?.apple,
      },
      openGraph: {
        title: meta.openGraph?.title || meta.title,
        description: meta.openGraph?.description || meta.description,
        type: (meta.openGraph?.type as 'website') || 'website',
      },
    };
  } catch (error) {
    console.error('Failed to fetch metadata from MongoDB:', error);
    return defaultMetadata;
  }
}

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