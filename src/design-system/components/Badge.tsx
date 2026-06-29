import type { ReactNode } from 'react'

interface BadgeProps {
  tone?: 'neutral' | 'ok' | 'warn' | 'fault'
  children: ReactNode
}

export function DsBadge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={`ds-badge is-${tone}`}>{children}</span>
}
