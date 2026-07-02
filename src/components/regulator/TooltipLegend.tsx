import type { LegendItem } from '../../types/regulator'

interface TooltipLegendProps {
  items: LegendItem[]
}

export function TooltipLegend({ items }: TooltipLegendProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#111827] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
      <h3 className="font-['Inter'] text-sm font-semibold uppercase tracking-[0.08em] text-slate-200">Legende cables</h3>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <span className="h-2.5 w-8 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-['Inter'] text-xs text-slate-300">{item.label}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}
