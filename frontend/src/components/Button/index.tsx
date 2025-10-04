import type { HTMLAttributes, MouseEventHandler } from 'react';

type ButtonProps = {
  variant: 'primary' | 'tertiary',
  className?: HTMLAttributes<HTMLButtonElement>['className'],
  onClick: MouseEventHandler,
  children: React.ReactNode,
};

export default function Button({ variant, className, onClick, children }: ButtonProps) {
  if (variant === 'primary') {
    return (
      <button onClick={onClick} className={`flex justify-center gap-1 bg-brand-500 text-white transition-all ${className}`}>
        {children}
      </button>
    )
  }
  if (variant === 'tertiary') {
    return (
      <button onClick={onClick} className={`flex justify-center gap-1 bg-transparent border-none outline-none active:border-none focus:outline-none hover:text-brand-500 transition-all ${className}`}>
        {children}
      </button>
    )
  }
}
