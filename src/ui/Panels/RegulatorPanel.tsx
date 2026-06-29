import { useGameStore } from '../../store/gameStore'
import type { InstallationDefinition, InstallationRuntime } from '../../types/game'

interface RegulatorPanelProps {
  installation: InstallationDefinition
  runtime: InstallationRuntime
}

export function RegulatorPanel({ installation, runtime }: RegulatorPanelProps) {
  const setRegulatorFanForcedOff = useGameStore((state) => state.setRegulatorFanForcedOff)
  const setRegulatorDefrostActive = useGameStore((state) => state.setRegulatorDefrostActive)

  const fanComponent = installation.components.find((component) => component.kind === 'fan')
  const fanRunning = fanComponent ? runtime.components[fanComponent.id]?.running : false

  const regulatorSetpoint = runtime.regulator.setpoint
  const fanForcedOff = runtime.regulator.fanForcedOff
  const defrostRunning = runtime.regulator.defrostActive

  return (
    <article className="schema-card regulator-panel">
      <header>
        <h3>Regulateur meuble</h3>
        <p>Etat de regulation et alarmes techniques</p>
      </header>

      <div className="regulator-top">
        <div className="regulator-display">
          <small>Consigne</small>
          <strong>{regulatorSetpoint.toFixed(1)} C</strong>
        </div>
        <div className="regulator-display">
          <small>T retour air</small>
          <strong>{runtime.thermo.boxTemp.toFixed(1)} C</strong>
        </div>
      </div>

      <div className="regulator-flags">
        <span className={fanRunning ? 'on' : 'off'}>Fan {fanRunning ? 'ON' : 'OFF'}</span>
        <span className={defrostRunning ? 'on' : 'off'}>Degivrage {defrostRunning ? 'ON' : 'OFF'}</span>
        <span className={runtime.thermo.electricalPower ? 'on' : 'off'}>
          Alim {runtime.thermo.electricalPower ? 'ON' : 'OFF'}
        </span>
      </div>

      <div className="regulator-actions">
        <button
          type="button"
          onClick={() => setRegulatorFanForcedOff(!fanForcedOff)}
        >
          {fanForcedOff ? 'Fan Auto' : 'Forcer Fan OFF'}
        </button>
        <button
          type="button"
          onClick={() => setRegulatorDefrostActive(!defrostRunning)}
        >
          {defrostRunning ? 'Arreter degivrage' : 'Lancer degivrage'}
        </button>
      </div>

      <div className="regulator-grid">
        <span>HP: {runtime.thermo.hp.toFixed(2)} bar</span>
        <span>BP: {runtime.thermo.bp.toFixed(2)} bar</span>
        <span>Surchauffe: {runtime.thermo.superheat.toFixed(1)} K</span>
        <span>Sous-ref.: {runtime.thermo.subcool.toFixed(1)} K</span>
      </div>

      <div className="regulator-alarms">
        <strong>Alarmes</strong>
        {runtime.alarms.length > 0 ? (
          <ul>
            {runtime.alarms.slice(0, 4).map((alarm) => (
              <li key={alarm}>{alarm}</li>
            ))}
          </ul>
        ) : (
          <p>Aucune alarme active</p>
        )}
      </div>
    </article>
  )
}
