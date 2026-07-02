import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { fadeInSlideUp } from '../motion'

interface CardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'subtle'
}

interface CardSectionProps {
  children: ReactNode
  className?: string
}

type CompoundCard = ((props: CardProps) => ReactNode) & {
  Header: (props: CardSectionProps) => ReactNode
  Content: (props: CardSectionProps) => ReactNode
  Actions: (props: CardSectionProps) => ReactNode
}

const DsCardBase = ({ title, subtitle, children, className = '', variant = 'default' }: CardProps) => {
  return (
    <motion.article
      className={`ds-card is-${variant} ${className}`.trim()}
      initial={fadeInSlideUp.initial}
      animate={fadeInSlideUp.animate}
      transition={fadeInSlideUp.transition}
    >
      {(title || subtitle) && (
        <header className="ds-card-header">
          {title && <h3>{title}</h3>}
          {subtitle && <p>{subtitle}</p>}
        </header>
      )}
      {children}
    </motion.article>
  )
}

const Header = ({ children, className = '' }: CardSectionProps) => (
  <header className={`ds-card-header ${className}`.trim()}>{children}</header>
)

const Content = ({ children, className = '' }: CardSectionProps) => (
  <div className={`ds-card-content ${className}`.trim()}>{children}</div>
)

const Actions = ({ children, className = '' }: CardSectionProps) => (
  <footer className={`ds-card-actions ${className}`.trim()}>{children}</footer>
)

export const DsCard = DsCardBase as CompoundCard
DsCard.Header = Header
DsCard.Content = Content
DsCard.Actions = Actions
