import type { RegulatorInfoItem, RegulatorErrorCode, LegendItem } from '../../types/regulator'
import { ErrorCodesCard } from './ErrorCodesCard'
import { TooltipLegend } from './TooltipLegend'

interface InformationPanelProps {
  infoItems: RegulatorInfoItem[]
  errors: RegulatorErrorCode[]
  legendItems: LegendItem[]
}

export function InformationPanel({ infoItems, errors, legendItems }: InformationPanelProps) {
  return (
    <aside className="grid gap-4">
      <article className="rounded-2xl border border-white/10 bg-[#111827] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
        <h3 className="font-['Inter'] text-sm font-semibold uppercase tracking-[0.08em] text-slate-200">Informations</h3>
        <div className="mt-3 grid gap-2">
          {infoItems.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <small className="font-['Inter'] text-[11px] uppercase tracking-[0.07em] text-slate-400">{item.label}</small>
              <strong className="mt-0.5 block font-['Inter'] text-sm text-slate-100">{item.value}</strong>
            </div>
          ))}
        </div>
      </article>

      <ErrorCodesCard errors={errors} />
      <TooltipLegend items={legendItems} />
    </aside>
  )
}
