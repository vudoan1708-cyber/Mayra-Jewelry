'use client'

import { useTranslations } from 'next-intl';

export default function Privacy() {
  const t = useTranslations('privacy');
  return <p>{t('body')}</p>;
}
