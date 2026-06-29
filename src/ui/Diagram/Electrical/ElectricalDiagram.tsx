import { useMemo, useState } from 'react'
import { useGameStore } from '../../../store/gameStore'
import type { InstallationRuntime } from '../../../types/game'

const pointMeta = [
  { id: 'tp:l', label: 'L', x: 48, y: 34 },
  { id: 'tp:fuse_out', label: 'F1 out', x: 232, y: 102 },
  { id: 'tp:reg_out', label: 'R1 out', x: 392, y: 102 },
  { id: 'tp:km_a1', label: 'KM1 A1', x: 548, y: 102 },
  { id: 'tp:comp_l', label: 'M comp', x: 706, y: 174 },
  { id: 'tp:n', label: 'N', x: 866, y: 34 },
]

type ProcedureStep = {
  id: string
  title: string
  probeA: string
  probeB: string
  expectedText: string
  evaluate: (voltage: number) => 'ok' | 'warn' | 'fault'
  interpretation: (voltage: number) => string
}

const stepPlan: ProcedureStep[] = [
  {
    id: 'supply-ln',
    title: 'Verifier alimentation generale',
    probeA: 'tp:l',
    probeB: 'tp:n',
    expectedText: '230 V AC (reseau present)',
    evaluate: (voltage) => {
      if (voltage >= 210 && voltage <= 245) return 'ok'
      if (voltage >= 180) return 'warn'
      return 'fault'
    },
    interpretation: (voltage) => {
      if (voltage >= 210 && voltage <= 245) return 'Alimentation correcte en entree du coffret.'
      if (voltage >= 180) return 'Sous-tension reseau: verifier bornier et alimentation site.'
      return 'Absence d alimentation: verifier disjoncteur amont et presence secteur.'
    },
  },
  {
    id: 'fuse-drop',
    title: 'Controler chute sur fusible F1',
    probeA: 'tp:l',
    probeB: 'tp:fuse_out',
    expectedText: '0 V (fusible passant)',
    evaluate: (voltage) => {
      if (voltage <= 5) return 'ok'
      if (voltage <= 30) return 'warn'
      return 'fault'
    },
    interpretation: (voltage) => {
      if (voltage <= 5) return 'F1 est passant, pas de chute significative.'
      if (voltage <= 30) return 'Chute anormale sur F1: serrage ou vieillissement possible.'
      return 'F1 probablement coupe: tension perdue apres protection.'
    },
  },
  {
    id: 'regulator-drop',
    title: 'Controler sortie regulateur R1',
    probeA: 'tp:fuse_out',
    probeB: 'tp:reg_out',
    expectedText: '0 V en demande froid',
    evaluate: (voltage) => {
      if (voltage <= 8) return 'ok'
      if (voltage <= 60) return 'warn'
      return 'fault'
    },
    interpretation: (voltage) => {
      if (voltage <= 8) return 'Contact R1 ferme, commande froid autorisee.'
      if (voltage <= 60) return 'Commande instable: verifier consigne et sonde de temperature.'
      return 'R1 ouvert: pas de demande froid ou defaut regulation.'
    },
  },
  {
    id: 'coil-command',
    title: 'Verifier bobine KM1 par rapport au neutre',
    probeA: 'tp:km_a1',
    probeB: 'tp:n',
    expectedText: '230 V bobine alimentee',
    evaluate: (voltage) => {
      if (voltage >= 210 && voltage <= 245) return 'ok'
      if (voltage >= 120) return 'warn'
      return 'fault'
    },
    interpretation: (voltage) => {
      if (voltage >= 210 && voltage <= 245) return 'Bobine KM1 correctement alimentee.'
      if (voltage >= 120) return 'Commande partielle: suspecter chute de tension commande.'
      return 'KM1 non alimente: rechercher coupure sur chaine commande.'
    },
  },
  {
    id: 'compressor-supply',
    title: 'Verifier alimentation compresseur',
    probeA: 'tp:comp_l',
    probeB: 'tp:n',
    expectedText: '230 V au moteur',
    evaluate: (voltage) => {
      if (voltage >= 210 && voltage <= 245) return 'ok'
      if (voltage >= 120) return 'warn'
      return 'fault'
    },
    interpretation: (voltage) => {
      if (voltage >= 210 && voltage <= 245) return 'Le compresseur est bien alimente electriquement.'
      if (voltage >= 120) return 'Tension reduite moteur: verifier contacts puissance et serrage.'
      return 'Pas d alimentation compresseur: verifier contacteur et protections.'
    },
  },
]

const pairVoltage = (a: string, b: string, testPointVoltage: Record<string, number>) =>
  Math.abs((testPointVoltage[a] ?? 0) - (testPointVoltage[b] ?? 0))

const pairMatches = (selectedA: string | null, selectedB: string | null, step: ProcedureStep) => {
  if (!selectedA || !selectedB) return false
  return (
    (selectedA === step.probeA && selectedB === step.probeB) ||
    (selectedA === step.probeB && selectedB === step.probeA)
  )
}

export function ElectricalDiagram({ runtime }: { runtime: InstallationRuntime }) {
  const [activeProbe, setActiveProbe] = useState<'A' | 'B'>('A')
  const setElectricalProbe = useGameStore((state) => state.setElectricalProbe)
  const triggerElectricalMeasurement = useGameStore((state) => state.triggerElectricalMeasurement)

  const railColor = runtime.electrical.railPowered ? '#59f59d' : '#ff5e6e'

  const selected = useMemo(
    () => ({
      A: runtime.electrical.selectedProbeA,
      B: runtime.electrical.selectedProbeB,
    }),
    [runtime.electrical.selectedProbeA, runtime.electrical.selectedProbeB],
  )

  const procedureResults = useMemo(
    () => stepPlan.map((step) => {
      const measured = pairVoltage(step.probeA, step.probeB, runtime.electrical.testPointVoltage)
      return {
        ...step,
        measured,
        status: step.evaluate(measured),
      }
    }),
    [runtime.electrical.testPointVoltage],
  )

  const activeProcedure = useMemo(
    () => procedureResults.find((step) => pairMatches(selected.A, selected.B, step)) ?? null,
    [procedureResults, selected.A, selected.B],
  )

  const selectPoint = (pointId: string) => {
    setElectricalProbe(activeProbe, pointId)
    setActiveProbe(activeProbe === 'A' ? 'B' : 'A')
  }

  const applyProcedureStep = (step: ProcedureStep) => {
    setElectricalProbe('A', step.probeA)
    setElectricalProbe('B', step.probeB)
    setActiveProbe('A')
  }

  return (
    <>
      <svg viewBox="0 0 920 260" role="img" aria-label="Schema electrique reel commande puissance">
        <line x1="40" y1="34" x2="880" y2="34" stroke={railColor} strokeWidth="4" className="power-line" />
        <text x="40" y="22">L</text>
        <text x="865" y="22">N</text>

        <rect x="84" y="78" width="110" height="48" rx="8" className="node" />
        <text x="100" y="106">Disjoncteur QF1</text>

        <rect x="218" y="78" width="110" height="48" rx="8" className="node" />
        <text x="248" y="106">Fusible F1</text>

        <rect x="352" y="78" width="130" height="48" rx="8" className="node" />
        <text x="370" y="106">Regulateur R1</text>

        <rect x="506" y="78" width="130" height="48" rx="8" className="node" />
        <text x="526" y="106">Bobine KM1</text>

        <line x1="636" y1="102" x2="636" y2="174" stroke={railColor} strokeWidth="4" className="power-line" />
        <line x1="636" y1="174" x2="716" y2="174" stroke={railColor} strokeWidth="4" className="power-line" />
        <rect x="716" y="150" width="128" height="48" rx="8" className="node" />
        <text x="734" y="178">Compresseur M1</text>

        <line x1="844" y1="174" x2="844" y2="34" stroke={railColor} strokeWidth="4" className="power-line" />

        {pointMeta.map((point) => {
          const voltage = runtime.electrical.testPointVoltage[point.id] ?? 0
          const selectedA = selected.A === point.id
          const selectedB = selected.B === point.id

          return (
            <g key={point.id} className="test-point" onClick={() => selectPoint(point.id)}>
              <circle
                cx={point.x}
                cy={point.y}
                r="11"
                className={`test-point-dot ${selectedA ? 'probe-a' : ''} ${selectedB ? 'probe-b' : ''}`}
              />
              <text x={point.x + 16} y={point.y - 4}>{point.label}</text>
              <text x={point.x + 16} y={point.y + 11} className="metric">{voltage.toFixed(0)} V</text>
            </g>
          )
        })}
      </svg>

      <div className="electrical-toolbox-row">
        <span>Pointe active: {activeProbe}</span>
        <span>Point A: {selected.A ?? '--'}</span>
        <span>Point B: {selected.B ?? '--'}</span>
        <span>U(A-B): {runtime.electrical.measuredVoltage === null ? '--' : `${runtime.electrical.measuredVoltage.toFixed(1)} V`}</span>
        <button type="button" onClick={triggerElectricalMeasurement}>Mesurer tension</button>
      </div>

      <article className="electrical-procedure-card">
        <header>
          <h4>Procedure guidee de controle electrique</h4>
          <p>Suivre les etapes de la source vers le compresseur pour isoler la coupure.</p>
        </header>

        <ol className="electrical-procedure-list">
          {procedureResults.map((step) => (
            <li key={step.id} className={`status-${step.status}`}>
              <div>
                <strong>{step.title}</strong>
                <p>{step.probeA} → {step.probeB}</p>
                <p>Attendu: {step.expectedText}</p>
                <p>Calcule: {step.measured.toFixed(1)} V</p>
              </div>
              <button type="button" onClick={() => applyProcedureStep(step)}>Placer sondes</button>
            </li>
          ))}
        </ol>

        <div className="electrical-interpretation-box">
          <strong>Interpretation active</strong>
          {activeProcedure ? (
            <p>{activeProcedure.interpretation(runtime.electrical.measuredVoltage ?? activeProcedure.measured)}</p>
          ) : (
            <p>Selectionner une etape via Placer sondes puis cliquer Mesurer tension.</p>
          )}
        </div>
      </article>
    </>
  )
}
