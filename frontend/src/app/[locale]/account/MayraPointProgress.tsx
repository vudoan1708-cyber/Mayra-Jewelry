'use client'

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { convertTierToTextColour } from '../../../helpers';

const TIERS = [
  { key: 'silver', threshold: 0 },
  { key: 'gold', threshold: 100 },
  { key: 'platinum', threshold: 600 },
  { key: 'diamond', threshold: 1200 },
] as const;

const SEGMENT_SIZE = 100 / (TIERS.length - 1);

const computeFillPercent = (current: number) => {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    const tier = TIERS[i];
    if (current < tier.threshold) continue;
    if (i === TIERS.length - 1) return 100;
    const next = TIERS[i + 1];
    const ratio = (current - tier.threshold) / (next.threshold - tier.threshold);
    return i * SEGMENT_SIZE + ratio * SEGMENT_SIZE;
  }
  return 0;
};

export default function MayraPointProgress({ current }: { current: number }) {
  const t = useTranslations('account');
  const fillPercent = computeFillPercent(current);
  return (
    <div className="pt-1">
      <h3>{t('pointsHeading')}</h3>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%', transition: { duration: .25 } }}
        className="relative h-[28px] rounded-md bg-gray-400">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${fillPercent}%`, transition: { delay: 0.25 } }}
          style={{
            background: 'linear-gradient(to right, var(--brand-200), var(--brand-500))',
          }}
          className="relative h-[28px] rounded-md">
          <span className="absolute right-0 top-0 text-white bg-[rgba(255,255,255,.25)] h-[inherit] flex items-center px-2 rounded-md font-bold text-sm">
            {current}
          </span>
        </motion.div>
      </motion.div>

      <div className="relative h-[8px] w-full">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gray-500" />
        {TIERS.map((tier, idx) => (
          <motion.span
            key={tier.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: idx * 0.25 } }}
            style={{ left: `${idx * SEGMENT_SIZE}%` }}
            className="absolute top-0 w-[1px] h-[7px] bg-gray-500 -translate-x-1/2"
          />
        ))}
      </div>

      <div className="relative w-full h-[40px]">
        {TIERS.map((tier, idx) => (
          <motion.div
            key={tier.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: idx * 0.25 } }}
            style={{ left: `${idx * SEGMENT_SIZE}%` }}
            className="absolute top-0 -translate-x-1/2 text-center whitespace-nowrap">
            <p className={`text-xs font-semibold ${convertTierToTextColour(tier.key)}`}>
              {t(`tiers.${tier.key}`)}
            </p>
            <p className="text-gray-600 text-xs">{tier.threshold}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
