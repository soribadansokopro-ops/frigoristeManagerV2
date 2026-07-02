import type { ReactNode } from 'react'
import { DsBadge } from './Badge'
import { DsCard } from './Card'
import { DsProgressBar } from './ProgressBar'

interface MissionCardProps {
  title: string
  description: string
  statusLabel: string
  statusTone?: 'neutral' | 'ok' | 'warn' | 'fault'
  progress?: number
  actions?: ReactNode
  children?: ReactNode
}

export function DsMissionCard({
  title,
  description,
  statusLabel,
  statusTone = 'neutral',
  progress,
  actions,
  children,
}: MissionCardProps) {
  return (
    <DsCard variant="elevated">
      <DsCard.Header>
        <h3>{title}</h3>
        <p>{description}</p>
      </DsCard.Header>
      <DsCard.Content>
        {children}
        <DsBadge tone={statusTone}>{statusLabel}</DsBadge>
        {typeof progress === 'number' && <DsProgressBar value={progress} label="Progression mission" tone={statusTone} />}
      </DsCard.Content>
      {actions && <DsCard.Actions>{actions}</DsCard.Actions>}
    </DsCard>
  )
}
