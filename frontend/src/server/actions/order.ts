'use server';

import { cookies } from 'next/headers';

import type { VeriyingOrderPayload } from '../../../types';

const MAYRA_REF_COOKIE = 'mayra_ref';

export type SubmitVerifyingOrderPayload = VeriyingOrderPayload & { couponId?: string };

export async function submitVerifyingOrder(payload: SubmitVerifyingOrderPayload): Promise<void> {
  const cookieJar = await cookies();
  const referralToken = cookieJar.get(MAYRA_REF_COOKIE)?.value ?? '';

  const formData = new FormData();
  formData.append('buyerId', payload.buyerId);
  formData.append('buyerEmail', payload.buyerEmail);
  formData.append('buyerName', payload.buyerName);
  formData.append('digits', payload.digits);
  formData.append('jewelryItems', JSON.stringify(payload.jewelryItems));
  formData.append('totalAmount', payload.totalAmount);
  if (referralToken) formData.append('referralToken', referralToken);
  if (payload.couponId) formData.append('couponId', payload.couponId);

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/buyer/payment/pending-verification`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let message = `Order failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      message = errorBody?.message ?? message;
    } catch {
      message = response.statusText || message;
    }
    if (referralToken && /referral/i.test(message)) {
      cookieJar.delete(MAYRA_REF_COOKIE);
    }
    throw new Error(message);
  }

  if (referralToken) {
    cookieJar.delete(MAYRA_REF_COOKIE);
  }
}

export async function hasReferralCookie(): Promise<boolean> {
  const cookieJar = await cookies();
  return Boolean(cookieJar.get(MAYRA_REF_COOKIE)?.value);
}
