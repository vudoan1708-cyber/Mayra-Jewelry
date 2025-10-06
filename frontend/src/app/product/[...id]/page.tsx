'use client'

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

import { lazy, Suspense, use, useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import Tabs, { type Tab } from '../../../components/Tabs/Tabs';
import Loading from '../../../components/Loading/Loading';

import { base64ToArrayBuffer } from '../../../helpers';

import { fetchQRCode } from './data';

import { TriangleAlert } from 'lucide-react';
import ItemInfoSection from './ItemInfoSection';

const dec = new TextDecoder();

const tabs: Array<Tab> = [
  // { label: 'Thẻ tín dụng', id: 1, active: true },
  // API: https://www.vietqr.io/danh-sach-api/link-tao-ma-nhanh/api-tao-ma-qr#operation/generate
  { label: 'Quét mã QR', id: 'qr', active: true },
];

export default function Product({ params }: { params: Promise<{ id: Array<string> }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();

  const encryptedId = decodeURIComponent(id.join('/'));
  const arrayBufferData = base64ToArrayBuffer(encryptedId);

  const [imgUrl] = useState<string>(() => dec.decode(arrayBufferData));

  const [activeTab, setActiveTab] = useState<Tab>(() => tabs.find((tab) => tab.id === 'qr') as Tab);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string>('');

  const LazyPaymentSectionComponent = lazy(() => import('./PaymentSection'));

  const getAndProcessQrCode = async () => {
    setLoading(true);
    try {
      const result = await fetchQRCode({ amount: searchParams.get('amount') as string, info: searchParams.get('info') as string });
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
    <div className="w-full mt-20 mb-5 grid grid-cols-1 md:grid-cols-[60%_1fr] lg:grid-cols-[2fr_1fr] justify-around gap-2 p-2">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.2 } }}
        className="relative grid grid-cols-1 md:[grid-template-columns:repeat(2,1fr)] gap-1 items-start mt-8"
      >
        <ItemInfoSection imgUrl={imgUrl} />
      </motion.section>

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

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 1, duration: 0.2 } }}
        className="col-span-1 md:col-span-2">
        <h2 className="text-2xl text-brand-500 font-semibold mt-6 self-start">Những món hàng được view thường xuyên</h2>
        <div className="flex gap-2 overflow-auto">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Image
              key={idx}
              src={`/images/jewelry/${imgUrl}`}
              alt={imgUrl}
              width="360"
              height="360"
              style={{ objectFit: "contain", width: "auto", height: "auto" }}
              className="border rounded-lg max-w-[360px] max-h-[360px]" />
          ))}
        </div>
      </motion.section>
    </div>
  );
}
