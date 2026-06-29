import { useMemo, useState } from 'react'
import type { InstallationDefinition, InstallationRuntime } from '../../types/game'

interface RefrigerationDiagramProps {
  installation: InstallationDefinition
  runtime: InstallationRuntime
}

interface EquipmentNode {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
  type: 'core' | 'aux'
  componentId?: string
}

const nodes: EquipmentNode[] = [
  { id: 'compressor', label: 'Compresseur', x: 36, y: 44, width: 130, height: 62, type: 'core' },
  { id: 'condenser', label: 'Condenseur', x: 240, y: 34, width: 145, height: 62, type: 'core' },
  { id: 'fan-cond', label: 'Vent. condenseur', x: 410, y: 40, width: 140, height: 50, type: 'aux' },
  { id: 'filter', label: 'Filtre deshy', x: 568, y: 38, width: 120, height: 56, type: 'core' },
  { id: 'sight', label: 'Voyant liquide', x: 708, y: 46, width: 130, height: 48, type: 'aux' },
  { id: 'txv', label: 'Detendeur', x: 856, y: 44, width: 120, height: 54, type: 'core' },
  { id: 'evaporator', label: 'Evaporateur', x: 640, y: 226, width: 210, height: 72, type: 'core' },
  { id: 'fan-evap', label: 'Vent. evap', x: 860, y: 236, width: 120, height: 56, type: 'aux' },
  { id: 'probe', label: 'Sonde retour', x: 600, y: 322, width: 120, height: 46, type: 'aux' },
]

const bindComponentId = (installation: InstallationDefinition, nodeId: string) => {
  if (nodeId === 'compressor') {
    return installation.components.find((component) => component.kind === 'compressor')?.id
  }
  if (nodeId === 'condenser') {
    return installation.components.find((component) => component.kind === 'condenser')?.id
  }
  if (nodeId === 'evaporator') {
    return installation.components.find((component) => component.kind === 'evaporator')?.id
  }
  if (nodeId === 'txv') {
    return installation.components.find((component) => component.kind === 'expansionValve')?.id
  }
  if (nodeId === 'filter') {
    return installation.components.find((component) => component.kind === 'filterDrier')?.id
  }
  if (nodeId === 'fan-cond' || nodeId === 'fan-evap') {
    return installation.components.find((component) => component.kind === 'fan')?.id
  }
  if (nodeId === 'probe') {
    return installation.components.find((component) => component.kind === 'sensor')?.id
  }
  return undefined
}

export function RefrigerationDiagram({ installation, runtime }: RefrigerationDiagramProps) {
  const [selectedNode, setSelectedNode] = useState<string>('compressor')

  const displayNodes = useMemo(
    () => nodes.map((node) => ({ ...node, componentId: bindComponentId(installation, node.id) })),
    [installation],
  )

  const selected = displayNodes.find((node) => node.id === selectedNode) ?? displayNodes[0]
  const selectedState = selected.componentId ? runtime.components[selected.componentId] : null

  return (
    <>
      <svg viewBox="0 0 1020 410" role="img" aria-label="Schema frigorifique groupe loge interactif">
        <path d="M166 74 L240 64 L568 64" className="pipe-HP" strokeWidth="6" fill="none" />
        <path d="M688 64 L838 68 L856 66" className="pipe-HP" strokeWidth="6" fill="none" />
        <path d="M916 98 L896 220 L850 252" className="pipe-MIXED" strokeWidth="6" fill="none" />
        <path d="M640 262 L332 262 L220 220 L120 104" className="pipe-BP" strokeWidth="6" fill="none" />

        {displayNodes.map((node) => {
          const componentState = node.componentId ? runtime.components[node.componentId] : null
          const running = Boolean(componentState?.running)
          const isSelected = node.id === selectedNode

          return (
            <g key={node.id} onClick={() => setSelectedNode(node.id)}>
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                rx="10"
                className={`diagram-equip ${node.type} ${running ? 'running' : 'stopped'} ${isSelected ? 'selected' : ''}`}
              />
              <text x={node.x + 10} y={node.y + 28} className="diagram-label">
                {node.label}
              </text>
              <text x={node.x + 10} y={node.y + 48} className="diagram-state">
                {running ? 'ON' : 'OFF'}
              </text>
            </g>
          )
        })}

        <text x="40" y="392" className="metric">HP {runtime.thermo.hp.toFixed(2)} bar</text>
        <text x="220" y="392" className="metric">BP {runtime.thermo.bp.toFixed(2)} bar</text>
        <text x="390" y="392" className="metric">Tevap {runtime.thermo.tEvap.toFixed(1)} C</text>
        <text x="580" y="392" className="metric">Tcond {runtime.thermo.tCond.toFixed(1)} C</text>
        <text x="770" y="392" className="metric">SH {runtime.thermo.superheat.toFixed(1)} K</text>
        <text x="905" y="392" className="metric">SC {runtime.thermo.subcool.toFixed(1)} K</text>
      </svg>

      <div className="diagram-inspector">
        <strong>{selected.label}</strong>
        <span>Etat: {selectedState?.running ? 'En marche' : 'Arret'}</span>
        <span>Alimente: {selectedState?.powered ? 'Oui' : 'Non'}</span>
        <span>Sante composant: {selectedState?.health ?? 100}%</span>
      </div>
    </>
  )
}
