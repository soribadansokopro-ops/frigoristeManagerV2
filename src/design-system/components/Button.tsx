import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'danger'
}

export function DsButton({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`ds-button ${variant !== 'primary' ? `is-${variant}` : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}
