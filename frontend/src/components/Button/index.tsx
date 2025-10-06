import type { HTMLAttributes, MouseEventHandler, Ref } from 'react';

type ButtonProps = {
  variant: 'primary' | 'tertiary',
  ref?: Ref<HTMLButtonElement>,
  className?: HTMLAttributes<HTMLButtonElement>['className'],
  onClick: MouseEventHandler,
  children: React.ReactNode,
};

export default function Button({ ref, variant, className, onClick, children }: ButtonProps) {
  if (variant === 'primary') {
    return (
      <button ref={ref} onClick={onClick} className={`flex justify-center gap-1 bg-brand-500 text-white transition-all hover:shadow-[2px_2px_5px_var(--brand-400)] ${className}`}>
        {children}
      </button>
    )
  }
  if (variant === 'tertiary') {
    return (
      <button ref={ref} onClick={onClick} className={`flex justify-center gap-1 bg-transparent border-none outline-none active:border-none focus:outline-none hover:text-brand-500 transition-all ${className}`}>
        {children}
      </button>
    )
  }
}
