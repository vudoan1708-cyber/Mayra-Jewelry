'use client'

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

import { use, useState } from 'react';

import { motion } from 'framer-motion';

import { base64ToArrayBuffer } from '../../../helpers';

import ItemInfoSection from './ItemInfoSection';
import PaymentView from '../../../components/PaymentView/PaymentView';

const dec = new TextDecoder();

export default function Product({ params }: { params: Promise<{ id: Array<string> }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();

  const encryptedId = decodeURIComponent(id.join('/'));
  const arrayBufferData = base64ToArrayBuffer(encryptedId);

  const [imgUrl] = useState<string>(() => dec.decode(arrayBufferData));

  return (
    <div className="w-full mt-20 mb-5 grid grid-cols-1 md:grid-cols-[60%_1fr] lg:grid-cols-[2fr_1fr] justify-around gap-2 p-2">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.2 } }}
        className="relative grid grid-cols-1 md:[grid-template-columns:repeat(2,1fr)] gap-1 items-start mt-8"
      >
        <ItemInfoSection imgUrl={imgUrl} preselectedVariation={searchParams.get('variation') ?? ''} />
      </motion.section>

      <PaymentView amount={searchParams.get('amount') ?? ''} info={searchParams.get('info') ?? ''} />

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
