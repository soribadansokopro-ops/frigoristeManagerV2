import { motion } from 'framer-motion'
import { fadeInSlideUp, pulseGlow } from '../motion'

interface HUDStatProps {
  label: string
  value: string
  tone?: 'neutral' | 'ok' | 'warn' | 'fault'
}

export function DsHUDStat({ label, value, tone = 'neutral' }: HUDStatProps) {
  const animated = tone === 'warn' || tone === 'fault'

  return (
    <motion.article
      className={`ds-hud-stat is-${tone}`}
      initial={fadeInSlideUp.initial}
      animate={animated ? pulseGlow.animate : fadeInSlideUp.animate}
      transition={animated ? pulseGlow.transition : fadeInSlideUp.transition}
    >
      <small>{label}</small>
      <strong>{value}</strong>
    </motion.article>
  )
}
