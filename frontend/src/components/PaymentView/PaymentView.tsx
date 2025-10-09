'use client'

import { lazy, Suspense, useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { TriangleAlert } from 'lucide-react';

import { fetchQRCode } from '../../server/data';

import Tabs, { type Tab } from '../Tabs/Tabs';
import Loading from '../Loading/Loading';

const tabs: Array<Tab> = [
  // { label: 'Thẻ tín dụng', id: 1, active: true },
  // API: https://www.vietqr.io/danh-sach-api/link-tao-ma-nhanh/api-tao-ma-qr#operation/generate
  { label: 'Quét mã QR', id: 'qr', active: true },
];

export default function PaymentView({ amount, info }: { amount: string, info: string }) {
  const [activeTab, setActiveTab] = useState<Tab>(() => tabs.find((tab) => tab.id === 'qr') as Tab);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string>('');
  
  const LazyPaymentSectionComponent = lazy(() => import('./QRCodeImage'));

  const getAndProcessQrCode = async () => {
    setLoading(true);
    try {
      const result = await fetchQRCode({ amount, info });
      if (!result?.data?.qrDataURL) throw Error('Cannot find QR Code');
      setQrCode(result?.data?.qrDataURL);
    } catch (e) {
      setError(e?.message);
    } finally {
      setLoading(false);
    }
  };
  const onTabSelected = async (tab: Tab) => {
    setActiveTab(tab);
    if (activeTab.id === 'qr') {
      setError('');
      await getAndProcessQrCode();
    }
  };

  useEffect(() => {
    getAndProcessQrCode();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 1, duration: 0.2 } }}
      className="relative flex flex-col items-start"
    >
      <Tabs items={tabs} onSelect={onTabSelected} />

      {activeTab?.id === 'qr' && (
        <Suspense fallback={<div className="w-full flex justify-center items-center"><Loading /></div>}>
          {!error
            ? <LazyPaymentSectionComponent qrCode={qrCode} loading={loading} />
            : <div className="flex gap-1 items-center mt-2 bg-red-600 text-white p-1 rounded-sm"><TriangleAlert />{error}</div>}
        </Suspense>
      )}
    </motion.section>
  )
}
