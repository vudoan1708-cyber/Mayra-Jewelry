'use client'

import { useEffect, useRef, type TextareaHTMLAttributes } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { minRows?: number };

export default function AutoTextarea({ minRows = 3, value, ...props }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const minHeight = minRows * 24;
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  }, [value, minRows]);

  return <textarea {...props} ref={ref} rows={minRows} value={value} />;
}
