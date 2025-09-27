import type { Metadata } from 'next';

import Navigation from '../components/Navigation';
 
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
        
        <div id="root">{children}</div>
        {/* <script type="module" src="/src/main.tsx"></script> */}
      </body>
    </html>
  )
}
