import { motion } from 'framer-motion'
import type { RegulatorOutputState } from '../../types/regulator'

interface OutputCardProps {
  output: RegulatorOutputState
  onClick: () => void
  onHover: (hovered: boolean) => void
}

export function OutputCard({ output, onClick, onHover }: OutputCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={output.isPulsing ? { boxShadow: ['0 0 0 rgba(34,197,94,0)', '0 0 26px rgba(34,197,94,0.65)', '0 0 0 rgba(34,197,94,0)'] } : {}}
      transition={{ duration: 0.7 }}
      className={`rounded-2xl border px-4 py-3 text-left transition duration-150 ${
        output.isOn
          ? 'border-emerald-500/60 bg-emerald-500/10'
          : 'border-white/10 bg-black/25 hover:border-blue-500/55'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <strong className="font-['Inter'] text-base text-slate-100">{output.label}</strong>
        <span className={`rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] ${output.isOn ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700/50 text-slate-300'}`}>
          {output.isOn ? 'ON' : 'OFF'}
        </span>
      </div>
      <p className="mt-1 font-['Inter'] text-xs text-slate-400">{output.description}</p>
    </motion.button>
  )
}
