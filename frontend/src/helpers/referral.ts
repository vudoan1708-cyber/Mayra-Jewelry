export const REFERRAL_DISCOUNT_PERCENT = 5;
export const REFERRAL_DISCOUNT_FRACTION = REFERRAL_DISCOUNT_PERCENT / 100;

export type DiscountLayer = { percent: number; label: string };

export type ExpiringCoupon = { id: string; percent: number; expiresAt: string };

export const pickSoonestExpiringCoupon = <Coupon extends ExpiringCoupon>(coupons: Coupon[]): Coupon | null => {
  if (!coupons.length) return null;
  return [...coupons].sort((firstCoupon, secondCoupon) => {
    const firstExpiry = Date.parse(firstCoupon.expiresAt) || 0;
    const secondExpiry = Date.parse(secondCoupon.expiresAt) || 0;
    return firstExpiry - secondExpiry;
  })[0];
};

export const applyStackedDiscounts = (amount: number, fractions: number[]): number =>
  fractions.reduce((current, fraction) => {
    if (!fraction || fraction <= 0) return current;
    const clamped = Math.min(fraction, 1);
    return current * (1 - clamped);
  }, amount);

export type CartBreakdownItem = {
  sum: number;
  productDiscount: number;
};

export type PersonalDiscount = { label: string; fraction: number };

export type AppliedPersonalDiscount = { label: string; fraction: number; value: number };

export type CartBreakdown = {
  subtotal: number;
  productDiscountValue: number;
  personalDiscounts: AppliedPersonalDiscount[];
  total: number;
};

export const computeCartBreakdown = (items: CartBreakdownItem[], personalDiscounts: PersonalDiscount[] = []): CartBreakdown => {
  const subtotal = items.reduce((acc, item) => acc + item.sum, 0);
  const afterProduct = items.reduce((acc, item) => {
    const clamped = Math.min(Math.max(item.productDiscount, 0), 1);
    return acc + item.sum * (1 - clamped);
  }, 0);
  const productDiscountValue = subtotal - afterProduct;

  let runningTotal = afterProduct;
  const applied: AppliedPersonalDiscount[] = [];
  for (const layer of personalDiscounts) {
    if (!layer.fraction || layer.fraction <= 0) continue;
    const clamped = Math.min(layer.fraction, 1);
    const value = runningTotal * clamped;
    applied.push({ label: layer.label, fraction: clamped, value: Math.round(value) });
    runningTotal -= value;
  }

  return {
    subtotal: Math.round(subtotal),
    productDiscountValue: Math.round(productDiscountValue),
    personalDiscounts: applied,
    total: Math.round(runningTotal),
  };
};

export type CreateReferralResult =
  | { status: 'ok'; token: string }
  | { status: 'unauthenticated' }
  | { status: 'buyer_missing' }
  | { status: 'error'; message: string };

export function buildSharePath(input: {
  origin: string;
  encodedId: string;
  itemAmount: number;
  info: string;
  itemVariation: string;
  referralToken: string | null;
}): string {
  const params = new URLSearchParams({
    amount: String(input.itemAmount),
    info: input.info,
    variation: input.itemVariation,
  });
  if (input.referralToken) params.set('ref', input.referralToken);
  return `${input.origin}/product/${input.encodedId ?? ''}?${params.toString()}`;
}

export function resolveReferralResult(input: {
  status: number;
  ok: boolean;
  token?: string;
  errorMessage?: string;
}): CreateReferralResult {
  if (input.status === 404) return { status: 'buyer_missing' };
  if (!input.ok) {
    return {
      status: 'error',
      message: input.errorMessage ?? `Request failed with status ${input.status}`,
    };
  }
  if (!input.token) return { status: 'error', message: 'response missing token field' };
  return { status: 'ok', token: input.token };
}
