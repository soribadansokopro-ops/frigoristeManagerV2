import type { InstallationRuntime } from '../../types/game'

export function PropertiesPanel({ runtime }: { runtime: InstallationRuntime }) {
  const tSuction = runtime.thermo.tSuction ?? runtime.thermo.tEvap + runtime.thermo.superheat
  const tDischarge = runtime.thermo.tDischarge ?? runtime.thermo.tCond + 30
  const airFlowM3h = runtime.thermo.airFlowM3h ?? runtime.thermo.flowRatio * 3000
  const condenserApproach = runtime.thermo.condenserApproach ?? 10

  return (
    <article className="schema-card">
      <header>
        <h3>Etat process rapide</h3>
        <p>Resume des mesures principales</p>
      </header>
      <div className="process-grid">
        <span>HP: {runtime.thermo.hp.toFixed(2)} bar</span>
        <span>BP: {runtime.thermo.bp.toFixed(2)} bar</span>
        <span>T aspiration: {tSuction.toFixed(1)} C</span>
        <span>T refoulement: {tDischarge.toFixed(1)} C</span>
        <span>Debit air: {airFlowM3h.toFixed(0)} m3/h</span>
        <span>Condenseur: approche {condenserApproach.toFixed(1)} K</span>
      </div>
    </article>
  )
}
