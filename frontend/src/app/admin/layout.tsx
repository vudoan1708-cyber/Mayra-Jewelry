import type { Metadata } from 'next';

import '../[locale]/page.css';
import TopLoader from '../../components/Loading/TopLoader';
import { AdminAuthProvider } from './AdminAuthProvider';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Mayra Admin',
    template: '%s · Mayra Admin',
  },
  description: 'Internal control panel for Mayra Jewelry — inventory, banner, and account management.',
  applicationName: 'Mayra Admin',
  generator: 'Next.js',
  authors: [{ name: 'Mayra Jewelry' }],
  creator: 'Mayra Jewelry',
  publisher: 'Mayra Jewelry',
  category: 'business',
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
  referrer: 'no-referrer',
  openGraph: {
    type: 'website',
    siteName: 'Mayra Admin',
    title: 'Mayra Admin',
    description: 'Internal control panel for Mayra Jewelry — restricted access.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Mayra Admin',
    description: 'Internal control panel for Mayra Jewelry — restricted access.',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <TopLoader />
      <div className="h-dvh overflow-y-auto bg-accent-100/40 text-brand-700">
        {children}
      </div>
    </AdminAuthProvider>
  );
}
