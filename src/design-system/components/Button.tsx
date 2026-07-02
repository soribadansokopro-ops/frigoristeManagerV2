import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { hoverLift } from '../motion'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type ButtonSize = 'md' | 'icon'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  to?: string
  ariaLabel?: string
  loading?: boolean
}

export function DsButton({
  children,
  variant = 'primary',
  size = 'md',
  to,
  ariaLabel,
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const classes = `ds-button is-${variant} is-${size} ${className}`.trim()

  if (to) {
    return (
      <motion.div whileHover={hoverLift.whileHover} whileTap={hoverLift.whileTap} transition={hoverLift.transition}>
        <Link to={to} className={classes} aria-label={ariaLabel}>
          {children}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button
      type="button"
      className={classes}
      aria-label={ariaLabel}
      aria-busy={loading}
      data-state={loading ? 'loading' : 'idle'}
      whileHover={hoverLift.whileHover}
      whileTap={hoverLift.whileTap}
      transition={hoverLift.transition}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="ds-button-spinner" aria-hidden="true" />}
      {children}
    </motion.button>
  )
}
