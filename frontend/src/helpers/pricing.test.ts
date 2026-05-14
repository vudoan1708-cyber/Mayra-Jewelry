import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { applyDiscount, lowestPriceEntry, minPrice } from './index.ts';
import type { Prices } from '../../types.ts';

const makePrices = (entries: Array<{ amount: number; discount?: number; variation?: Prices['variation'] }>): Prices[] =>
  entries.map((entry, index) => ({
    id: index,
    variation: entry.variation ?? 'Silver',
    amount: entry.amount,
    currency: 'VND',
    discount: entry.discount ?? 0,
  }));

describe('minPrice', () => {
  it('returns the minimum amount across entries', () => {
    const prices = makePrices([{ amount: 5000 }, { amount: 2000 }, { amount: 3500 }]);
    assert.equal(minPrice(prices), 2000);
  });

  it('returns the single amount when only one entry is present', () => {
    const prices = makePrices([{ amount: 1500 }]);
    assert.equal(minPrice(prices), 1500);
  });
});

describe('lowestPriceEntry', () => {
  it('returns the full Prices entry with the lowest amount', () => {
    const prices = makePrices([
      { amount: 5000, discount: 0.1, variation: 'Gold' },
      { amount: 2000, discount: 0.2, variation: 'Silver' },
      { amount: 3500, discount: 0, variation: 'White Gold' },
    ]);
    const cheapest = lowestPriceEntry(prices);
    assert.equal(cheapest.amount, 2000);
    assert.equal(cheapest.variation, 'Silver');
    assert.equal(cheapest.discount, 0.2);
  });

  it('keeps the first entry when amounts tie', () => {
    const prices = makePrices([
      { amount: 1000, variation: 'Silver' },
      { amount: 1000, variation: 'Gold' },
    ]);
    assert.equal(lowestPriceEntry(prices).variation, 'Silver');
  });
});

describe('applyDiscount', () => {
  it('returns the original amount when discount is 0', () => {
    assert.equal(applyDiscount(10000, 0), 10000);
  });

  it('returns the original amount when discount is undefined or null', () => {
    assert.equal(applyDiscount(10000, undefined), 10000);
    assert.equal(applyDiscount(10000, null), 10000);
  });

  it('applies a fractional discount', () => {
    assert.equal(applyDiscount(10000, 0.2), 8000);
    assert.equal(applyDiscount(10000, 0.5), 5000);
  });

  it('clamps discount above 1 to 100% off', () => {
    assert.equal(applyDiscount(10000, 1.5), 0);
  });

  it('ignores negative discount values', () => {
    assert.equal(applyDiscount(10000, -0.2), 10000);
  });
});
