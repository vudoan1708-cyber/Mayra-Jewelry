import type { HTMLAttributes, MouseEventHandler, Ref } from 'react';

import { motion, type Transition } from 'framer-motion';

type ButtonProps = {
  variant: 'primary' | 'tertiary' | 'secondary' | 'circle',
  disabled?: boolean,
  ref?: Ref<HTMLButtonElement>,
  className?: HTMLAttributes<HTMLButtonElement>['className'],
  tooltip?: string,
  transitionOption?: Transition<any> | undefined,
  onClick: MouseEventHandler,
  children: React.ReactNode,
};

export default function Button({ ref, variant, disabled, className, tooltip, transitionOption, onClick, children }: ButtonProps) {
  const patchOnClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    onClick(e);
  };
  if (variant === 'primary') {
    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: transitionOption }}
        ref={ref}
        title={tooltip}
        onClick={patchOnClick}
        disabled={disabled}
        className={`flex justify-center gap-1 bg-brand-500 text-white transition-all hover:shadow-[2px_2px_5px_var(--brand-400)] ${className}`}>
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
        title={tooltip}
        onClick={patchOnClick}
        disabled={disabled}
        className={`flex justify-center gap-1 bg-transparent border-none outline-none active:border-none focus:outline-none hover:text-brand-400 transition-all ${className}`}>
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
        title={tooltip}
        onClick={patchOnClick}
        className={`flex justify-center gap-1 bg-transparent border border-brand-500 outline-none active:border-1 focus:outline-1 hover:text-brand-400 hover:border-brand-400 transition-all ${className}`}>
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
        title={tooltip}
        onClick={patchOnClick}
        disabled={disabled}
        className={`flex justify-center items-center gap-1 bg-brand-500 text-white transition-all hover:shadow-[2px_2px_5px_var(--brand-400)] rounded-[50%] w-5 h-5 ${className}`}>
        {children}
      </motion.button>
    )
  }
}
