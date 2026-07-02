import type { ReactNode } from 'react'

interface TooltipProps {
  content: string
  children: ReactNode
  className?: string
}

export function DsTooltip({ content, children, className = '' }: TooltipProps) {
  return (
    <span className={`ds-tooltip ${className}`.trim()}>
      {children}
      <span className="ds-tooltip-bubble" role="tooltip">
        {content}
      </span>
    </span>
  )
}
