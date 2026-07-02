import type { RegulatorParameter } from '../../types/regulator'

interface ParametersCardProps {
  parameters: RegulatorParameter[]
}

export function ParametersCard({ parameters }: ParametersCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#111827] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
      <h3 className="font-['Inter'] text-sm font-semibold uppercase tracking-[0.08em] text-slate-200">Parametres</h3>
      <div className="mt-3 grid gap-2">
        {parameters.map((parameter) => (
          <div key={parameter.id} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <small className="font-['Inter'] text-[11px] uppercase tracking-[0.07em] text-slate-400">{parameter.label}</small>
            <strong className="mt-0.5 block font-['Inter'] text-sm text-slate-100">{parameter.value}</strong>
          </div>
        ))}
      </div>
    </article>
  )
}
