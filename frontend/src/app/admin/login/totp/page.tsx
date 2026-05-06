import type { Metadata } from 'next';

import TotpForm from './TotpForm';

export const metadata: Metadata = {
  title: 'Two-factor authentication',
  description: 'Enter the six-digit code from your authenticator app to finish signing in.',
  alternates: { canonical: '/admin/login/totp' },
};

export default function Page() {
  return <TotpForm />;
}
