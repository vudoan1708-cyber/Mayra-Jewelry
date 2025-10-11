import type { Metadata } from 'next';

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
      <head>
        <link href="https://fonts.cdnfonts.com/css/cocobiker" rel="stylesheet" />
      </head>
      <body>
        <Navigation />
        
        <main id="root" className="flex-1">{children}</main>

        <Floating />

        <Footer />
      </body>
    </html>
  )
}
