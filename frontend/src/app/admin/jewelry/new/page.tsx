import type { Metadata } from 'next';

import JewelryEditor from '../JewelryEditor';

export const metadata: Metadata = {
  title: 'New piece',
  description: 'Add a new jewelry piece to the Mayra storefront.',
  alternates: { canonical: '/admin/jewelry/new' },
};

export default function Page() {
  return <JewelryEditor />;
}
