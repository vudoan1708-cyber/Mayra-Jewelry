import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '../../../i18n/navigation';
import { localizeJewelryItem } from '../../../i18n/productCopy';
import { getAllJewelry } from '../../../server/data';
import {
  browseThumbnailOf,
  detailHeroOf,
  groupByCollection,
  pickHeroItem,
  slugifyCollection,
} from '../../../helpers';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.collections' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: { title: t('title'), description: t('description') },
    twitter: { title: t('title'), description: t('description') },
    alternates: { canonical: `/${locale}/collections` },
  };
}

type CollectionCard = {
  slug: string;
  name: string;
  count: number;
  hero: string;
};

export default async function CollectionsIndex() {
  const [items, locale, t] = await Promise.all([
    getAllJewelry().catch(() => []),
    getLocale(),
    getTranslations('collections'),
  ]);

  const localized = items.map((item) => localizeJewelryItem(item, locale));
  const grouped = groupByCollection(localized);

  const cards: CollectionCard[] = Array.from(grouped.entries())
    .map(([name, list]) => {
      const hero = pickHeroItem(list);
      const image = hero ? detailHeroOf(hero.media) ?? browseThumbnailOf(hero.media) : undefined;
      return {
        slug: slugifyCollection(name),
        name,
        count: list.length,
        hero: image ?? '',
      };
    })
    .filter((card) => card.hero)
    .sort((a, b) => b.count - a.count);

  const [hero, ...rest] = cards;

  return (
    <section className="relative w-full pb-16">
      <header className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white pt-14 pb-12 md:pt-20 md:pb-16">
        <div className="absolute -top-32 -right-24 w-80 h-80 rounded-full bg-accent-300/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-accent-400/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <p className="text-[11px] uppercase tracking-[0.45em] text-accent-300 font-semibold">
            {t('eyebrow')}
          </p>
          <h1 className="mt-4 text-4xl md:text-6xl font-light leading-[1.05] tracking-tight max-w-3xl">
            {t('title')}
          </h1>
          <p className="mt-5 max-w-xl text-white/75 text-sm md:text-base leading-relaxed">
            {t('lead')}
          </p>
          <div className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-accent-300/90">
            <span className="h-px w-8 bg-accent-300/60" />
            {t('count', { count: cards.length })}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-8 md:-mt-10">
        {cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-accent-400/40 bg-brand-700/40 backdrop-blur-sm p-12 text-center text-accent-200/80">
            <p className="text-lg">{t('empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 md:gap-6 auto-rows-[220px] sm:auto-rows-[260px] md:auto-rows-[300px]">
            {hero && (
              <CollectionTile
                card={hero}
                eyebrow={t('flagship')}
                countLabel={t('count', { count: hero.count })}
                exploreLabel={t('explore')}
                className="sm:col-span-6 md:col-span-4 row-span-2"
                size="hero"
                priority
              />
            )}
            {rest.map((card, i) => (
              <CollectionTile
                key={card.slug}
                card={card}
                eyebrow={t('eyebrow')}
                countLabel={t('count', { count: card.count })}
                exploreLabel={t('explore')}
                className={tileSpan(i)}
                size="standard"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function tileSpan(index: number): string {
  if (index < 2) return 'sm:col-span-3 md:col-span-2';
  return 'sm:col-span-3 md:col-span-3';
}

function CollectionTile({
  card,
  eyebrow,
  countLabel,
  exploreLabel,
  className,
  size,
  priority,
}: {
  card: CollectionCard;
  eyebrow: string;
  countLabel: string;
  exploreLabel: string;
  className: string;
  size: 'hero' | 'standard';
  priority?: boolean;
}) {
  const isHero = size === 'hero';
  return (
    <Link
      href={`/collections/${card.slug}`}
      className={`group relative block overflow-hidden rounded-2xl bg-accent-100/60 border border-accent-300/40 [text-decoration:none] focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 ${className}`}
      aria-label={card.name}
    >
      <Image
        src={card.hero}
        alt=""
        fill
        sizes={isHero ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
        priority={priority}
        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-700/95 via-brand-700/45 to-brand-700/5" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-2xl pointer-events-none" />

      <div
        className={`absolute inset-x-0 bottom-0 text-white ${
          isHero ? 'p-6 md:p-9' : 'p-4 md:p-6'
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`uppercase font-medium text-accent-300 ${
              isHero ? 'text-[11px] tracking-[0.4em]' : 'text-[10px] tracking-[0.3em]'
            }`}
          >
            {eyebrow}
          </span>
          <span className="h-px w-6 bg-accent-300/50" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/70">
            {countLabel}
          </span>
        </div>
        <h2
          className={`mt-2 font-light leading-[1.05] tracking-tight drop-shadow-md ${
            isHero ? 'text-3xl md:text-5xl' : 'text-xl md:text-2xl'
          }`}
        >
          {card.name}
        </h2>
        <p
          className={`mt-3 inline-flex items-center gap-2 uppercase tracking-[0.3em] text-white/85 transition-transform duration-300 group-hover:translate-x-1 ${
            isHero ? 'text-xs' : 'text-[10px]'
          }`}
        >
          {exploreLabel}
          <ArrowUpRight className={isHero ? 'size-4' : 'size-3.5'} />
        </p>
      </div>
    </Link>
  );
}
