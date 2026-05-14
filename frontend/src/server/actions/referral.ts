'use server';

import { cookies } from 'next/headers';

import { auth } from '../../app/auth';
import { resolveReferralResult, type CreateReferralResult } from '../../helpers/referral';

const MAYRA_REF_COOKIE = 'mayra_ref';
const REF_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export async function captureReferralCookie(token: string): Promise<void> {
  if (!token) return;
  const jar = await cookies();
  jar.set(MAYRA_REF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REF_COOKIE_MAX_AGE_SECONDS,
    path: '/',
  });
}

export async function readReferralCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(MAYRA_REF_COOKIE)?.value ?? null;
}

export async function clearReferralCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(MAYRA_REF_COOKIE);
}

export type { CreateReferralResult };

export async function createReferralToken(productId: string): Promise<CreateReferralResult> {
  const session = await auth();
  const buyerId = session?.user?.id;
  if (!buyerId) return { status: 'unauthenticated' };
  if (!productId) return { status: 'error', message: 'productId is required' };

  const formData = new FormData();
  formData.append('buyerId', buyerId);
  formData.append('productId', productId);

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/referrals/token`, {
    method: 'POST',
    body: formData,
  });

  let parsedBody: { token?: string; message?: string } | null = null;
  try {
    parsedBody = await response.json();
  } catch {
    parsedBody = null;
  }

  return resolveReferralResult({
    status: response.status,
    ok: response.ok,
    token: parsedBody?.token,
    errorMessage: parsedBody?.message,
  });
}
