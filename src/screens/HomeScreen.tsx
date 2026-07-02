import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { getHomeBackground, getLevelThumbnail } from '../config/visuals'
import type { InstallationKind } from '../types/game'
import { DsButton, DsMissionCard, DsPanel, DsTabs } from '../design-system'

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
  const bestScoreByLevel = useGameStore((state) => state.bestScoreByLevel)
  const isLoaded = useGameStore((state) => state.isLoaded)
  const homeBackground = getHomeBackground()
  const now = new Date()
  const dateLabel = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeLabel = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const interventionStatus = ['Urgent', 'En cours', 'Planifie', 'Planifie', 'Planifie', 'Planifie']
  const resolvedMissions = Object.values(bestScoreByLevel).filter((score) => score > 0).length
  const effectiveUnlockedLevel = Number.isFinite(unlockedLevel) && unlockedLevel > 0 ? unlockedLevel : 1
  const [workspaceTab, setWorkspaceTab] = useState<'operations' | 'missions'>('operations')

  const menuLinkClass = 'rounded-lg border border-[#214f7a] bg-[rgba(10,36,64,.68)] px-3 py-2 text-[#b7dcfb] transition hover:-translate-y-[1px] hover:border-[#34c4ff] hover:shadow-[0_0_0_1px_rgba(52,196,255,.35)_inset]'
  const actionLinkClass = 'rounded-lg border border-[#2d5e94] bg-[linear-gradient(180deg,#133764,#0c2b52)] px-3 py-2 font-semibold text-[#d9f2ff] transition hover:-translate-y-[1px] hover:border-[#3ac9ff] hover:shadow-[0_0_14px_rgba(35,184,255,.22)]'

  return (
    <main className="relative grid min-h-screen grid-cols-1 gap-3 overflow-hidden p-3 xl:grid-cols-[280px_1fr]">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${homeBackground})` }} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(39,114,189,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(39,114,189,.14)_1px,transparent_1px)] bg-[length:34px_34px]" />

      <aside className="z-10 grid gap-3 rounded-xl border border-[#1f476f] bg-[linear-gradient(180deg,rgba(7,26,49,.92),rgba(4,14,27,.95))] p-4 backdrop-blur">
        <div>
          <h1 className="m-0 font-['Rajdhani'] text-4xl uppercase tracking-wide">FRIGORISTE</h1>
          <strong className="text-4xl text-[#2bbdff]">MANAGER</strong>
          <p className="mt-2 text-sm text-[#8ba7c2]">Apprendre le froid en s amusant</p>
        </div>

        <nav className="grid gap-2" aria-label="Menu principal">
          <Link to="/missions" className={`${menuLinkClass} border-[#32b8ff] bg-[linear-gradient(180deg,rgba(20,65,112,.95),rgba(13,42,74,.95))] text-[#e7f6ff]`}>Nouvelle mission</Link>
          <Link to="/missions" className={menuLinkClass}>Mes missions</Link>
          <Link to="/level/1" className={menuLinkClass}>Atelier</Link>
          <Link to="/formation" className={menuLinkClass}>Formation</Link>
          <Link to="/historique" className={menuLinkClass}>Supervision</Link>
          <Link to="/parametres" className={menuLinkClass}>Parametres</Link>
          <Link to="/" className={menuLinkClass}>Quitter</Link>
        </nav>

        <DsMissionCard
          title="Actualites"
          description="Nouvelle mission disponible"
          statusLabel="Entrepot surgeles - Dunkerque"
          statusTone="ok"
          progress={70}
          actions={<DsButton variant="secondary" to="/missions">Voir missions</DsButton>}
        >
          <figure className="mt-2 overflow-hidden rounded-lg border border-[#2c618f]">
            <img className="h-32 w-full object-cover" src="/assets/background/freshmarket-entry.png" alt="Nouvelle mission" loading="lazy" />
          </figure>
        </DsMissionCard>
      </aside>

      <section className="z-10 grid min-h-0 gap-3 rounded-xl border border-[#1f476f] bg-[linear-gradient(180deg,rgba(7,26,49,.92),rgba(4,14,27,.95))] p-3 backdrop-blur">
        <header className="grid grid-cols-2 gap-2 xl:grid-cols-5">
          <DsPanel label="Technicien" value={`Niveau ${unlockedLevel}`} state="ok" />
          <DsPanel label="Missions debloquees" value={`${effectiveUnlockedLevel}/6`} state="ok" />
          <DsPanel label="Interventions validees" value={`${resolvedMissions}`} state="ok" />
          <DsPanel label={dateLabel} value={timeLabel} />
          <DsPanel label="Meteo" value="21 C - Ensoleille" />
        </header>

        <DsTabs
          items={[
            { id: 'operations', label: 'Operations' },
            { id: 'missions', label: 'Missions' },
          ]}
          activeId={workspaceTab}
          onChange={(id) => setWorkspaceTab(id as 'operations' | 'missions')}
        />

        {workspaceTab === 'operations' ? (
          <article className="relative min-h-0 overflow-hidden rounded-xl border border-[#20527d] bg-[rgba(9,34,60,.82)] p-0">
            <img className="h-full min-h-[54vh] w-full object-cover brightness-[.78] saturate-[.95]" src="/assets/background/reference-home-dashboard.png" alt="Atelier frigoriste" loading="eager" />
            <div className="absolute inset-x-0 bottom-0 space-y-3 bg-[linear-gradient(180deg,transparent,rgba(2,11,22,.92)_54%)] p-5">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="font-['Rajdhani'] text-3xl uppercase tracking-wide"
              >
                Centre d intervention frigorifique
              </motion.h2>
              <p className="text-[#8ba7c2]">
                Workflow metier: mission, schema, mesures, diagnostic, reparation.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Link to="/level/1" className={actionLinkClass}>Demarrer niveau 1</Link>
                <Link to="/missions" className={actionLinkClass}>Toutes les missions</Link>
                <span className="text-sm text-[#91b8d7]">{isLoaded ? 'Systeme pret' : 'Chargement des installations'}</span>
              </div>
            </div>
          </article>
        ) : (
          <article className="rounded-xl border border-[#20527d] bg-[rgba(9,34,60,.82)] p-3">
            <header className="flex items-center justify-between gap-2">
              <h3 className="m-0 font-['Rajdhani'] text-2xl uppercase">Tableau des interventions</h3>
              {!isLoaded && <small className="text-[#8ba7c2]">Chargement des installations...</small>}
            </header>
            <div className="mt-3 grid max-h-[62vh] gap-2 overflow-auto pr-1">
              {Array.from({ length: 6 }, (_, index) => {
                const level = index + 1
                const locked = level > effectiveUnlockedLevel
                const meta = levelMeta[level]
                const thumbnail = getLevelThumbnail(meta.kind)

                return (
                  <motion.div
                    key={level}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    className={`grid gap-2 rounded-lg border p-2 ${locked ? 'border-[#2c618f]/60 bg-[rgba(9,31,56,.66)] opacity-80' : 'border-[#2c618f] bg-[rgba(9,31,56,.84)]'}`}
                  >
                    <div className="grid grid-cols-[88px_1fr] items-center gap-2">
                      <img className="h-16 w-full rounded-lg border border-[#315f86] object-cover" src={thumbnail} alt={meta.label} loading="lazy" />
                      <div>
                        <h2 className="m-0 text-base text-[#e8f3ff]">{meta.label}</h2>
                        <span className="text-sm text-[#8ba7c2]">{locked ? 'A planifier' : 'Disponible'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-full border px-2 py-1 text-xs ${locked ? 'border-[#596f8d] text-[#8ba7c2]' : level === 1 ? 'border-[#9f3a47] text-[#ffb8bf]' : 'border-[#2a73aa] text-[#d9f2ff]'}`}>
                        {locked ? interventionStatus[index] : level === 1 ? 'Urgent' : 'En cours'}
                      </span>
                      {locked ? (
                        <DsButton disabled variant="ghost">Planifie</DsButton>
                      ) : (
                        <DsButton to={`/level/${level}`}>Intervenir</DsButton>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </article>
        )}
      </section>
    </main>
  )
}
