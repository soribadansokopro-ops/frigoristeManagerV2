import { useMemo } from 'react'
import { toolIconByType } from '../config/toolAssets'
import { useGameStore } from '../store/gameStore'
import type {
  InstallationDefinition,
  InstallationRuntime,
  ToolType,
} from '../types/game'
import { DsButton } from '../design-system'

interface ToolPanelProps {
  installation: InstallationDefinition
  runtime: InstallationRuntime
  selectedTool: ToolType
}

const toolLabels: Record<ToolType, string> = {
  MANIFOLD: 'Manifold',
  THERMOMETER: 'Thermometre',
  MULTIMETER: 'Multimetre',
  CLAMP_METER: 'Pince amperemetrique',
  LEAK_DETECTOR: 'Detecteur de fuite',
}

export function ToolPanel({ installation, runtime, selectedTool }: ToolPanelProps) {
  const setSelectedTool = useGameStore((state) => state.setSelectedTool)
  const measureWithTool = useGameStore((state) => state.measureWithTool)
  const repairFault = useGameStore((state) => state.repairFault)

  const activeFaults = useMemo(
    () => runtime.activeFaultIds
      .map((faultId) => installation.faults.find((item) => item.id === faultId))
      .filter(Boolean),
    [installation.faults, runtime.activeFaultIds],
  )

  return (
    <section className="tool-panel">
      <h3>Outils de terrain</h3>

      <div className="tool-grid">
        {(Object.keys(toolLabels) as ToolType[]).map((tool) => (
          <DsButton
            key={tool}
            variant={selectedTool === tool ? 'primary' : 'ghost'}
            onClick={() => setSelectedTool(tool)}
          >
            <img src={toolIconByType[tool]} alt="" aria-hidden="true" />
            {toolLabels[tool]}
          </DsButton>
        ))}
      </div>

      <DsButton onClick={measureWithTool}>
        Mesurer avec {toolLabels[selectedTool]}
      </DsButton>

      {runtime.lastReading && (
        <article className="reading-box">
          <strong>{runtime.lastReading.title}</strong>
          <small>{runtime.lastReading.measuredAt}</small>
          <ul>
            {runtime.lastReading.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </article>
      )}

      <article className="fault-zone">
        <h4>Panne(s) active(s)</h4>
        {activeFaults.length === 0 && (
          <p>Aucune panne active. Faites le test final puis validez l intervention.</p>
        )}

        {activeFaults.map((fault) => {
          if (!fault) return null

          return (
            <div key={fault.id} className="active-fault">
              <strong>{fault.name}</strong>
              <p>{fault.description}</p>
              <DsButton variant="success" onClick={() => repairFault(fault.id)}>Reparer</DsButton>
            </div>
          )
        })}
      </article>
    </section>
  )
}
