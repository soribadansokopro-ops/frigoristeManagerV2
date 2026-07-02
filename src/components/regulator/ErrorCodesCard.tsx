import type { RegulatorErrorCode } from '../../types/regulator'

interface ErrorCodesCardProps {
  errors: RegulatorErrorCode[]
}

const toneClass: Record<RegulatorErrorCode['severity'], string> = {
  ok: 'border-emerald-500/45 text-emerald-300',
  warn: 'border-amber-500/45 text-amber-300',
  fault: 'border-red-500/50 text-red-300',
}

export function ErrorCodesCard({ errors }: ErrorCodesCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#111827] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
      <h3 className="font-['Inter'] text-sm font-semibold uppercase tracking-[0.08em] text-slate-200">Codes erreurs</h3>
      <div className="mt-3 grid gap-2">
        {errors.map((error) => (
          <div key={error.code} className={`rounded-xl border bg-black/25 px-3 py-2 ${toneClass[error.severity]}`}>
            <div className="flex items-center justify-between gap-3">
              <strong className="font-['Inter'] text-sm">{error.code}</strong>
              <span className="text-xs opacity-90">{error.title}</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}
