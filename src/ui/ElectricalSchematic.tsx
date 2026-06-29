import type { InstallationDefinition, InstallationRuntime } from '../types/game'

interface ElectricalSchematicProps {
  installation: InstallationDefinition
  runtime: InstallationRuntime
}

export function ElectricalSchematic({ installation, runtime }: ElectricalSchematicProps) {
  const hasAlarm = runtime.alarms.length > 0
  const powerColor = runtime.electrical.railPowered ? '#59f59d' : '#ff4f4f'
  const contactor = installation.components.find((component) => component.kind === 'contactor')
  const contactorState = contactor ? runtime.components[contactor.id] : undefined
  const energizedCount = Object.values(runtime.electrical.nodes).filter((node) => node.energized).length
  const activePaths = runtime.electrical.activeEdges.length
  const compressor = installation.components.find((component) => component.kind === 'compressor')
  const compressorCurrent = compressor
    ? runtime.electrical.loadCurrentByComponent[compressor.id] ?? 0
    : 0

  const fuseNode = Object.values(runtime.electrical.nodes).find((node) => node.linkedComponentId === installation.components.find((component) => component.kind === 'fuse')?.id)
  const regulatorNode = Object.values(runtime.electrical.nodes).find((node) => node.linkedComponentId === installation.components.find((component) => component.kind === 'regulator')?.id)
  const contactorNode = Object.values(runtime.electrical.nodes).find((node) => node.linkedComponentId === contactor?.id)

  const fuseStatus = fuseNode?.energized ? 'ALIMENTE' : fuseNode?.blockedBy ?? 'HORS TENSION'
  const regulatorStatus = regulatorNode?.energized
    ? 'ALIMENTE'
    : regulatorNode?.blockedBy ?? 'HORS TENSION'
  const contactorStatus = contactorNode?.energized ? 'FERME' : contactorNode?.blockedBy ?? 'OUVERT'

  return (
    <article className="schema-card">
      <header>
        <h3>Schema electrique vivant</h3>
        <p>Alimentation, relais, contacteur, moteurs, voyants</p>
      </header>

      <svg viewBox="0 0 500 230" role="img" aria-label="Schema electrique dynamique">
        <line x1="20" y1="32" x2="470" y2="32" stroke={powerColor} strokeWidth="4" className="power-line" />
        <text x="28" y="24">L</text>
        <text x="460" y="24">N</text>

        <rect x="60" y="70" width="90" height="44" rx="6" className="node" />
        <text x="74" y="96">Disjoncteur</text>

        <rect x="180" y="70" width="90" height="44" rx="6" className="node" />
        <text x="210" y="96">Fusible</text>

        <rect x="300" y="70" width="120" height="44" rx="6" className="node" />
        <text x="318" y="96">Regulateur</text>

        <line x1="105" y1="114" x2="105" y2="170" stroke={powerColor} strokeWidth="4" className="power-line" />
        <line x1="225" y1="114" x2="225" y2="170" stroke={powerColor} strokeWidth="4" className="power-line" />
        <line x1="360" y1="114" x2="360" y2="170" stroke={powerColor} strokeWidth="4" className="power-line" />

        <circle cx="105" cy="184" r="20" className="motor" />
        <text x="98" y="190">KM1</text>

        <circle cx="225" cy="184" r="20" className="motor" />
        <text x="214" y="190">M1</text>

        <circle cx="360" cy="184" r="20" className="motor" />
        <text x="349" y="190">M2</text>

        <text x="28" y="218" className="metric">
          Contacteur: {contactorState?.running ? 'FERME' : 'OUVERT'}
        </text>
        <text x="260" y="218" className={hasAlarm ? 'metric critical' : 'metric'}>
          Etat: {hasAlarm ? 'DEFAUT' : 'NORMAL'} | Noeuds: {energizedCount}
        </text>
      </svg>

      <div className="electrical-metrics">
        <span>Fusible: {fuseStatus}</span>
        <span>Regulateur: {regulatorStatus}</span>
        <span>Contacteur: {contactorStatus}</span>
        <span>Chemins actifs: {activePaths}</span>
        <span>Courant compresseur: {compressorCurrent.toFixed(2)} A</span>
      </div>
    </article>
  )
}
