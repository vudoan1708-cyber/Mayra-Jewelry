'use client'

import { useTranslations } from 'next-intl';

export default function Delete() {
  const t = useTranslations('delete');
  return <p>{t('body')}</p>;
}
