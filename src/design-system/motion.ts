import type { TargetAndTransition } from 'framer-motion'

export const motionDurations = {
  fast: 0.14,
  base: 0.2,
  slow: 0.32,
} as const

export const fadeInSlideUp = {
  initial: { opacity: 0, y: 8 } as TargetAndTransition,
  animate: { opacity: 1, y: 0 } as TargetAndTransition,
  exit: { opacity: 0, y: 6 } as TargetAndTransition,
  transition: { duration: motionDurations.base, ease: 'easeOut' } as const,
}

export const fadeInSlideLeft = {
  initial: { opacity: 0, x: 10 } as TargetAndTransition,
  animate: { opacity: 1, x: 0 } as TargetAndTransition,
  exit: { opacity: 0, x: -8 } as TargetAndTransition,
  transition: { duration: motionDurations.base, ease: 'easeOut' } as const,
}

export const fadeInScale = {
  initial: { opacity: 0, y: 10, scale: 0.99 } as TargetAndTransition,
  animate: { opacity: 1, y: 0, scale: 1 } as TargetAndTransition,
  exit: { opacity: 0, y: 8, scale: 0.99 } as TargetAndTransition,
  transition: { duration: motionDurations.base, ease: 'easeOut' } as const,
}

export const scalePop = {
  initial: { opacity: 0, scale: 0.96 } as TargetAndTransition,
  animate: { opacity: 1, scale: 1 } as TargetAndTransition,
  transition: { duration: motionDurations.fast, ease: 'easeOut' } as const,
}

export const hoverLift = {
  whileHover: { y: -2, scale: 1.01 } as TargetAndTransition,
  whileTap: { scale: 0.99 } as TargetAndTransition,
  transition: { duration: motionDurations.fast } as const,
}

export const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 0 rgba(55,183,255,0)',
      '0 0 14px rgba(55,183,255,0.26)',
      '0 0 0 rgba(55,183,255,0)',
    ],
  } as TargetAndTransition,
  transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const },
}

export const shakeError = {
  animate: {
    x: [0, -4, 4, -3, 3, 0],
  } as TargetAndTransition,
  transition: { duration: 0.34, ease: 'easeOut' as const },
}

export const successBurst = {
  initial: { opacity: 0, y: 12, scale: 0.98 } as TargetAndTransition,
  animate: { opacity: 1, y: 0, scale: 1 } as TargetAndTransition,
  transition: { duration: motionDurations.slow, ease: 'easeOut' as const },
}
