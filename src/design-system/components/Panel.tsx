import type { ReactNode } from 'react'

interface PanelProps {
  label: string
  value: string
  state?: 'neutral' | 'ok' | 'warn' | 'fault'
  children?: ReactNode
}

export function DsPanel({ label, value, state = 'neutral', children }: PanelProps) {
  return (
    <section className={`ds-panel is-${state}`}>
      <small>{label}</small>
      <strong>{value}</strong>
      {children}
    </section>
  )
}
