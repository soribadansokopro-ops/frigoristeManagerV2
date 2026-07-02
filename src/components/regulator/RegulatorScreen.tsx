import { motion } from 'framer-motion'
import type { RegulatorConnection, RegulatorOutputId, RegulatorOutputState, RegulatorTerminal } from '../../types/regulator'
import { WireDiagram } from './WireDiagram'

interface RegulatorScreenProps {
  connections: RegulatorConnection[]
  outputs: RegulatorOutputState[]
  terminals: RegulatorTerminal[]
  selectedTerminalA: string | null
  selectedTerminalB: string | null
  hoveredConnectionId: string | null
  hoveredOutputId: RegulatorOutputId | null
  onHoverConnection: (id: string | null) => void
  onSelectTerminal: (terminalId: string) => void
}

export function RegulatorScreen({
  connections,
  outputs,
  terminals,
  selectedTerminalA,
  selectedTerminalB,
  hoveredConnectionId,
  hoveredOutputId,
  onHoverConnection,
  onSelectTerminal,
}: RegulatorScreenProps) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111827] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
      <header className="mb-3">
        <h3 className="font-['Inter'] text-sm font-semibold uppercase tracking-[0.08em] text-slate-200">Schema regulateur XR44CH</h3>
      </header>

      <div className="relative rounded-xl border border-white/10 bg-[#0B0F14] p-4">
        <img
          src="/assets/background/real/dark-tech-bg.png"
          alt="Fond technique"
          className="pointer-events-none absolute inset-0 h-full w-full rounded-xl object-cover opacity-22"
        />
        <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

        <motion.img
          src="/assets/regulator/real/regulator-panel-full.png"
          alt="Panneau regulateur complet"
          className="relative z-[1] mx-auto w-full max-w-[1040px] rounded-xl border border-white/10 object-contain shadow-[0_20px_42px_rgba(0,0,0,0.46)]"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />

        <WireDiagram
          connections={connections}
          outputs={outputs}
          terminals={terminals}
          selectedTerminalA={selectedTerminalA}
          selectedTerminalB={selectedTerminalB}
          hoveredConnectionId={hoveredConnectionId}
          hoveredOutputId={hoveredOutputId}
          onHoverConnection={onHoverConnection}
          onSelectTerminal={onSelectTerminal}
        />
      </div>
    </article>
  )
}
