import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function DsCard({ title, subtitle, children, className = '' }: CardProps) {
  return (
    <article className={`ds-card ${className}`.trim()}>
      {(title || subtitle) && (
        <header className="ds-card-header">
          {title && <h3>{title}</h3>}
          {subtitle && <p>{subtitle}</p>}
        </header>
      )}
      {children}
    </article>
  )
}
