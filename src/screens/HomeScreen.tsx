import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { getHomeBackground, getLevelThumbnail } from '../config/visuals'
import type { InstallationKind } from '../types/game'
import { DsPanel } from '../design-system'

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
    <main className="home-shell software-home-shell">
      <div className="home-photo-bg" style={{ backgroundImage: `url(${homeBackground})` }} />
      <div className="home-grid-bg" />

      <aside className="home-software-sidebar">
        <div className="software-logo-block">
          <h1>FRIGORISTE</h1>
          <strong>MANAGER</strong>
          <p>Apprendre le froid en raisonnant</p>
        </div>

        <nav className="software-main-menu" aria-label="Menu principal">
          <Link to="/" className="active">[HOME] Missions</Link>
          <Link to="/missions">[INST] Installation</Link>
          <Link to="/formation">[FRIO] Schema frigorifique</Link>
          <Link to="/formation">[ELEC] Schema electrique</Link>
          <Link to="/historique">[DATA] Historique</Link>
          <Link to="/parametres">[CFG] Parametres</Link>
        </nav>

        <article className="software-profile-card">
          <h3>Profil technicien</h3>
          <p>Niveau simulation: {unlockedLevel}</p>
          <small>Progression: {Math.min(100, 16 * unlockedLevel)}%</small>
        </article>
      </aside>

      <section className="home-software-workspace">
        <header className="workspace-topbar">
          <DsPanel label="Technicien" value={`Niveau ${unlockedLevel}`} state="ok" />
          <DsPanel label="Installations" value="6 modeles" />
          <DsPanel label="Missions actives" value={`${unlockedLevel >= 1 ? 1 : 0}`} state="warn" />
          <DsPanel label="Etat systeme" value={isLoaded ? 'Pret' : 'Chargement'} state={isLoaded ? 'ok' : 'warn'} />
        </header>

        <section className="workspace-main-grid">
          <article className="workspace-hero-card">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              Centre d intervention frigorifique
            </motion.h2>
            <p>
              Workflow metier: Mission, schema frigo, schema elec, mesures, diagnostic,
              reparation.
            </p>
            <div className="workspace-action-row">
              <Link to="/level/1/faults">Demarrer niveau 1</Link>
              <Link to="/missions">Toutes les missions</Link>
              <span>Mode simulation professionnelle</span>
            </div>
          </article>

          <article className="workspace-levels-card">
            <header>
              <h3>Missions disponibles</h3>
              {!isLoaded && <small className="status-inline">Chargement des installations...</small>}
            </header>

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
                    transition={{ duration: 0.3, delay: index * 0.04 }}
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
                      <Link to={`/level/${level}/faults`}>Choisir panne</Link>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </article>
        </section>
      </section>
    </main>
  )
}
