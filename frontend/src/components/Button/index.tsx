import type { MouseEventHandler } from "react";

type ButtonProps = {
  variant: 'primary' | 'tertiary',
  onClick: MouseEventHandler,
  children: React.ReactNode,
}

export default function Button({ variant, onClick, children }: ButtonProps) {
  if (variant === 'primary') {
    return (
      <button onClick={onClick} className="bg-brand-500 text-white">
        {children}
      </button>
    )
  }
  if (variant === 'tertiary') {
    return (
      <button onClick={onClick} className="bg-transparent text-brand-500 border-0 hover:bg-transparent">
        {children}
      </button>
    )
  }
}
