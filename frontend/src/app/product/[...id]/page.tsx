'use client'

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { lazy, Suspense, use, useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import Variation, { type JewelryVariation } from '../../../components/Jewelry/Variation';
import Tabs, { type Tab } from '../../../components/Tabs/Tabs';
import Loading from '../../../components/Loading/Loading';

import { base64ToArrayBuffer } from '../../../helpers';

import { fetchQRCode } from './data';

import { TriangleAlert } from 'lucide-react';

const dec = new TextDecoder();

const variations: Array<JewelryVariation> = [
  { key: 0, label: 'Bạc', style: 'bg-gray-400' },
  { key: 1, label: 'Vàng', style: 'bg-amber-300' },
  { key: 2, label: 'Vàng trắng', style: 'bg-slate-100' },
];
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
    <div className="w-dvw mt-20 mb-5 grid md:grid md:grid-cols-[1fr_auto_1fr] justify-around gap-2">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.2 } }}
        className="relative flex flex-col justify-center items-center !w-[100%]"
      >
        <Image
          src={`/images/jewelry/${imgUrl}`}
          alt={imgUrl}
          width="360"
          height="360"
          style={{ objectFit: "contain", width: "auto", height: "auto" }}
          className="border rounded-lg" />
        <div className="flex gap-2 justify-start items-center mt-2">
          {variations.map((variation) => (
            <Variation key={`${imgUrl}_${variation.key}`} variation={variation} />
          ))}
        </div>
      </motion.section>

      <motion.div
        initial={{ height: 0 }}
        animate={{ height: '100%', transition: { delay: 1, duration: 1 } }}
        className="w-[2px] border-0 bg-transparent-black mr-2" />

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
              : <div className="flex gap-1 items-center mt-2 bg-red-600 text-white p-1 rounded-sm"><TriangleAlert />{error || 'Cannot find QR Code'}</div>}
          </Suspense>
        )}
      </motion.section>
    </div>
  );
}
