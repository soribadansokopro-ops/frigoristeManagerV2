import type { InstallationDefinition, InstallationRuntime } from '../types/game'
import {
  buildCompactRenderNodes,
  buildRenderLinks,
  getOrderedRefrigerationNodes,
} from './Diagram/graphLayout'

interface RefrigerationSchematicProps {
  installation: InstallationDefinition
  runtime: InstallationRuntime
}

export function RefrigerationSchematic({ installation, runtime }: RefrigerationSchematicProps) {
  const hpColor = runtime.thermo.hp > installation.base.hp ? '#ff643d' : '#ff8855'
  const bpColor = runtime.thermo.bp < installation.base.bp ? '#35b7ff' : '#2d8ed8'
  const airFlow = runtime.thermo.airFlowM3h ?? runtime.thermo.flowRatio * 3000

  const orderedNodes = getOrderedRefrigerationNodes(runtime.graph.nodes, runtime.graph.traversal)
  const visualNodes = buildCompactRenderNodes(orderedNodes).map((entry) => ({
    node: orderedNodes.find((node) => node.id === entry.id) ?? orderedNodes[0],
    ...entry,
  }))
  const links = buildRenderLinks(visualNodes, runtime.graph.connections)

  const stateText = (state: { running: boolean; powered: boolean; leaking: boolean } | null | undefined) => {
    if (!state) return 'N/A'
    if (state.leaking) return 'FUITE'
    if (!state.powered) return 'OFF'
    return state.running ? 'RUN' : 'STOP'
  }

  return (
    <article className="schema-card">
      <header>
        <h3>Schema frigorifique vivant</h3>
        <p>Boucle generee automatiquement depuis le graphe de connexion.</p>
      </header>

      <svg viewBox="0 0 760 300" role="img" aria-label="Schema frigorifique dynamique">
        {links.map((edge) => (
          <line
            key={edge.id}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke={edge.className.includes('low') ? bpColor : hpColor}
            strokeWidth="5"
            fill="none"
            className={edge.className}
          />
        ))}

        {visualNodes.map((item) => {
          if (!item.node) {
            return null
          }

          const state = runtime.components[item.node.componentId]
          const textState = stateText(state)

          return (
            <g key={item.node.id}>
              <rect
                x={item.x}
                y={item.y}
                width={item.width}
                height={item.height}
                rx="8"
                className={`node ${state?.powered ? 'active' : 'inactive'}`}
              />
              <text x={item.x + 8} y={item.y + 20}>{item.node.label}</text>
              <text x={item.x + 8} y={item.y + 38} className="diagram-state">Etat: {textState}</text>
            </g>
          )
        })}

        {visualNodes.length === 0 && (
          <text x="250" y="150" className="metric">Aucun composant de graphe disponible</text>
        )}

        <text x="26" y="286" className="metric">HP: {runtime.thermo.hp.toFixed(2)} bar</text>
        <text x="158" y="286" className="metric">BP: {runtime.thermo.bp.toFixed(2)} bar</text>
        <text x="286" y="286" className="metric">Tevap: {runtime.thermo.tEvap.toFixed(1)} C</text>
        <text x="438" y="286" className="metric">Tcond: {runtime.thermo.tCond.toFixed(1)} C</text>
        <text x="586" y="286" className="metric">Air: {airFlow.toFixed(0)} m3/h</text>

        <text x="540" y="20" className="diagram-state">Voyant: {runtime.thermo.subcool > 3 ? 'Liq. stable' : 'Bulles possibles'}</text>
      </svg>

      <div className="schema-values dense">
        <span>Surchauffe: {runtime.thermo.superheat.toFixed(2)} K</span>
        <span>Sous-refroidissement: {runtime.thermo.subcool.toFixed(2)} K</span>
        <span>T aspiration: {(runtime.thermo.tSuction ?? runtime.thermo.tEvap + runtime.thermo.superheat).toFixed(1)} C</span>
        <span>T refoulement: {(runtime.thermo.tDischarge ?? runtime.thermo.tCond + 30).toFixed(1)} C</span>
      </div>
    </article>
  )
}
