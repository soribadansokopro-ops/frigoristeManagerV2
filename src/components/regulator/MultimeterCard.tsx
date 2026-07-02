import { Activity, RotateCcw } from 'lucide-react'
import type { RegulatorTerminal } from '../../types/regulator'

interface MultimeterCardProps {
  terminals: RegulatorTerminal[]
  selectedTerminalA: string | null
  selectedTerminalB: string | null
  measuredVoltage: number | null
  onSelectTerminal: (terminalId: string) => void
  onClear: () => void
}

export function MultimeterCard({
  terminals,
  selectedTerminalA,
  selectedTerminalB,
  measuredVoltage,
  onSelectTerminal,
  onClear,
}: MultimeterCardProps) {
  const terminalA = terminals.find((terminal) => terminal.id === selectedTerminalA) ?? null
  const terminalB = terminals.find((terminal) => terminal.id === selectedTerminalB) ?? null

  return (
    <article className="rounded-2xl border border-white/10 bg-[#111827] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-['Inter'] text-sm font-semibold uppercase tracking-[0.08em] text-slate-200">Mode multimetre</h3>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-slate-300 transition duration-150 hover:border-blue-500/55"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-[#0B0F14] p-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Activity size={14} className="text-blue-400" />
          Selectionnez 2 bornes pour mesurer la tension
        </div>

        <div className="mt-3 grid gap-2">
          <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200">
            Pointe A: {terminalA ? `${terminalA.code} (${terminalA.number})` : '-'}
          </div>
          <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200">
            Pointe B: {terminalB ? `${terminalB.code} (${terminalB.number})` : '-'}
          </div>
          <div className="rounded-lg border border-blue-500/45 bg-blue-500/10 px-3 py-2 text-sm text-blue-200">
            Tension mesuree: {measuredVoltage !== null ? `${measuredVoltage.toFixed(1)} V` : '--.- V'}
          </div>
        </div>
      </div>

      <div className="mt-3 grid max-h-[280px] gap-2 overflow-auto pr-1">
        {terminals.map((terminal) => {
          const isSelected = terminal.id === selectedTerminalA || terminal.id === selectedTerminalB
          return (
            <button
              key={terminal.id}
              type="button"
              onClick={() => onSelectTerminal(terminal.id)}
              className={`rounded-xl border px-3 py-2 text-left transition duration-150 ${
                isSelected
                  ? 'border-blue-500/65 bg-blue-500/15 shadow-[0_0_16px_rgba(59,130,246,0.35)]'
                  : 'border-white/10 bg-black/20 hover:border-blue-500/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <strong className="font-['Inter'] text-sm text-slate-100">{terminal.code} = {terminal.number}</strong>
                <span className="h-2.5 w-7 rounded-full" style={{ backgroundColor: terminal.color }} />
              </div>
              <p className="mt-1 font-['Inter'] text-xs text-slate-400">{terminal.label}</p>
            </button>
          )
        })}
      </div>
    </article>
  )
}
