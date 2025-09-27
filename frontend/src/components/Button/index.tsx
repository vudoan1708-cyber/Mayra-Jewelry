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
      <button onClick={onClick} className={`bg-brand-500 text-white ${className}`}>
        {children}
      </button>
    )
  }
  if (variant === 'tertiary') {
    return (
      <button onClick={onClick} className={`bg-transparent border-0 active:border-none focus:outline-none hover:text-brand-500 ${className}`}>
        {children}
      </button>
    )
  }
}
