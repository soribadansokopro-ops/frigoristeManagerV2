import { Link } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { DsBadge, DsCard } from '../design-system'

export function HistoryScreen() {
  const runtime = useGameStore((state) => state.runtime)
  const missionStep = useGameStore((state) => state.missionStep)

  const alarms = runtime?.alarms ?? []
  const lastReading = runtime?.lastReading

  return (
    <main className="info-page-shell">
      <section className="info-page-panel">
        <header className="info-page-header">
          <h1>Historique</h1>
          <p>Resume des alarmes, mesures et etat de mission courant.</p>
        </header>

        <div className="info-page-actions">
          <Link to="/">Retour accueil</Link>
          <Link to="/missions">Ouvrir missions</Link>
        </div>

        <div className="training-grid">
          <DsCard title="Etat mission" subtitle="Progression operationnelle">
            <p>Etape actuelle: {missionStep}</p>
            <DsBadge tone={alarms.length > 0 ? 'warn' : 'ok'}>
              {alarms.length > 0 ? `${alarms.length} alarme(s)` : 'Aucune alarme'}
            </DsBadge>
          </DsCard>

          <DsCard title="Derniere mesure" subtitle="Lecture instrumentee">
            {lastReading ? (
              <>
                <p>Outil: {lastReading.tool}</p>
                <p>Titre: {lastReading.title}</p>
                <p>Horodatage: {lastReading.measuredAt}</p>
              </>
            ) : (
              <p>Aucune mesure disponible pour le moment.</p>
            )}
          </DsCard>

          <DsCard title="Alarmes actives" subtitle="Priorites terrain" className="history-span-2">
            {alarms.length === 0 ? (
              <p>Aucune alarme active.</p>
            ) : (
              <ul className="guide-list">
                {alarms.map((alarm) => (
                  <li key={alarm}>{alarm}</li>
                ))}
              </ul>
            )}
          </DsCard>
        </div>
      </section>
    </main>
  )
}
