'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_LOCALE } from '../../helpers';
import { applyStackedDiscounts, type DiscountLayer } from '../../helpers/referral';

const getCurrencyFormatter = (currency: string, locale: string) => {
  let formatter;
  try {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    });
  } catch {
    formatter = new Intl.NumberFormat(locale);
  }
  return formatter;
};

type NumberPart = {
  fraction: string;
  currency: string;
  integer: string;
};

const numberPartMapToClassName: NumberPart = {
  fraction: `opacity-60 text-[80%] leading-[80%]`,
  currency: `my-auto mx-0.5`,
  integer: `font-semibold`,
};

type MoneyProps = {
  amount: number | string;
  currency?: string;
  discount?: number;
  extraDiscounts?: DiscountLayer[];
  className?: string;
};

type Part = { value: string; type: string };

const formatParts = (formatter: Intl.NumberFormat, amount: number): Part[] => {
  return !formatter.formatToParts
    ? [{ value: formatter.format(amount), type: 'integer' }]
    : formatter.formatToParts(amount);
};

const renderParts = (parts: Part[]) =>
  parts.map((part, idx) => (
    <span key={idx} className={numberPartMapToClassName[part.type as keyof NumberPart]}>{part.value}</span>
  ));

export default function Money({ amount, currency = 'VND', discount, extraDiscounts, className = '' }: MoneyProps) {
  const formatter = useRef(getCurrencyFormatter(currency, DEFAULT_LOCALE));
  const numericAmount = useMemo(() => parseFloat(amount.toString()), [amount]);

  const productFraction = typeof discount === 'number' && discount > 0 ? Math.min(discount, 1) : 0;
  const extras = useMemo(() => extraDiscounts ?? [], [extraDiscounts]);
  const hasAnyDiscount = productFraction > 0 || extras.length > 0;

  const finalAmount = useMemo(() => {
    if (!hasAnyDiscount) return numericAmount;
    const allFractions = [productFraction, ...extras.map((layer) => layer.percent / 100)];
    return applyStackedDiscounts(numericAmount, allFractions);
  }, [numericAmount, productFraction, extras, hasAnyDiscount]);

  const [originalParts, setOriginalParts] = useState<Part[]>(() => formatParts(formatter.current, numericAmount));
  const [discountedParts, setDiscountedParts] = useState<Part[]>(() => formatParts(formatter.current, finalAmount));

  useEffect(() => {
    setOriginalParts(formatParts(formatter.current, numericAmount));
    setDiscountedParts(formatParts(formatter.current, finalAmount));
  }, [numericAmount, finalAmount]);

  if (!hasAnyDiscount) {
    return (
      <b className={`flex items-baseline flex-nowrap break-keep ${className}`.trim()}>
        {renderParts(originalParts)}
      </b>
    );
  }

  return (
    <b className={`flex items-baseline flex-wrap break-keep gap-1.5 ${className}`.trim()}>
      <span className="flex items-baseline opacity-60 line-through text-[80%]" aria-label="Original price">
        {renderParts(originalParts)}
      </span>
      <span className="flex items-baseline" aria-label="Discounted price">
        {renderParts(discountedParts)}
      </span>
      {productFraction > 0 && (
        <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-700 bg-accent-200/70 border border-accent-500/30 rounded-full px-1.5 py-0.5 leading-none">
          −{Math.round(productFraction * 100)}%
        </span>
      )}
      {extras.map((layer) => (
        <span
          key={layer.label}
          className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 bg-emerald-100 border border-emerald-300/60 rounded-full px-1.5 py-0.5 leading-none"
        >
          −{layer.percent}% {layer.label}
        </span>
      ))}
    </b>
  );
}
