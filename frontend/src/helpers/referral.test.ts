import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  applyStackedDiscounts,
  buildSharePath,
  computeCartBreakdown,
  pickSoonestExpiringCoupon,
  REFERRAL_DISCOUNT_FRACTION,
  REFERRAL_DISCOUNT_PERCENT,
  resolveReferralResult,
} from './referral.ts';

describe('buildSharePath', () => {
  const baseInput = {
    origin: 'https://mayra.test',
    encodedId: 'prod-123',
    itemAmount: 4500000,
    info: 'CK tiền trang sức Mayra Ring of Stars',
    itemVariation: 'Silver',
    referralToken: null as string | null,
  };

  it('builds a URL with the canonical query params when no referral token is set', () => {
    const result = buildSharePath(baseInput);
    const url = new URL(result);
    assert.equal(url.origin, 'https://mayra.test');
    assert.equal(url.pathname, '/product/prod-123');
    assert.equal(url.searchParams.get('amount'), '4500000');
    assert.equal(url.searchParams.get('variation'), 'Silver');
    assert.equal(url.searchParams.get('info'), baseInput.info);
    assert.equal(url.searchParams.get('ref'), null);
  });

  it('appends ?ref when a referral token is provided', () => {
    const result = buildSharePath({ ...baseInput, referralToken: 'abc123XYZ' });
    const url = new URL(result);
    assert.equal(url.searchParams.get('ref'), 'abc123XYZ');
  });

  it('URL-encodes the info field with special characters', () => {
    const result = buildSharePath({ ...baseInput, info: 'foo & bar/baz?qux=1' });
    const url = new URL(result);
    assert.equal(url.searchParams.get('info'), 'foo & bar/baz?qux=1');
  });

  it('omits ?ref when token is an empty string', () => {
    const result = buildSharePath({ ...baseInput, referralToken: '' });
    const url = new URL(result);
    assert.equal(url.searchParams.get('ref'), null);
  });
});

describe('resolveReferralResult', () => {
  it('maps 404 to buyer_missing regardless of other fields', () => {
    const result = resolveReferralResult({ status: 404, ok: false, token: 'unused' });
    assert.deepEqual(result, { status: 'buyer_missing' });
  });

  it('maps non-ok responses to error with the provided message', () => {
    const result = resolveReferralResult({
      status: 500,
      ok: false,
      errorMessage: 'database unavailable',
    });
    assert.deepEqual(result, { status: 'error', message: 'database unavailable' });
  });

  it('falls back to a generic message when error body lacks one', () => {
    const result = resolveReferralResult({ status: 502, ok: false });
    assert.deepEqual(result, { status: 'error', message: 'Request failed with status 502' });
  });

  it('errors when response is ok but token field is missing', () => {
    const result = resolveReferralResult({ status: 200, ok: true });
    assert.deepEqual(result, { status: 'error', message: 'response missing token field' });
  });

  it('returns ok with the token on a successful response', () => {
    const result = resolveReferralResult({ status: 200, ok: true, token: 'realToken' });
    assert.deepEqual(result, { status: 'ok', token: 'realToken' });
  });
});

describe('REFERRAL_DISCOUNT_*', () => {
  it('keeps percent and fraction in sync', () => {
    assert.equal(REFERRAL_DISCOUNT_PERCENT, 5);
    assert.equal(REFERRAL_DISCOUNT_FRACTION, 0.05);
  });
});

describe('applyStackedDiscounts', () => {
  it('returns the base amount when no fractions are supplied', () => {
    assert.equal(applyStackedDiscounts(10000, []), 10000);
  });

  it('applies a single fraction multiplicatively', () => {
    assert.equal(applyStackedDiscounts(10000, [0.1]), 9000);
  });

  it('stacks multiple fractions multiplicatively (not additively)', () => {
    const result = applyStackedDiscounts(10000, [0.1, 0.05]);
    assert.equal(Math.round(result), 8550);
  });

  it('skips zero, negative, and undefined-like fractions', () => {
    const result = applyStackedDiscounts(10000, [0, -0.5, 0.1]);
    assert.equal(result, 9000);
  });

  it('clamps a fraction above 1 to 100% off for that layer', () => {
    assert.equal(applyStackedDiscounts(10000, [1.5]), 0);
  });
});

describe('computeCartBreakdown', () => {
  it('returns zeros for an empty cart', () => {
    const result = computeCartBreakdown([], []);
    assert.deepEqual(result, { subtotal: 0, productDiscountValue: 0, personalDiscounts: [], total: 0 });
  });

  it('passes through subtotal when no discounts apply', () => {
    const result = computeCartBreakdown([{ sum: 10000, productDiscount: 0 }], []);
    assert.deepEqual(result, { subtotal: 10000, productDiscountValue: 0, personalDiscounts: [], total: 10000 });
  });

  it('applies a per-item product discount and reports the saving', () => {
    const result = computeCartBreakdown([{ sum: 10000, productDiscount: 0.2 }], []);
    assert.equal(result.subtotal, 10000);
    assert.equal(result.productDiscountValue, 2000);
    assert.equal(result.total, 8000);
    assert.deepEqual(result.personalDiscounts, []);
  });

  it('stacks a single personal discount on top of product discount multiplicatively', () => {
    const result = computeCartBreakdown(
      [{ sum: 10000, productDiscount: 0.1 }],
      [{ label: 'referral', fraction: 0.05 }],
    );
    assert.equal(result.subtotal, 10000);
    assert.equal(result.productDiscountValue, 1000);
    assert.equal(result.personalDiscounts.length, 1);
    assert.equal(result.personalDiscounts[0].label, 'referral');
    assert.equal(result.personalDiscounts[0].value, Math.round(9000 * 0.05));
    assert.equal(result.total, 9000 - Math.round(9000 * 0.05));
  });

  it('stacks multiple personal discounts in order, each applied to the running total', () => {
    const result = computeCartBreakdown(
      [{ sum: 10000, productDiscount: 0 }],
      [
        { label: 'referral', fraction: 0.05 },
        { label: 'coupon', fraction: 0.05 },
      ],
    );
    // 10000 -> 9500 (referral) -> 9025 (coupon)
    assert.equal(result.personalDiscounts.length, 2);
    assert.equal(result.personalDiscounts[0].value, 500);
    assert.equal(result.personalDiscounts[1].value, Math.round(9500 * 0.05));
    assert.equal(result.total, 9025);
  });

  it('skips personal discounts with zero or negative fractions', () => {
    const result = computeCartBreakdown(
      [{ sum: 10000, productDiscount: 0 }],
      [
        { label: 'inactive', fraction: 0 },
        { label: 'broken', fraction: -0.1 },
        { label: 'referral', fraction: 0.05 },
      ],
    );
    assert.equal(result.personalDiscounts.length, 1);
    assert.equal(result.personalDiscounts[0].label, 'referral');
  });

  it('uses the constant referral fraction (sanity check)', () => {
    const result = computeCartBreakdown(
      [{ sum: 10000, productDiscount: 0 }],
      [{ label: 'referral', fraction: REFERRAL_DISCOUNT_FRACTION }],
    );
    assert.equal(result.personalDiscounts[0].value, Math.round(10000 * REFERRAL_DISCOUNT_FRACTION));
  });

  it('sums across multiple line items with mixed product discounts', () => {
    const result = computeCartBreakdown(
      [
        { sum: 6000, productDiscount: 0.1 },
        { sum: 4000, productDiscount: 0 },
      ],
      [{ label: 'referral', fraction: 0.05 }],
    );
    assert.equal(result.subtotal, 10000);
    assert.equal(result.productDiscountValue, 600);
    assert.equal(result.personalDiscounts[0].value, Math.round(9400 * 0.05));
  });

  it('clamps a per-item discount above 1 to fully wipe that line', () => {
    const result = computeCartBreakdown([{ sum: 10000, productDiscount: 1.5 }], []);
    assert.equal(result.total, 0);
    assert.equal(result.productDiscountValue, 10000);
  });
});

describe('pickSoonestExpiringCoupon', () => {
  it('returns null for an empty list', () => {
    assert.equal(pickSoonestExpiringCoupon([]), null);
  });

  it('returns the coupon with the earliest expiresAt', () => {
    const coupons = [
      { id: 'late', percent: 5, expiresAt: '2027-12-31T00:00:00Z' },
      { id: 'soon', percent: 5, expiresAt: '2026-06-01T00:00:00Z' },
      { id: 'mid', percent: 5, expiresAt: '2026-12-01T00:00:00Z' },
    ];
    assert.equal(pickSoonestExpiringCoupon(coupons)?.id, 'soon');
  });

  it('does not mutate the input array', () => {
    const coupons = [
      { id: 'b', percent: 5, expiresAt: '2027-12-31T00:00:00Z' },
      { id: 'a', percent: 5, expiresAt: '2026-06-01T00:00:00Z' },
    ];
    const snapshot = coupons.map((coupon) => coupon.id);
    pickSoonestExpiringCoupon(coupons);
    assert.deepEqual(coupons.map((coupon) => coupon.id), snapshot);
  });
});
