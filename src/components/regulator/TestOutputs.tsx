import type { RegulatorOutputId, RegulatorOutputState } from '../../types/regulator'
import { OutputCard } from './OutputCard'

interface TestOutputsProps {
  outputs: RegulatorOutputState[]
  onTestOutput: (outputId: RegulatorOutputId) => void
  onHoverOutput: (outputId: RegulatorOutputId | null) => void
}

export function TestOutputs({ outputs, onTestOutput, onHoverOutput }: TestOutputsProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#111827] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
      <header className="mb-3">
        <h3 className="font-['Inter'] text-sm font-semibold uppercase tracking-[0.08em] text-slate-200">Test des sorties</h3>
      </header>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {outputs.map((output) => (
          <OutputCard
            key={output.id}
            output={output}
            onClick={() => onTestOutput(output.id)}
            onHover={(hovered) => onHoverOutput(hovered ? output.id : null)}
          />
        ))}
      </div>
    </article>
  )
}
