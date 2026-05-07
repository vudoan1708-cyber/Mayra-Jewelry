import type { ComponentProps, HTMLAttributes, MouseEventHandler, Ref } from 'react';

import { motion, type Transition } from 'framer-motion';

import { Link } from '../../i18n/navigation';

type ButtonProps = {
  variant: 'primary' | 'tertiary' | 'secondary' | 'circle',
  type?: 'button' | 'submit' | 'reset',
  disabled?: boolean,
  working?: boolean,
  ref?: Ref<HTMLButtonElement>,
  className?: HTMLAttributes<HTMLButtonElement>['className'],
  tooltip?: string,
  transitionOption?: Transition<unknown> | undefined,
  onClick?: MouseEventHandler,
  children: React.ReactNode,
};

export const primaryButtonClass =
  'inline-flex items-center justify-center gap-1.5 bg-accent-300 text-brand-700 uppercase tracking-[0.25em] text-sm py-3 px-6 rounded-md transition-all hover:bg-accent-200 hover:shadow-[2px_2px_8px_var(--accent-500)] disabled:!bg-gray-300 disabled:!text-gray-500 disabled:hover:!shadow-none disabled:cursor-not-allowed';

export const secondaryButtonClass =
  'inline-flex items-center justify-center gap-1.5 bg-transparent text-brand-700 border border-accent-500/50 uppercase tracking-[0.25em] text-sm py-3 px-6 rounded-md transition-colors hover:border-accent-500 hover:bg-accent-100/40 disabled:opacity-50';

export const tertiaryButtonClass =
  'inline-flex items-center gap-1.5 bg-transparent border-none outline-none text-brand-700 uppercase tracking-[0.18em] text-xs transition-colors hover:text-accent-600 disabled:opacity-30';

export default function Button({ ref, variant, type = 'button', disabled, working, className, tooltip, transitionOption, onClick, children }: ButtonProps) {
  const patchOnClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    if (disabled || working) return;
    onClick?.(e);
  };
  if (variant === 'primary') {
    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: transitionOption }}
        ref={ref}
        type={type}
        title={tooltip}
        onClick={patchOnClick}
        disabled={disabled}
        className={`${primaryButtonClass} ${working ? 'cursor-wait' : ''} ${className ?? ''}`}>
        {children}
      </motion.button>
    )
  }
  if (variant === 'tertiary') {
    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: transitionOption }}
        ref={ref}
        type={type}
        title={tooltip}
        onClick={patchOnClick}
        disabled={disabled}
        className={`${tertiaryButtonClass} ${working ? 'cursor-wait' : ''} ${className ?? ''}`}>
        {children}
      </motion.button>
    )
  }
  if (variant === 'secondary') {
    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: transitionOption }}
        ref={ref}
        type={type}
        title={tooltip}
        onClick={patchOnClick}
        disabled={disabled}
        className={`${secondaryButtonClass} ${working ? 'cursor-wait' : ''} ${className ?? ''}`}>
        {children}
      </motion.button>
    )
  }
  if (variant === 'circle') {
    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: transitionOption }}
        ref={ref}
        type={type}
        title={tooltip}
        onClick={patchOnClick}
        disabled={disabled}
        className={`flex justify-center items-center gap-1 bg-accent-300 text-brand-700 transition-all ${working ? 'cursor-wait' : ''} ${disabled ? 'bg-gray-300' : 'hover:shadow-[2px_2px_5px_var(--accent-500)]'} rounded-[50%] w-5 h-5 ${className ?? ''}`}>
        {children}
      </motion.button>
    )
  }
}

const linkVariantClass = {
  primary: primaryButtonClass,
  secondary: secondaryButtonClass,
  tertiary: tertiaryButtonClass,
} as const;

type LinkButtonProps = {
  variant: 'primary' | 'secondary' | 'tertiary',
  className?: HTMLAttributes<HTMLAnchorElement>['className'],
  children: React.ReactNode,
} & Omit<ComponentProps<typeof Link>, 'className' | 'children'>;

export function LinkButton({ variant, className, children, ...rest }: LinkButtonProps) {
  return (
    <Link
      {...rest}
      className={`${linkVariantClass[variant]} no-underline ${className ?? ''}`}
    >
      {children}
    </Link>
  );
}
