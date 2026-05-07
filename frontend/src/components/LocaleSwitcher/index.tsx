'use client';

import { useLocale } from 'next-intl';

import { LinkButton } from '../Button';
import { routing } from '../../i18n/routing';
import { usePathname } from '../../i18n/navigation';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="inline-flex items-center gap-1 text-sm tracking-[0.15em]">
      {routing.locales.map((l) => (
        <LinkButton
          key={l}
          variant="tertiary"
          href={pathname}
          locale={l}
          replace
          active={l === locale}
        >
          {l}
        </LinkButton>
      ))}
    </div>
  );
}
