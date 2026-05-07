import { getTranslations } from 'next-intl/server';
import { Ruler, CircleDot, Watch, Sparkles, ArrowUpRight } from 'lucide-react';

import { LinkButton } from '../../../components/Button';

type RingSize = {
  us: string;
  eu: string;
  diameter: string;
  circumference: string;
};

const RING_SIZES: ReadonlyArray<RingSize> = [
  { us: '4',   eu: '47', diameter: '14.9', circumference: '46.8' },
  { us: '5',   eu: '49', diameter: '15.7', circumference: '49.3' },
  { us: '6',   eu: '52', diameter: '16.5', circumference: '51.9' },
  { us: '7',   eu: '54', diameter: '17.3', circumference: '54.4' },
  { us: '8',   eu: '57', diameter: '18.1', circumference: '57.0' },
  { us: '9',   eu: '59', diameter: '18.9', circumference: '59.5' },
  { us: '10',  eu: '62', diameter: '19.8', circumference: '62.1' },
  { us: '11',  eu: '64', diameter: '20.6', circumference: '64.6' },
  { us: '12',  eu: '67', diameter: '21.4', circumference: '67.2' },
];

const BRACELET_SIZES: ReadonlyArray<{ label: string; circumference: string; bracelet: string }> = [
  { label: 'XS', circumference: '14 – 15', bracelet: '15.5 – 16.5' },
  { label: 'S',  circumference: '15 – 16', bracelet: '16.5 – 17.5' },
  { label: 'M',  circumference: '16 – 17', bracelet: '17.5 – 18.5' },
  { label: 'L',  circumference: '17 – 18', bracelet: '18.5 – 19.5' },
  { label: 'XL', circumference: '18 – 19', bracelet: '19.5 – 20.5' },
];

export default async function SizeGuideView() {
  const t = await getTranslations('sizeGuide');

  return (
    <section className="relative w-full pb-20">
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
          <nav className="mt-8 flex flex-wrap gap-3" aria-label={t('jumpAriaLabel')}>
            <a
              href="#ring"
              className="inline-flex items-center gap-2 rounded-full border border-accent-300/40 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-accent-200 hover:bg-accent-300/15 transition-colors"
            >
              <CircleDot className="size-3.5" />
              {t('jump.ring')}
            </a>
            <a
              href="#bracelet"
              className="inline-flex items-center gap-2 rounded-full border border-accent-300/40 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-accent-200 hover:bg-accent-300/15 transition-colors"
            >
              <Watch className="size-3.5" />
              {t('jump.bracelet')}
            </a>
            <a
              href="#tips"
              className="inline-flex items-center gap-2 rounded-full border border-accent-300/40 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-accent-200 hover:bg-accent-300/15 transition-colors"
            >
              <Sparkles className="size-3.5" />
              {t('jump.tips')}
            </a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-8 md:-mt-10 flex flex-col gap-10">
        <article
          id="ring"
          className="scroll-mt-24 rounded-2xl bg-accent-100 border border-accent-300/40 shadow-xl shadow-black/20 p-6 md:p-10 text-brand-700"
        >
          <SectionHeader
            eyebrow={t('ring.eyebrow')}
            title={t('ring.title')}
            description={t('ring.description')}
            icon={<CircleDot className="size-5" />}
          />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <MethodCard
              step="01"
              title={t('ring.methods.existing.title')}
              best={t('ring.methods.existing.best')}
              steps={t.raw('ring.methods.existing.steps') as string[]}
            />
            <MethodCard
              step="02"
              title={t('ring.methods.string.title')}
              best={t('ring.methods.string.best')}
              steps={t.raw('ring.methods.string.steps') as string[]}
            />
            <MethodCard
              step="03"
              title={t('ring.methods.visit.title')}
              best={t('ring.methods.visit.best')}
              steps={t.raw('ring.methods.visit.steps') as string[]}
            />
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-semibold tracking-tight">{t('ring.tableTitle')}</h3>
            <p className="mt-1 text-sm text-brand-500/85">{t('ring.tableNote')}</p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-accent-300/50 bg-white/60">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-accent-200/60 text-brand-700">
                    <th scope="col" className="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-[0.2em]">{t('ring.headers.diameter')}</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-[0.2em]">{t('ring.headers.circumference')}</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-[0.2em]">{t('ring.headers.us')}</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-[0.2em]">{t('ring.headers.eu')}</th>
                  </tr>
                </thead>
                <tbody>
                  {RING_SIZES.map((row, i) => (
                    <tr key={row.us} className={i % 2 === 0 ? 'bg-white/30' : 'bg-white/10'}>
                      <td className="px-4 py-2.5 tabular-nums">{row.diameter} mm</td>
                      <td className="px-4 py-2.5 tabular-nums">{row.circumference} mm</td>
                      <td className="px-4 py-2.5 tabular-nums font-semibold">{row.us}</td>
                      <td className="px-4 py-2.5 tabular-nums">{row.eu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </article>

        <article
          id="bracelet"
          className="scroll-mt-24 rounded-2xl bg-accent-100 border border-accent-300/40 shadow-xl shadow-black/20 p-6 md:p-10 text-brand-700"
        >
          <SectionHeader
            eyebrow={t('bracelet.eyebrow')}
            title={t('bracelet.title')}
            description={t('bracelet.description')}
            icon={<Watch className="size-5" />}
          />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <MethodCard
              step="01"
              title={t('bracelet.methods.wrap.title')}
              best={t('bracelet.methods.wrap.best')}
              steps={t.raw('bracelet.methods.wrap.steps') as string[]}
            />
            <MethodCard
              step="02"
              title={t('bracelet.methods.existing.title')}
              best={t('bracelet.methods.existing.best')}
              steps={t.raw('bracelet.methods.existing.steps') as string[]}
            />
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-semibold tracking-tight">{t('bracelet.tableTitle')}</h3>
            <p className="mt-1 text-sm text-brand-500/85">{t('bracelet.tableNote')}</p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-accent-300/50 bg-white/60">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-accent-200/60 text-brand-700">
                    <th scope="col" className="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-[0.2em]">{t('bracelet.headers.size')}</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-[0.2em]">{t('bracelet.headers.wrist')}</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-[0.2em]">{t('bracelet.headers.bracelet')}</th>
                  </tr>
                </thead>
                <tbody>
                  {BRACELET_SIZES.map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? 'bg-white/30' : 'bg-white/10'}>
                      <td className="px-4 py-2.5 font-semibold">{row.label}</td>
                      <td className="px-4 py-2.5 tabular-nums">{row.circumference} cm</td>
                      <td className="px-4 py-2.5 tabular-nums">{row.bracelet} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </article>

        <article
          id="tips"
          className="scroll-mt-24 rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white border border-accent-300/30 shadow-xl shadow-black/30 p-6 md:p-10 overflow-hidden relative"
        >
          <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-accent-300/10 blur-3xl" />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.4em] text-accent-300 font-semibold">
              {t('tips.eyebrow')}
            </p>
            <h2 className="mt-3 text-2xl md:text-3xl font-light tracking-tight">{t('tips.title')}</h2>
            <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {(t.raw('tips.items') as string[]).map((item, idx) => (
                <li key={idx} className="flex gap-3 text-white/85 leading-relaxed">
                  <span aria-hidden className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-accent-300 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between rounded-2xl border border-accent-300/40 bg-accent-100 p-6 md:p-8 text-brand-700">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-accent-600 font-semibold">
              {t('cta.eyebrow')}
            </p>
            <p className="mt-2 text-lg md:text-xl font-light tracking-tight">{t('cta.title')}</p>
          </div>
          <LinkButton variant="primary" href="/browse" className="self-start sm:self-auto">
            {t('cta.label')}
            <ArrowUpRight className="size-4" />
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-accent-600">
        <span className="inline-flex items-center justify-center rounded-full bg-accent-200 size-9 text-brand-700">
          <Ruler className="size-4" />
        </span>
        <p className="text-[11px] uppercase tracking-[0.4em] font-semibold">{eyebrow}</p>
      </div>
      <h2 className="mt-3 text-2xl md:text-3xl font-light tracking-tight text-brand-700">{title}</h2>
      <p className="mt-2 max-w-2xl text-brand-500/90 leading-relaxed">{description}</p>
      <span className="sr-only">{icon}</span>
    </div>
  );
}

function MethodCard({
  step,
  title,
  best,
  steps,
}: {
  step: string;
  title: string;
  best: string;
  steps: string[];
}) {
  return (
    <div className="rounded-xl border border-accent-300/50 bg-white/60 p-5 flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.4em] text-accent-600 font-semibold">
          {step}
        </span>
        <span className="text-[10px] uppercase tracking-[0.25em] text-brand-500/80 bg-accent-200/70 rounded-full px-2.5 py-1">
          {best}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold tracking-tight text-brand-700">{title}</h3>
      <ol className="mt-3 flex flex-col gap-2 text-sm text-brand-700/90 list-decimal list-inside marker:text-accent-600 marker:font-semibold">
        {steps.map((s, i) => (
          <li key={i} className="leading-relaxed">{s}</li>
        ))}
      </ol>
    </div>
  );
}
