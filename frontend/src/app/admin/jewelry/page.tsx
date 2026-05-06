import type { Metadata } from 'next';

import JewelryListView from './JewelryListView';

export const metadata: Metadata = {
  title: 'Jewelry',
  description: 'Manage Mayra jewelry inventory.',
  alternates: { canonical: '/admin/jewelry' },
};

export default function Page() {
  return <JewelryListView />;
}
