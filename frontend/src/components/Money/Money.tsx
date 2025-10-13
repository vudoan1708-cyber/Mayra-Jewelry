'use client'

import { useEffect, useRef, useState } from 'react';
import { DEFAULT_LOCALE } from '../../helpers';

const getCurrencyFormatter = (currency: string, locale: string) => {
  let formatter;
  try {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    });
  } catch (err) {
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

export default function Money({ amount, currency = 'VND' }: { amount: number | string, currency?: string }) {
  const updateNumberPart = () => {
    return !formatter.current.formatToParts
      ? [{ value: formatter.current.format(parseFloat(amount.toString())), type: 'integer' }]
      : formatter.current.formatToParts(parseFloat(amount.toString()))
  };
  const formatter = useRef(getCurrencyFormatter(currency, DEFAULT_LOCALE));
  const [parts, setParts] = useState(updateNumberPart());

  useEffect(() => {
    setParts(updateNumberPart());
  }, [amount]);

  return (
    <span className="flex items-baseline flex-nowrap break-keep">
      {
        parts.map((part, idx) => (
          <span key={idx} className={`${numberPartMapToClassName[part.type as keyof NumberPart]}`}>{part.value}</span>
        ))
      }
    </span>
  );
}
