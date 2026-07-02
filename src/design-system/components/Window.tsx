import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { DsButton } from './Button'
import { fadeInScale } from '../motion'

interface WindowProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  open?: boolean
  onClose?: () => void
  className?: string
}

interface WindowSectionProps {
  children: ReactNode
  className?: string
}

type CompoundWindow = ((props: WindowProps) => ReactNode) & {
  Header: (props: WindowSectionProps) => ReactNode
  Body: (props: WindowSectionProps) => ReactNode
  Footer: (props: WindowSectionProps) => ReactNode
}

const DsWindowBase = ({ title, subtitle, children, footer, open = true, onClose, className = '' }: WindowProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.section
          className={`ds-window ${className}`.trim()}
          initial={fadeInScale.initial}
          animate={fadeInScale.animate}
          exit={fadeInScale.exit}
          transition={fadeInScale.transition}
        >
          <header className="ds-window-header">
            <div>
              <h3>{title}</h3>
              {subtitle && <p>{subtitle}</p>}
            </div>
            {onClose && (
              <DsButton variant="ghost" size="icon" aria-label="Fermer" onClick={onClose}>
                <X size={16} />
              </DsButton>
            )}
          </header>

          <div className="ds-window-body">{children}</div>

          {footer && <footer className="ds-window-footer">{footer}</footer>}
        </motion.section>
      )}
    </AnimatePresence>
  )
}

const Header = ({ children, className = '' }: WindowSectionProps) => (
  <header className={`ds-window-header ${className}`.trim()}>{children}</header>
)

const Body = ({ children, className = '' }: WindowSectionProps) => (
  <div className={`ds-window-body ${className}`.trim()}>{children}</div>
)

const Footer = ({ children, className = '' }: WindowSectionProps) => (
  <footer className={`ds-window-footer ${className}`.trim()}>{children}</footer>
)

export const DsWindow = DsWindowBase as CompoundWindow
DsWindow.Header = Header
DsWindow.Body = Body
DsWindow.Footer = Footer
