import type { ElementType, ReactNode } from 'react'

type TextTone = 'main' | 'soft' | 'ok' | 'warn' | 'fault'

type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'caption'
  | 'small'

interface TextProps {
  as?: ElementType
  variant?: TextVariant
  tone?: TextTone
  children: ReactNode
  className?: string
}

export function DsText({ as = 'p', variant = 'body', tone = 'main', children, className = '' }: TextProps) {
  const Tag = as
  return <Tag className={`ds-text is-${variant} tone-${tone} ${className}`.trim()}>{children}</Tag>
}
