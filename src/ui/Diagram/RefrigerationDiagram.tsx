import { useMemo, useState } from 'react'
import type { InstallationDefinition, InstallationRuntime } from '../../types/game'
import {
  buildLoopRenderNodes,
  buildRenderLinks,
  getOrderedRefrigerationNodes,
} from './graphLayout'

interface RefrigerationDiagramProps {
  installation: InstallationDefinition
  runtime: InstallationRuntime
}

export function RefrigerationDiagram({ installation: _installation, runtime }: RefrigerationDiagramProps) {
  const [selectedNode, setSelectedNode] = useState<string>('')

  const displayNodes = useMemo(() => {
    const ordered = getOrderedRefrigerationNodes(runtime.graph.nodes, runtime.graph.traversal)
    return buildLoopRenderNodes(ordered, 1020, 380)
  }, [runtime.graph.nodes, runtime.graph.traversal])

  const selected = displayNodes.find((node) => node.id === selectedNode) ?? displayNodes[0]
  const selectedState = selected?.componentId ? runtime.components[selected.componentId] : null
  const airFlowM3h = runtime.thermo.airFlowM3h ?? runtime.thermo.flowRatio * 3000
  const condenserApproach = runtime.thermo.condenserApproach ?? 10
  const icingHint = airFlowM3h < 1650 && runtime.thermo.tEvap < -8 && runtime.thermo.boxTemp > runtime.regulator.setpoint + 2
  const condenserStress = condenserApproach > 14

  const drawnConnections = useMemo(() => {
    return buildRenderLinks(displayNodes, runtime.graph.connections)
  }, [displayNodes, runtime.graph.connections])

  return (
    <>
      <svg viewBox="0 0 1020 410" role="img" aria-label="Schema frigorifique groupe loge interactif">
        {drawnConnections.map((edge) => (
          <line
            key={edge.id}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            className={edge.className}
            strokeWidth="6"
            fill="none"
          />
        ))}

        {icingHint && (
          <g className="fault-clue-layer">
            <ellipse cx="742" cy="270" rx="138" ry="48" className="frost-halo" />
            <text x="658" y="246" className="fault-clue-text">Indice: trace de givre cote evaporateur</text>
          </g>
        )}

        {condenserStress && (
          <g className="fault-clue-layer">
            <ellipse cx="314" cy="64" rx="120" ry="40" className="heat-halo" />
            <text x="238" y="26" className="fault-clue-text">Indice: zone condenseur tres chaude</text>
          </g>
        )}

        {displayNodes.map((node) => {
          const componentState = node.componentId ? runtime.components[node.componentId] : null
          const running = Boolean(componentState?.running)
          const powered = componentState ? componentState.powered : true
          const leaking = Boolean(componentState?.leaking)
          const isSelected = node.id === selectedNode
          const isAux = node.type === 'fan' || node.type === 'sensor' || node.type === 'receiver' || node.type === 'solenoidValve'
          const statusText = componentState
            ? `${powered ? 'ALIM' : 'OFF'} | ${running ? 'RUN' : 'STOP'} | ${leaking ? 'FUITE' : 'ETANCHE'}`
            : 'INFO'

          return (
            <g key={node.id} onClick={() => setSelectedNode(node.id)}>
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                rx="10"
                className={`diagram-equip ${isAux ? 'aux' : 'core'} ${running ? 'running' : 'stopped'} ${isSelected ? 'selected' : ''} ${leaking ? 'leaking' : ''}`}
              />
              <text x={node.x + 10} y={node.y + 28} className="diagram-label">
                {node.label}
              </text>
              <text x={node.x + 10} y={node.y + 48} className="diagram-state">
                {statusText}
              </text>
            </g>
          )
        })}

        {displayNodes.length === 0 && (
          <text x="380" y="200" className="metric">Graphe frigo indisponible</text>
        )}

        <text x="40" y="392" className="metric">HP {runtime.thermo.hp.toFixed(2)} bar</text>
        <text x="220" y="392" className="metric">BP {runtime.thermo.bp.toFixed(2)} bar</text>
        <text x="390" y="392" className="metric">Tevap {runtime.thermo.tEvap.toFixed(1)} C</text>
        <text x="580" y="392" className="metric">Tcond {runtime.thermo.tCond.toFixed(1)} C</text>
        <text x="770" y="392" className="metric">SH {runtime.thermo.superheat.toFixed(1)} K</text>
        <text x="905" y="392" className="metric">SC {runtime.thermo.subcool.toFixed(1)} K</text>
      </svg>

      <div className="diagram-inspector">
        <strong>{selected?.label ?? 'Composant'}</strong>
        <span>Etat: {selectedState?.running ? 'En marche' : 'Arret'}</span>
        <span>Alimente: {selectedState?.powered ? 'Oui' : 'Non'}</span>
        <span>Etancheite: {selectedState?.leaking ? 'Fuite detectee' : 'OK'}</span>
        <span>Sante composant: {selectedState?.health ?? 100}%</span>
      </div>
    </>
  )
}
