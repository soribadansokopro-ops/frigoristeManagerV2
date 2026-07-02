import { Cog, RotateCcw, Snowflake, Zap } from 'lucide-react'

interface QuickActionsCardProps {
  onSetpointAdjust: (delta: number) => void
  onForceDefrost: () => void
  onTestOutputs: () => void
  onResetAlarms: () => void
}

export function QuickActionsCard({
  onSetpointAdjust,
  onForceDefrost,
  onTestOutputs,
  onResetAlarms,
}: QuickActionsCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#111827] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
      <h3 className="font-['Inter'] text-sm font-semibold uppercase tracking-[0.08em] text-slate-200">Actions rapides</h3>

      <div className="mt-3 grid gap-2">
        <button
          type="button"
          onClick={() => onSetpointAdjust(-0.5)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-left text-sm text-slate-200 transition duration-150 hover:border-blue-500/60 hover:shadow-[0_0_16px_rgba(59,130,246,0.35)]"
        >
          <Cog size={16} className="text-blue-400" />
          Modifier consigne (-0.5 C)
        </button>

        <button
          type="button"
          onClick={onForceDefrost}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-left text-sm text-slate-200 transition duration-150 hover:border-orange-500/60 hover:shadow-[0_0_16px_rgba(245,158,11,0.35)]"
        >
          <Snowflake size={16} className="text-orange-400" />
          Forcer degivrage
        </button>

        <button
          type="button"
          onClick={onTestOutputs}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-left text-sm text-slate-200 transition duration-150 hover:border-emerald-500/60 hover:shadow-[0_0_16px_rgba(34,197,94,0.35)]"
        >
          <Zap size={16} className="text-emerald-400" />
          Tester sorties
        </button>

        <button
          type="button"
          onClick={onResetAlarms}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-left text-sm text-slate-200 transition duration-150 hover:border-red-500/60 hover:shadow-[0_0_16px_rgba(239,68,68,0.35)]"
        >
          <RotateCcw size={16} className="text-red-400" />
          Reinitialiser alarmes
        </button>
      </div>
    </article>
  )
}
