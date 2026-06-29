import { useMemo } from 'react'
import { toolIconByType } from '../config/toolAssets'
import { useGameStore } from '../store/gameStore'
import type {
  InstallationDefinition,
  InstallationRuntime,
  ToolType,
} from '../types/game'

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
  const activateFault = useGameStore((state) => state.activateFault)
  const repairFault = useGameStore((state) => state.repairFault)

  const availableFaults = useMemo(
    () => installation.faults.filter((fault) => !runtime.activeFaultIds.includes(fault.id)),
    [installation.faults, runtime.activeFaultIds],
  )

  return (
    <section className="tool-panel">
      <h3>Outils de terrain</h3>

      <div className="tool-grid">
        {(Object.keys(toolLabels) as ToolType[]).map((tool) => (
          <button
            key={tool}
            type="button"
            onClick={() => setSelectedTool(tool)}
            className={selectedTool === tool ? 'selected' : ''}
          >
            <img src={toolIconByType[tool]} alt="" aria-hidden="true" />
            {toolLabels[tool]}
          </button>
        ))}
      </div>

      <button type="button" className="measure-btn" onClick={measureWithTool}>
        Mesurer avec {toolLabels[selectedTool]}
      </button>

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
        <h4>Simulation pannes</h4>
        {availableFaults.map((fault) => (
          <button key={fault.id} type="button" onClick={() => activateFault(fault.id)}>
            Injecter: {fault.name}
          </button>
        ))}

        {runtime.activeFaultIds.map((faultId) => {
          const fault = installation.faults.find((item) => item.id === faultId)
          if (!fault) {
            return null
          }

          return (
            <div key={fault.id} className="active-fault">
              <strong>{fault.name}</strong>
              <p>{fault.description}</p>
              <button type="button" onClick={() => repairFault(fault.id)}>
                Reparer
              </button>
            </div>
          )
        })}
      </article>
    </section>
  )
}
