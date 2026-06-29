import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { getLevelThumbnail } from '../config/visuals'
import type { InstallationKind } from '../types/game'

const levelMeta: Record<number, { label: string; kind: InstallationKind }> = {
  1: { label: 'Niveau 1 - Meuble groupe loge positif', kind: 'DISPLAY_CASE_POSITIVE' },
  2: { label: 'Niveau 2 - Meuble groupe loge negatif', kind: 'DISPLAY_CASE_NEGATIVE' },
  3: { label: 'Niveau 3 - Chambre froide positive', kind: 'COLD_ROOM_POSITIVE' },
  4: { label: 'Niveau 4 - Chambre froide negative', kind: 'COLD_ROOM_NEGATIVE' },
  5: { label: 'Niveau 5 - Centrale HFC positive', kind: 'RACK_POSITIVE' },
  6: { label: 'Niveau 6 - Centrale HFC negative', kind: 'RACK_NEGATIVE' },
}

export function MissionsScreen() {
  const unlockedLevel = useGameStore((state) => state.unlockedLevel)

  return (
    <main className="info-page-shell">
      <section className="info-page-panel">
        <header className="info-page-header">
          <h1>Missions</h1>
          <p>Choisis un niveau puis le scenario de panne a traiter.</p>
        </header>

        <div className="info-page-actions">
          <Link to="/">Retour accueil</Link>
          <Link to="/formation">Voir la formation</Link>
        </div>

        <section className="mission-board-grid">
          {Array.from({ length: 6 }, (_, index) => {
            const level = index + 1
            const locked = level > unlockedLevel
            const meta = levelMeta[level]
            const thumbnail = getLevelThumbnail(meta.kind)

            return (
              <motion.article
                key={level}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                className={`mission-board-card ${locked ? 'is-locked' : ''}`}
              >
                <img src={thumbnail} alt={meta.label} loading="lazy" />
                <h2>{meta.label}</h2>
                <p>{locked ? 'Verrouille pour le moment.' : 'Disponible maintenant.'}</p>
                {locked ? (
                  <button type="button" disabled>
                    Bloque
                  </button>
                ) : (
                  <Link to={`/level/${level}/faults`}>Choisir panne</Link>
                )}
              </motion.article>
            )
          })}
        </section>
      </section>
    </main>
  )
}
