import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';

import SmoothScroller from '../components/LenisSmoothScrolling/SmoothScroller';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Floating from './Floating';

import './page.css';

export const metadata: Metadata = {
  title: 'Mayra Jewelry',
  description: 'Khám phá bộ sưu tập nhẫn mới nhất, tinh tế và thời thượng – chỉ có tại Mayra',
  alternates: {
    // canonical: 'https://example.com',
    // languages: {
    //   'en-US': 'https://example.com/en-US',
    //   'de-DE': 'https://example.com/de-DE'
    // }
  },
  openGraph: {
    title: 'Mayra Jewelry',
    description: 'Khám phá bộ sưu tập nhẫn mới nhất, tinh tế và thời thượng – chỉ có tại Mayra',
    siteName: 'Mayra Jewelry',
    images: [{ url: '/images/logo.webp' }]
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <SmoothScroller />
          <Navigation />

          <main id="root" className="grid flex-1">
            <div id="portal-before-anchor" className="absolute"></div>
            {children}
          </main>

          <Floating />

          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
