import type { InstallationRuntime } from '../../types/game'

export function PropertiesPanel({ runtime }: { runtime: InstallationRuntime }) {
  return (
    <article className="schema-card">
      <header>
        <h3>PropertiesPanel</h3>
        <p>Etat moteur et variables frigorifiques</p>
      </header>
      <div className="schema-values">
        <span>HP: {runtime.thermo.hp.toFixed(2)} bar</span>
        <span>BP: {runtime.thermo.bp.toFixed(2)} bar</span>
      </div>
      <div className="schema-values">
        <span>T enceinte: {runtime.thermo.boxTemp.toFixed(2)} C</span>
        <span>Debit: {(runtime.thermo.flowRatio * 100).toFixed(0)}%</span>
      </div>
    </article>
  )
}
