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
    <div className="inline-flex items-center gap-1 text-sm" aria-busy={isPending}>
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={`px-2 py-1 uppercase ${l === locale ? 'font-semibold underline' : 'opacity-60 hover:opacity-100'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
