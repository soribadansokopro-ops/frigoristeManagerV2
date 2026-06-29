import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { getHomeBackground, getLevelThumbnail } from '../config/visuals'
import type { InstallationKind } from '../types/game'

const levelMeta: Record<number, { label: string; kind: InstallationKind }> = {
  1: { label: 'Niveau 1 - Meuble groupe loge positif', kind: 'DISPLAY_CASE_POSITIVE' },
  2: { label: 'Niveau 2 - Meuble groupe loge negatif', kind: 'DISPLAY_CASE_NEGATIVE' },
  3: { label: 'Niveau 3 - Chambre froide positive', kind: 'COLD_ROOM_POSITIVE' },
  4: { label: 'Niveau 4 - Chambre froide negative', kind: 'COLD_ROOM_NEGATIVE' },
  5: { label: 'Niveau 5 - Centrale HFC positive', kind: 'RACK_POSITIVE' },
  6: { label: 'Niveau 6 - Centrale HFC negative', kind: 'RACK_NEGATIVE' },
}

export function HomeScreen() {
  const unlockedLevel = useGameStore((state) => state.unlockedLevel)
  const isLoaded = useGameStore((state) => state.isLoaded)
  const homeBackground = getHomeBackground()

  return (
    <main className="home-shell">
      <div className="home-photo-bg" style={{ backgroundImage: `url(${homeBackground})` }} />
      <div className="home-grid-bg" />
      <section className="home-panel">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          FRIGORISTE MANAGER
        </motion.h1>
        <p>
          Simulateur metier pour intervention froid commercial. Diagnostic, mesures,
          reparation, validation.
        </p>

        {!isLoaded && <p className="status-inline">Chargement des installations...</p>}

        <div className="level-list">
          {Array.from({ length: 6 }, (_, index) => {
            const level = index + 1
            const locked = level > unlockedLevel
            const meta = levelMeta[level]
            const thumbnail = getLevelThumbnail(meta.kind)

            return (
              <motion.div
                key={level}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className={`level-card ${locked ? 'is-locked' : 'is-open'}`}
              >
                <div className="level-card-content">
                  <img src={thumbnail} alt={meta.label} loading="lazy" />
                  <div>
                    <h2>{meta.label}</h2>
                    <span>{locked ? 'Verrouille' : 'Disponible'}</span>
                  </div>
                </div>
                {locked ? (
                  <button type="button" disabled>
                    Bloque
                  </button>
                ) : (
                  <Link to={`/level/${level}`}>Lancer mission</Link>
                )}
              </motion.div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
