'use client'

import { useTranslations } from 'next-intl';

export default function PrivacyView() {
  const t = useTranslations('privacy');
  return <p>{t('body')}</p>;
}
