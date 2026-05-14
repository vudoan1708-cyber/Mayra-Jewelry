import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { auth } from '../../auth';
import Cart from './Cart';
import { buildLocalizedMetadata } from '../../../i18n/metadata';
import { hasReferralCookie } from '../../../server/actions/order';
import { listOwnedReferralCoupons } from '../../../server/actions/coupons';
import { pickSoonestExpiringCoupon } from '../../../helpers/referral';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.cart' });
  return buildLocalizedMetadata({
    locale,
    path: '/cart',
    title: t('title'),
    description: t('description'),
    noIndex: true,
  });
}

export default async function Page() {
  const [session, referralActive] = await Promise.all([auth(), hasReferralCookie()]);
  const buyerId = session?.user?.id ?? '';
  const coupons = buyerId ? await listOwnedReferralCoupons(buyerId) : [];
  const couponToApply = pickSoonestExpiringCoupon(coupons);

  return (
    <Cart
      userId={buyerId}
      userEmail={session?.user?.email ?? ''}
      referralActive={referralActive}
      couponToApply={couponToApply}
    />
  );
}
