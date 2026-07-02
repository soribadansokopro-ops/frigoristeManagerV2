import { CircleHelp, ChevronLeft } from 'lucide-react'
import type { InstallationDefinition, InstallationRuntime } from '../types/game'
import { RegulatorPanel } from '../components/regulator/RegulatorPanel'

interface RegulatorPageProps {
  installation: InstallationDefinition
  runtime: InstallationRuntime
  onBack: () => void
}

export function RegulatorPage({ installation, runtime, onBack }: RegulatorPageProps) {
  return (
    <section className="min-h-[calc(100dvh-120px)] rounded-2xl border border-white/10 bg-[#0B0F14] p-4 shadow-[0_16px_34px_rgba(0,0,0,0.45)]">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#111827] px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2 font-['Inter'] text-sm text-slate-100 transition duration-150 hover:border-blue-500/60 hover:shadow-[0_0_14px_rgba(59,130,246,0.35)]"
          >
            <ChevronLeft size={16} />
            Retour
          </button>

          <div>
            <h1 className="font-['Inter'] text-xl font-semibold uppercase tracking-[0.08em] text-slate-100">Regulateur</h1>
            <p className="font-['Inter'] text-sm text-slate-400">Controle et diagnostic du regulateur - {installation.model}</p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2 font-['Inter'] text-sm text-slate-200 transition duration-150 hover:border-blue-500/60 hover:shadow-[0_0_14px_rgba(59,130,246,0.35)]"
        >
          <CircleHelp size={16} className="text-blue-400" />
          Aide
        </button>
      </header>

      <RegulatorPanel installation={installation} runtime={runtime} />
    </section>
  )
}
