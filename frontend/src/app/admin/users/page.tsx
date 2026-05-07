import type { Metadata } from 'next';

import UsersView from './UsersView';

export const metadata: Metadata = {
  title: 'Users',
  description: 'Manage Mayra admin accounts.',
  alternates: { canonical: '/admin/users' },
};

export default function Page() {
  return <UsersView />;
}
