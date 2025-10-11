import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';

import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Floating from './Floating';

import './page.css';

export const metadata: Metadata = {
  title: 'Mayra Jewelry',
  description: 'A jewelry website',
  icons: '/images/logo.webp',
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
          <Navigation />
          
          <main id="root" className="grid flex-1">{children}</main>

          <Floating />

          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
