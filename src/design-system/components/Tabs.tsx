import { motion } from 'framer-motion'
import { fadeInSlideUp } from '../motion'

export interface DsTabItem {
  id: string
  label: string
  disabled?: boolean
}

interface TabsProps {
  items: DsTabItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

export function DsTabs({ items, activeId, onChange, className = '' }: TabsProps) {
  return (
    <motion.nav
      className={`ds-tabs ${className}`.trim()}
      role="tablist"
      aria-label="Navigation"
      initial={fadeInSlideUp.initial}
      animate={fadeInSlideUp.animate}
      transition={fadeInSlideUp.transition}
    >
      {items.map((item) => {
        const active = item.id === activeId
        return (
          <button
            key={item.id}
            type="button"
            className={`ds-tab ${active ? 'is-active' : ''}`.trim()}
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        )
      })}
    </motion.nav>
  )
}
