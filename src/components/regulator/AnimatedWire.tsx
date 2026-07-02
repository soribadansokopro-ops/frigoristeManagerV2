import { motion } from 'framer-motion'

interface AnimatedWireProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
  color: string
  active: boolean
  onHover: (hovered: boolean) => void
}

const toPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
  const controlOffset = Math.max(30, Math.abs(to.x - from.x) * 0.35)
  const c1x = from.x + (from.x <= to.x ? controlOffset : -controlOffset)
  const c2x = to.x - (from.x <= to.x ? controlOffset : -controlOffset)
  return `M ${from.x} ${from.y} C ${c1x} ${from.y}, ${c2x} ${to.y}, ${to.x} ${to.y}`
}

export function AnimatedWire({ from, to, color, active, onHover }: AnimatedWireProps) {
  const path = toPath(from, to)

  return (
    <g onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={active ? 4 : 2.2}
        strokeOpacity={active ? 1 : 0.75}
        style={{ filter: active ? `drop-shadow(0 0 9px ${color})` : 'none' }}
      />

      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={active ? 2.2 : 1.2}
        strokeDasharray="9 11"
        strokeLinecap="round"
        animate={{ strokeDashoffset: active ? [0, -72] : [0, -36], opacity: active ? [0.45, 1, 0.45] : [0.25, 0.55, 0.25] }}
        transition={{ duration: active ? 1 : 1.8, repeat: Infinity, ease: 'linear' }}
      />
    </g>
  )
}
