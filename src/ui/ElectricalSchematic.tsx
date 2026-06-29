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
  const fan = installation.components.find((component) => component.kind === 'fan')
  const solenoid = installation.components.find((component) => component.kind === 'solenoidValve')
  const sensor = installation.components.find((component) => component.kind === 'sensor')
  const relay = installation.components.find((component) => component.kind === 'relay')
  const compressorCurrent = compressor
    ? runtime.electrical.loadCurrentByComponent[compressor.id] ?? 0
    : 0

  const fanCurrent = fan ? runtime.electrical.loadCurrentByComponent[fan.id] ?? 0 : 0
  const solenoidCurrent = solenoid ? runtime.electrical.loadCurrentByComponent[solenoid.id] ?? 0 : 0

  const fanState = fan ? runtime.components[fan.id] : null
  const solenoidState = solenoid ? runtime.components[solenoid.id] : null
  const sensorState = sensor ? runtime.components[sensor.id] : null
  const relayState = relay ? runtime.components[relay.id] : null

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
        <p>Alimentation, protections, commande, relais et charges finales</p>
      </header>

      <svg viewBox="0 0 760 290" role="img" aria-label="Schema electrique dynamique">
        <line x1="24" y1="32" x2="734" y2="32" stroke={powerColor} strokeWidth="4" className="power-line" />
        <text x="28" y="24">L</text>
        <text x="722" y="24">N</text>

        <rect x="60" y="70" width="100" height="44" rx="6" className={`node ${runtime.electrical.railPowered ? 'active' : 'inactive'}`} />
        <text x="74" y="96">Disjoncteur</text>

        <rect x="190" y="70" width="100" height="44" rx="6" className={`node ${fuseNode?.energized ? 'active' : 'inactive'}`} />
        <text x="214" y="96">Fusible</text>

        <rect x="320" y="70" width="120" height="44" rx="6" className={`node ${regulatorNode?.energized ? 'active' : 'inactive'}`} />
        <text x="340" y="96">Regulateur</text>

        <rect x="470" y="70" width="100" height="44" rx="6" className={`node ${relayState?.powered ? 'active' : 'inactive'}`} />
        <text x="500" y="96">Relais</text>

        <rect x="596" y="70" width="100" height="44" rx="6" className={`node ${contactorNode?.energized ? 'active' : 'inactive'}`} />
        <text x="614" y="96">KM1</text>

        <line x1="110" y1="114" x2="110" y2="184" stroke={powerColor} strokeWidth="4" className="power-line" />
        <line x1="240" y1="114" x2="240" y2="184" stroke={powerColor} strokeWidth="4" className="power-line" />
        <line x1="380" y1="114" x2="380" y2="184" stroke={powerColor} strokeWidth="4" className="power-line" />
        <line x1="520" y1="114" x2="520" y2="184" stroke={powerColor} strokeWidth="4" className="power-line" />
        <line x1="646" y1="114" x2="646" y2="184" stroke={powerColor} strokeWidth="4" className="power-line" />

        <circle cx="240" cy="208" r="22" className={`motor ${contactorState?.running ? 'active' : 'inactive'}`} />
        <text x="229" y="213">M1</text>
        <text x="214" y="234" className="diagram-state">Compresseur</text>

        <circle cx="380" cy="208" r="22" className={`motor ${fanState?.running ? 'active' : 'inactive'}`} />
        <text x="368" y="213">M2</text>
        <text x="356" y="234" className="diagram-state">Ventilateurs</text>

        <circle cx="520" cy="208" r="22" className={`motor ${solenoidState?.running ? 'active' : 'inactive'}`} />
        <text x="509" y="213">SV</text>
        <text x="494" y="234" className="diagram-state">Electrovanne</text>

        <rect x="620" y="190" width="52" height="36" rx="6" className={`node ${sensorState?.powered ? 'active' : 'inactive'}`} />
        <text x="632" y="212" className="diagram-state">Sonde</text>

        <line x1="240" y1="230" x2="240" y2="258" stroke="#6d879e" strokeWidth="2" />
        <line x1="380" y1="230" x2="380" y2="258" stroke="#6d879e" strokeWidth="2" />
        <line x1="520" y1="230" x2="520" y2="258" stroke="#6d879e" strokeWidth="2" />
        <line x1="646" y1="226" x2="646" y2="258" stroke="#6d879e" strokeWidth="2" />
        <line x1="110" y1="258" x2="700" y2="258" stroke="#6d879e" strokeWidth="2" />

        <text x="26" y="282" className="metric">
          Contacteur: {contactorState?.running ? 'FERME' : 'OUVERT'}
        </text>
        <text x="300" y="282" className={hasAlarm ? 'metric critical' : 'metric'}>
          Etat: {hasAlarm ? 'DEFAUT' : 'NORMAL'} | Noeuds: {energizedCount}
        </text>
      </svg>

      <div className="electrical-metrics">
        <span>Fusible: {fuseStatus}</span>
        <span>Regulateur: {regulatorStatus}</span>
        <span>Contacteur: {contactorStatus}</span>
        <span>Chemins actifs: {activePaths}</span>
        <span>Courant compresseur: {compressorCurrent.toFixed(2)} A</span>
        <span>Courant ventilateurs: {fanCurrent.toFixed(2)} A</span>
        <span>Courant electrovanne: {solenoidCurrent.toFixed(2)} A</span>
      </div>
    </article>
  )
}
