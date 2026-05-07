'use client'

import { useTranslations } from 'next-intl';

import { LinkButton } from '../Button';
import LocaleSwitcher from '../LocaleSwitcher';

export default function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-brand-700 text-accent-100">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent-500/40 to-transparent" />

      <div className="w-full px-6 sm:px-10 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-12">
          <div className="flex flex-col gap-3 sm:items-start items-center text-center sm:text-left">
            <span className="font-serif font-semibold text-accent-300 text-2xl tracking-[0.32em] pl-[0.32em]">
              MAYRA
            </span>
            <p className="text-[11px] uppercase tracking-[0.35em] text-accent-100/70">
              {t('tagline')}
            </p>
            <p className="mt-1 max-w-xs text-sm text-accent-100/65 leading-relaxed">
              {t('blurb')}
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:items-start items-center">
            <h3 className="text-[11px] uppercase tracking-[0.35em] text-accent-100/70">
              {t('followUs')}
            </h3>
            <a
              href="https://www.facebook.com/mayrajewelry.insaigon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Mayra on Facebook"
              className="inline-flex items-center justify-center size-11 rounded-full border border-accent-500/30 text-accent-300 hover:text-brand-700 hover:bg-accent-300 transition-colors"
            >
              <svg
                role="img"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="currentColor"
              >
                <title>Facebook</title>
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
              </svg>
            </a>
          </div>

          <div className="flex flex-col gap-4 sm:items-start items-center">
            <h3 className="text-[11px] uppercase tracking-[0.35em] text-accent-100/70">
              {t('language')}
            </h3>
            <LocaleSwitcher />
          </div>
        </div>

        <div className="mt-10 pt-5 -mx-6 sm:-mx-10 px-6 sm:px-10 border-t border-accent-500/15 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-accent-100/50">
          <p>© {year} {t('rights')}</p>
          <nav className="flex items-center gap-5">
            <LinkButton
              variant="tertiary"
              href="/privacy"
              className="!text-accent-300 hover:!text-accent-100"
            >
              {t('privacy')}
            </LinkButton>
            <LinkButton
              variant="tertiary"
              href="/delete"
              className="!text-accent-300 hover:!text-accent-100"
            >
              {t('deleteData')}
            </LinkButton>
          </nav>
          <p>{t('craft')}</p>
        </div>
      </div>
    </footer>
  )
}
