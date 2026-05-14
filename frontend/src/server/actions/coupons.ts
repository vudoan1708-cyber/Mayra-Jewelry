'use server';

export type ReferralCoupon = {
  id: string;
  percent: number;
  expiresAt: string;
  createdAt: string;
};

export async function listOwnedReferralCoupons(buyerId: string): Promise<ReferralCoupon[]> {
  if (!buyerId) return [];
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/buyer/${encodeURIComponent(buyerId)}/referral-coupons`,
    { method: 'GET', cache: 'no-store' },
  );
  if (!response.ok) {
    console.error('listOwnedReferralCoupons failed', response.status);
    return [];
  }
  const body = await response.json();
  return Array.isArray(body) ? body : [];
}

