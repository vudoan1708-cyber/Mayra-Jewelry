'use client'

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import LoginForm from '../../../components/LoginForm/LoginForm';
import type { JewelryItemInfo } from '../../../../types';
import Image from 'next/image';

export default function DisplayWishlist({ from, wishlistItems }: { from: string | undefined; wishlistItems: Array<JewelryItemInfo> }) {
  const router = useRouter();
  const session = useSession();
  const t = useTranslations('wishlist');
  const tCommon = useTranslations('common');
  const tLogin = useTranslations('loginForm');
  if (session.status === 'authenticated') {
    if (wishlistItems.length > 0) {
      return (
        <div className="self-center">
          {wishlistItems.map((item) => (
            <div key={item.directoryId} className="flex items-center gap-1 shadow-md">
              <Image
                alt={item.itemName}
                src={item.media.find((file) => file.url.includes('thumbnail'))?.url ?? ''}
                width="200"
                height="200"
                className="rounded-md"
              />
            </div>
          ))}
        </div>
      )
    }
    return (
      <div className="self-center">
        <p className="text-[100px] text-center select-none">💔</p>
        <p>{t('empty')} <a onClick={() => { router.push('/'); }}>{tCommon('backToHome')}</a> {t('emptySuffix')}</p>
      </div>
    )
  }

  const redirectTo = from ?? '/wishlist';
  return (
    <LoginForm title={tLogin('featureTitle')} redirectTo={redirectTo} />
  )
}
