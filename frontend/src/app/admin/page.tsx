import type { Metadata } from 'next';

import AdminHomeView from './AdminHomeView';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Mayra admin dashboard — manage inventory and the storefront banner.',
  alternates: { canonical: '/admin' },
};

export default function Page() {
  return <AdminHomeView />;
}
