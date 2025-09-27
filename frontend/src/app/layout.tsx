import type { Metadata } from 'next';

import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
 
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
        
        <main id="root">{children}</main>

        <Footer />
      </body>
    </html>
  )
}
