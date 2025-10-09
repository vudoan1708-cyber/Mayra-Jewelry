import type { HTMLAttributes, MouseEventHandler, Ref } from 'react';

type ButtonProps = {
  variant: 'primary' | 'tertiary' | 'secondary' | 'circle',
  ref?: Ref<HTMLButtonElement>,
  className?: HTMLAttributes<HTMLButtonElement>['className'],
  tooltip?: string,
  onClick: MouseEventHandler,
  children: React.ReactNode,
};

export default function Button({ ref, variant, className, tooltip, onClick, children }: ButtonProps) {
  const patchOnClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    onClick(e);
  };
  if (variant === 'primary') {
    return (
      <button ref={ref} title={tooltip} onClick={patchOnClick} className={`flex justify-center gap-1 bg-brand-500 text-white transition-all hover:shadow-[2px_2px_5px_var(--brand-400)] ${className}`}>
        {children}
      </button>
    )
  }
  if (variant === 'tertiary') {
    return (
      <button ref={ref} title={tooltip} onClick={patchOnClick} className={`flex justify-center gap-1 bg-transparent border-none outline-none active:border-none focus:outline-none hover:text-brand-400 transition-all ${className}`}>
        {children}
      </button>
    )
  }
  if (variant === 'secondary') {
    return (
      <button ref={ref} title={tooltip} onClick={patchOnClick} className={`flex justify-center gap-1 bg-transparent border border-brand-500 outline-none active:border-1 focus:outline-1 hover:text-brand-400 hover:border-brand-400 transition-all ${className}`}>
        {children}
      </button>
    )
  }
  if (variant === 'circle') {
    return (
      <button ref={ref} title={tooltip} onClick={patchOnClick} className={`flex justify-center items-center gap-1 bg-brand-500 text-white transition-all hover:shadow-[2px_2px_5px_var(--brand-400)] rounded-[50%] w-5 h-5 ${className}`}>
        {children}
      </button>
    )
  }
}
