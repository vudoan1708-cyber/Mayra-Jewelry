import type { Metadata } from 'next';

import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Authenticate to access the Mayra Jewelry admin control panel.',
  alternates: { canonical: '/admin/login' },
};

export default function Page() {
  return <LoginForm />;
}
