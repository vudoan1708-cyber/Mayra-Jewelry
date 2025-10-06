import type { Metadata } from 'next';

import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Floating from './Floating';

import './page.css';

export const metadata: Metadata = {
  title: 'Mayra Jewelry',
  description: 'A jewelry website',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        
        <main id="root" className="flex-1">{children}</main>

        <Floating />

        <Footer />
      </body>
    </html>
  )
}
