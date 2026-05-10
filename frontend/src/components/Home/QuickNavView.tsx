'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { Link } from '../../i18n/navigation';
import Money from '../Money/Money';

export type QuickNavCard = {
  id: string;
  href: string;
  image: string;
  name: string;
  eyebrow: string | null;
  price: number;
  currency: string;
};

type Category = {
  key: 'collections' | 'bestSellers' | 'featured';
  href: string;
};

const categories: Category[] = [
  { key: 'collections', href: '/collections' },
  { key: 'bestSellers', href: '/collections/best-sellers' },
  { key: 'featured', href: '/collections/featured' },
];

export default function QuickNavView({ featured }: { featured: QuickNavCard[] }) {
  const t = useTranslations('home');
  const tCat = useTranslations('home.categories');
  const covers = featured.slice(0, categories.length);

  return (
    <section className="relative w-full pb-12 space-y-10">
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-700/40 via-brand-600/40 to-brand-500/40 backdrop-blur-md py-8 md:py-12">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent-300/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-accent-400/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div>
            <header className="flex items-end justify-between gap-4 pb-4">
              <div>
                <p
                  style={{ color: 'var(--accent-300)' }}
                  className="text-[11px] uppercase tracking-[0.35em] font-semibold"
                >
                  {t('quickNav.eyebrow')}
                </p>
                <h2
                  style={{ color: 'var(--accent-100)' }}
                  className="text-2xl md:text-4xl font-medium tracking-tight mt-1"
                >
                  {t('quickNav.title')}
                </h2>
              </div>
              <Link
                href="/browse"
                style={{ color: 'var(--accent-300)' }}
                className="hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-medium [text-decoration:none] hover:opacity-80 transition-opacity"
              >
                {t('quickNav.browseAll')}
                <ArrowRight className="size-4" />
              </Link>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 sm:grid-rows-2 gap-3 md:gap-4 sm:h-[560px] md:h-[640px]">
          {categories.map((cat, i) => {
            const cover = covers[i]?.image;
            const isHero = i === 0;
            return (
              <Link
                key={cat.key}
                href={cat.href}
                className={`group relative block overflow-hidden rounded-2xl bg-accent-100/60 border border-accent-300/40 [text-decoration:none] focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 ${
                  isHero
                    ? 'sm:col-span-2 sm:row-span-2 aspect-[4/5] sm:aspect-auto'
                    : 'aspect-[4/3] sm:aspect-auto'
                }`}
                aria-label={tCat(`${cat.key}.name`)}
              >
                {cover && (
                  <Image
                    src={cover}
                    alt=""
                    fill
                    sizes={isHero ? '(max-width: 640px) 100vw, 66vw' : '(max-width: 640px) 100vw, 33vw'}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-700/95 via-brand-700/55 to-brand-700/10" />
                <div className={`absolute inset-x-0 bottom-0 ${isHero ? 'p-6 md:p-8' : 'p-4 md:p-5'} text-white`}>
                  <p className={`uppercase tracking-[0.4em] text-accent-300 font-medium ${isHero ? 'text-[11px]' : 'text-[10px]'}`}>
                    {tCat(`${cat.key}.eyebrow`)}
                  </p>
                  <h3 className={`mt-1.5 font-semibold leading-tight drop-shadow-md ${isHero ? 'text-3xl md:text-4xl' : 'text-lg md:text-xl'}`}>
                    {tCat(`${cat.key}.name`)}
                  </h3>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-white/90 transition-transform duration-300 group-hover:translate-x-1">
                    {t('quickNav.discover')}
                    <ArrowRight className="size-3.5" />
                  </p>
                </div>
              </Link>
            );
          })}
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-brand-700/40 via-brand-600/40 to-brand-500/40 backdrop-blur-md py-8 md:py-12">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-accent-300/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-accent-400/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div>
            <header className="flex items-end justify-between gap-4 pb-4">
              <div>
                <p
                  style={{ color: 'var(--accent-300)' }}
                  className="text-[11px] uppercase tracking-[0.35em] font-semibold"
                >
                  {t('featured.eyebrow')}
                </p>
                <h2
                  style={{ color: 'var(--accent-100)' }}
                  className="text-2xl md:text-4xl font-medium tracking-tight mt-1"
                >
                  {t('featured.title')}
                </h2>
              </div>
            </header>

            {featured.length === 0 ? (
              <div className="flex justify-center">
                <div className="bg-accent-200 rounded-2xl shadow-lg px-5 py-4 flex flex-col items-center max-w-md text-center">
                  <p className="text-lg text-brand-700">{t('featured.empty')}</p>
                </div>
              </div>
            ) : (
              <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 overflow-x-auto snap-x snap-mandatory scroll-px-4 sm:scroll-px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <ul className="flex gap-4 md:gap-5">
                  {featured.map((card) => (
                    <li key={card.id} className="snap-start shrink-0 w-[72%] sm:w-[42%] md:w-[28%] lg:w-[22%]">
                      <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                      >
                        <Link
                          href={card.href}
                          className="group relative block overflow-hidden rounded-2xl bg-accent-100 border border-accent-300/30 shadow-xl shadow-black/40 [text-decoration:none] focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2"
                        >
                          <figure className="relative aspect-[4/5] bg-accent-100 overflow-hidden">
                            <Image
                              src={card.image}
                              alt={card.name}
                              fill
                              sizes="(max-width: 640px) 72vw, (max-width: 1024px) 28vw, 22vw"
                              className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                            />
                          </figure>
                          <figcaption className="px-4 py-3">
                            {card.eyebrow && (
                              <p className="text-[10px] uppercase tracking-[0.3em] text-accent-600 truncate">
                                {card.eyebrow}
                              </p>
                            )}
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="text-sm md:text-base font-semibold text-brand-700 truncate min-w-0">{card.name}</p>
                              <p className="text-sm font-semibold text-brand-700 shrink-0">
                                <Money amount={card.price} currency={card.currency} />
                              </p>
                            </div>
                          </figcaption>
                        </Link>
                      </motion.div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white py-8 md:py-12">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent-300/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-accent-400/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.4em] text-accent-300">{t('editorial.eyebrow')}</p>
            <h2 className="mt-3 text-2xl md:text-4xl font-light leading-tight">
              {t('editorial.title')}
            </h2>
            <p className="mt-3 text-white/80 text-sm md:text-base leading-relaxed">
              {t('editorial.body')}
            </p>
            <Link
              href="/collections"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-300 text-brand-700 hover:text-brand-700 text-sm font-semibold [text-decoration:none] hover:bg-accent-200 hover:shadow-[2px_2px_8px_var(--accent-500)] transition-all focus-visible:ring-2 focus-visible:ring-accent-200 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-500"
            >
              {t('editorial.cta')}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
