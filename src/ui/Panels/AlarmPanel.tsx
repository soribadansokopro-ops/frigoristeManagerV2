import type { InstallationRuntime } from '../../types/game'

export function AlarmPanel({ runtime }: { runtime: InstallationRuntime }) {
  return (
    <article className="schema-card">
      <header>
        <h3>AlarmPanel</h3>
        <p>Alarmes calculees par AlarmEngine</p>
      </header>
      <ul className="alarm-list">
        {runtime.alarms.length > 0 ? (
          runtime.alarms.map((alarm) => <li key={alarm}>{alarm}</li>)
        ) : (
          <li>Aucune alarme active</li>
        )}
      </ul>
    </article>
  )
}
