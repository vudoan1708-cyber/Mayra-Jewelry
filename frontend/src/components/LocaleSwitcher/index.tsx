'use client';

import { useLocale } from 'next-intl';
import { useTransition } from 'react';

import { routing } from '../../i18n/routing';
import { usePathname, useRouter } from '../../i18n/navigation';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const onChange = (next: (typeof routing.locales)[number]) => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div className="inline-flex items-center gap-1 text-sm tracking-[0.15em]" aria-busy={isPending}>
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={`px-2 py-1 uppercase transition-colors ${
            l === locale
              ? '!font-bold !text-accent-300 underline underline-offset-4 decoration-accent-500/70 decoration-1'
              : '!font-medium !text-accent-200/70 hover:!text-accent-300'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
