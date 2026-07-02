import { motion } from 'framer-motion'

interface StatusCardProps {
  statusText: string
  statusTone: 'ok' | 'warn' | 'fault'
  currentTemperature: number
}

const toneMap = {
  ok: {
    led: 'bg-emerald-400 shadow-[0_0_14px_rgba(34,197,94,0.9)]',
    text: 'text-emerald-300',
    badge: 'border-emerald-500/45 bg-emerald-500/10 text-emerald-200',
  },
  warn: {
    led: 'bg-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.9)]',
    text: 'text-amber-300',
    badge: 'border-amber-500/45 bg-amber-500/10 text-amber-200',
  },
  fault: {
    led: 'bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.9)]',
    text: 'text-red-300',
    badge: 'border-red-500/45 bg-red-500/10 text-red-200',
  },
} as const

export function StatusCard({ statusText, statusTone, currentTemperature }: StatusCardProps) {
  const tone = toneMap[statusTone]

  return (
    <article className="rounded-2xl border border-white/10 bg-[#111827] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
      <h3 className="font-['Inter'] text-sm font-semibold uppercase tracking-[0.08em] text-slate-200">Etat du regulateur</h3>

      <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-['Inter'] text-xs uppercase tracking-[0.08em] text-slate-400">Ecran numerique</span>
          <motion.span
            className={`h-3.5 w-3.5 rounded-full ${tone.led}`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="rounded-lg border border-cyan-500/40 bg-[#05090E] px-3 py-2 text-center">
          <strong className="font-mono text-3xl text-cyan-300">{currentTemperature.toFixed(1)}C</strong>
        </div>

        <div className={`mt-3 rounded-lg border px-3 py-2 font-['Inter'] text-sm ${tone.badge}`}>
          <span className={tone.text}>{statusText}</span>
        </div>
      </div>
    </article>
  )
}
