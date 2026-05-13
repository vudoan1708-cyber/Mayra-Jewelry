import type { Metadata } from 'next';

import ApprovalGate from './ApprovalGate';

export const metadata: Metadata = {
  title: 'Order approval',
  description: 'Internal order approval page — restricted access.',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
};

export default async function Page({ params }: { params: Promise<{ encryptedEmailId: Array<string> }> }) {
  const { encryptedEmailId } = await params;
  const id = decodeURIComponent(encryptedEmailId.join('/'));
  return <ApprovalGate encryptedId={id} />;
}
