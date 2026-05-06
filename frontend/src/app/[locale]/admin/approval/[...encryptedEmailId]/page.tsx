import type { Metadata } from 'next';
import { Suspense, lazy } from 'react';
import { verifyOrder } from '../../../../../server/data';
import FullScreenLoading from '../../../../../components/Loading/FullScreenLoading';
import { AnimatePresence } from 'framer-motion';

export const metadata: Metadata = {
  title: 'Order approval',
  description: 'Internal order approval page — restricted access.',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
};

export default async function Page({ params }: { params: Promise<{ encryptedEmailId: Array<string> }> }) {
  const { encryptedEmailId } = await params;
  await verifyOrder({ id: decodeURIComponent(encryptedEmailId.join('/')) });

  const LazyConfirmScreen = lazy(() => import ('./ConfirmScreen'));
  return (
    <Suspense fallback={<FullScreenLoading />}>
      <AnimatePresence mode="wait">
        <LazyConfirmScreen />
      </AnimatePresence>
    </Suspense>
  )
}
