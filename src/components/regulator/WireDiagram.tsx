import { motion } from 'framer-motion'
import type { RegulatorConnection, RegulatorOutputId, RegulatorOutputState, RegulatorTerminal } from '../../types/regulator'
import { AnimatedWire } from './AnimatedWire'

interface WireDiagramProps {
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

const points: Record<string, { x: number; y: number }> = {
  pwr: { x: 29, y: 37 },
  s1: { x: 61, y: 36 },
  s2: { x: 61, y: 42 },
  modbus: { x: 62, y: 48 },
  comp: { x: 37, y: 44 },
  fan: { x: 44, y: 44 },
  defrost: { x: 50, y: 44 },
  alarm: { x: 56, y: 44 },
  'supply-node': { x: 12, y: 35 },
  'compressor-node': { x: 17, y: 79 },
  'fan-node': { x: 52, y: 79 },
  'defrost-node': { x: 35, y: 79 },
  'alarm-node': { x: 68, y: 79 },
  'sensor1-node': { x: 82, y: 28 },
  'sensor2-node': { x: 82, y: 40 },
  'com-node': { x: 82, y: 72 },
  'pwr-l': { x: 28, y: 35.4 },
  'pwr-n': { x: 30.4, y: 35.4 },
  'comp-c': { x: 36, y: 44 },
  'comp-o1': { x: 39.2, y: 44 },
  'fan-o2': { x: 45.5, y: 44 },
  'defrost-o3': { x: 51.8, y: 44 },
  'alarm-o4': { x: 56.9, y: 44 },
  's1-terminal': { x: 61, y: 36 },
  's2-terminal': { x: 61, y: 42 },
  'com-terminal': { x: 61.8, y: 47.8 },
}

const labelByNode: Record<string, { title: string; subtitle?: string; align?: 'left' | 'right' | 'center' }> = {
  'supply-node': { title: 'Alimentation', subtitle: '230V~', align: 'left' },
  'compressor-node': { title: 'Compresseur', subtitle: 'Sortie 1', align: 'center' },
  'defrost-node': { title: 'Degivrage', subtitle: 'Sortie 2', align: 'center' },
  'fan-node': { title: 'Ventilateurs', subtitle: 'Sortie 3', align: 'center' },
  'alarm-node': { title: 'Alarme', subtitle: 'Sortie 4', align: 'center' },
  'sensor1-node': { title: 'Sonde 1', subtitle: '(Ambiance)', align: 'right' },
  'sensor2-node': { title: 'Sonde 2', subtitle: '(Evaporateur)', align: 'right' },
  'com-node': { title: 'Module de com.', subtitle: '(Optionnel)', align: 'right' },
}

export function WireDiagram({
  connections,
  outputs,
  terminals,
  selectedTerminalA,
  selectedTerminalB,
  hoveredConnectionId,
  hoveredOutputId,
  onHoverConnection,
  onSelectTerminal,
}: WireDiagramProps) {
  const activeByOutput = new Map(outputs.map((output) => [output.id, output.isOn || output.isPulsing]))
  const hoveredConnection = connections.find((connection) => connection.id === hoveredConnectionId) ?? null

  return (
    <div className="absolute inset-0">
      <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {connections.map((connection) => {
          const from = points[connection.from]
          const to = points[connection.to]
          if (!from || !to) {
            return null
          }

          const active =
            connection.id === hoveredConnectionId ||
            (connection.outputId ? hoveredOutputId === connection.outputId : false) ||
            (connection.outputId ? activeByOutput.get(connection.outputId) : false)

          return (
            <AnimatedWire
              key={connection.id}
              from={from}
              to={to}
              color={connection.color}
              active={Boolean(active)}
              onHover={(hovered) => onHoverConnection(hovered ? connection.id : null)}
            />
          )
        })}
      </svg>

      {Object.entries(labelByNode).map(([nodeId, text]) => {
        const point = points[nodeId]
        if (!point) {
          return null
        }

        const linkedConnection = connections.find((connection) => connection.to === nodeId)
        const isActive =
          hoveredConnectionId === linkedConnection?.id ||
          (linkedConnection?.outputId ? hoveredOutputId === linkedConnection.outputId : false) ||
          (linkedConnection?.outputId ? activeByOutput.get(linkedConnection.outputId) : false)

        const alignClass = text.align === 'left' ? 'text-left' : text.align === 'right' ? 'text-right' : 'text-center'

        return (
          <motion.div
            key={nodeId}
            className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 ${alignClass}`}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            animate={isActive ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={{ duration: 0.9, repeat: isActive ? Infinity : 0, ease: 'easeInOut' }}
          >
            <div className={`font-['Inter'] text-[12px] font-semibold ${isActive ? 'text-emerald-300' : 'text-slate-100'}`}>
              {text.title}
            </div>
            {text.subtitle && (
              <div className={`font-['Inter'] text-[11px] ${isActive ? 'text-emerald-200' : 'text-slate-300'}`}>
                {text.subtitle}
              </div>
            )}
          </motion.div>
        )
      })}

      {hoveredConnection && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-lg border border-white/15 bg-[#0B0F14]/95 px-3 py-1.5 text-xs text-slate-100 shadow-[0_0_20px_rgba(0,0,0,0.45)]"
        >
          {hoveredConnection.label}
        </motion.div>
      )}

      {terminals.map((terminal) => {
        const point = points[terminal.positionKey]
        if (!point) {
          return null
        }

        const isA = terminal.id === selectedTerminalA
        const isB = terminal.id === selectedTerminalB

        return (
          <button
            key={terminal.id}
            type="button"
            onClick={() => onSelectTerminal(terminal.id)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide transition duration-150 ${
              isA || isB
                ? 'border-blue-400 bg-blue-500/25 text-blue-100 shadow-[0_0_12px_rgba(59,130,246,0.55)]'
                : 'border-white/30 bg-[#0B0F14]/90 text-slate-200 hover:border-blue-400/70'
            }`}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            title={`${terminal.code} = ${terminal.number}`}
          >
            {terminal.number}
          </button>
        )
      })}
    </div>
  )
}
