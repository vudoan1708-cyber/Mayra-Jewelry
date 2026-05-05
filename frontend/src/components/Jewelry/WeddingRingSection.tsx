'use client'

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Button from '../Button';

export default function WeddingRingSection() {
  const router = useRouter();
  const t = useTranslations('jewelry.wedding');
  return (
    <div className="p-6 flex gap-4 flex-wrap items-start">
      <img
        alt="ring on someone's finger"
        src="images/wedding-ring.webp"
        width="640"
        height="426"
        className="rounded-md object-contain shadow-sm" />
      <div className="flex-1 flex flex-col gap-4">
        <h3 className="text-3xl font-medium">{t('heading')}</h3>
        <div>
          <p>{t('intro')}</p>
          <p>
            <a href="https://www.facebook.com/mayrajewelry.insaigon" target="_blank"><u>{t('contactLink')}</u></a> {t('contactSuffix')}
          </p>
          <p className="mt-1">{t('exploreHint')}</p>
        </div>
        <Button variant="primary" onClick={() => { router.push('/collections/wedding-rings'); }}>
          {t('cta')}
        </Button>
      </div>
    </div>
  )
}
