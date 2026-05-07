export const adminCard = 'bg-white border border-accent-300/40 rounded-2xl shadow-sm shadow-black/5';

export const adminCardPadded = `${adminCard} p-6 sm:p-7 flex flex-col gap-5`;

export const adminInput =
  '[color-scheme:light] bg-accent-100/40 border border-accent-300/60 rounded-md px-3.5 py-2.5 text-sm text-brand-700 placeholder:text-brand-500/40 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors w-full';

export const adminTextarea = `${adminInput} resize-none overflow-hidden leading-6`;

export const adminSelect = adminInput;

export const adminLabel = 'flex flex-col gap-1.5 text-sm';

export const adminLabelText = 'text-[11px] uppercase tracking-[0.18em] text-brand-500/80';

export const adminEyebrow = 'text-[10px] uppercase tracking-[0.32em] text-brand-500/60';

export const adminSectionTitle = 'text-lg text-brand-700 leading-none';

export { primaryButtonClass as adminPrimaryButton, secondaryButtonClass as adminSecondaryButton } from '../../components/Button';

export const adminGhostButton =
  'inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-brand-700 hover:text-brand-500 disabled:opacity-30 transition-colors';

export const adminDangerButton =
  'inline-flex items-center justify-center gap-1.5 text-xs uppercase tracking-[0.18em] text-red-700 hover:text-red-500 disabled:opacity-30 transition-colors';

export const adminPageHeading = 'text-3xl text-brand-700 leading-tight';

export const adminPageEyebrow = 'text-[10px] uppercase tracking-[0.32em] text-brand-500/70 mb-1';

export const adminDivider = 'border-0 border-t border-accent-300/40';
