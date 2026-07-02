import type { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
}

interface StackProps {
  children: ReactNode
  gap?: 4 | 8 | 16 | 24 | 32 | 48 | 64
  className?: string
}

interface SpacerProps {
  size?: 4 | 8 | 16 | 24 | 32 | 48 | 64
}

interface GridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 4 | 8 | 16 | 24 | 32 | 48 | 64
  className?: string
}

interface SectionProps {
  children: ReactNode
  className?: string
}

interface SidebarProps {
  children: ReactNode
  className?: string
}

interface PanelProps {
  children: ReactNode
  className?: string
}

const gapClassByValue: Record<NonNullable<StackProps['gap']>, string> = {
  4: 'gap-1',
  8: 'gap-2',
  16: 'gap-4',
  24: 'gap-6',
  32: 'gap-8',
  48: 'gap-12',
  64: 'gap-16',
}

const spacerClassBySize: Record<NonNullable<SpacerProps['size']>, string> = {
  4: 'h-1',
  8: 'h-2',
  16: 'h-4',
  24: 'h-6',
  32: 'h-8',
  48: 'h-12',
  64: 'h-16',
}

const gridClassByColumns: Record<NonNullable<GridProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
}

export function DsContainer({ children, className = '' }: ContainerProps) {
  return <div className={`mx-auto w-full max-w-[1280px] ${className}`.trim()}>{children}</div>
}

export function DsStack({ children, gap = 16, className = '' }: StackProps) {
  return <div className={`grid ${gapClassByValue[gap]} ${className}`.trim()}>{children}</div>
}

export function DsSpacer({ size = 16 }: SpacerProps) {
  return <div aria-hidden="true" className={spacerClassBySize[size]} />
}

export function DsGrid({ children, columns = 2, gap = 16, className = '' }: GridProps) {
  return <div className={`grid ${gridClassByColumns[columns]} ${gapClassByValue[gap]} ${className}`.trim()}>{children}</div>
}

export function DsSection({ children, className = '' }: SectionProps) {
  return <section className={`ds-layout-section ${className}`.trim()}>{children}</section>
}

export function DsSidebar({ children, className = '' }: SidebarProps) {
  return <aside className={`ds-layout-sidebar ${className}`.trim()}>{children}</aside>
}

export function DsLayoutPanel({ children, className = '' }: PanelProps) {
  return <div className={`ds-layout-panel ${className}`.trim()}>{children}</div>
}
