import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { getLevelThumbnail } from '../config/visuals'
import type { InstallationKind } from '../types/game'
import { fallbackMissionClientContext, missionClientContextByLevel } from '../data/missions/missionContext'
import { DsBadge, DsButton, DsMissionCard, DsProgressBar, DsTabs } from '../design-system'

const levelMeta: Record<number, { label: string; kind: InstallationKind }> = {
  1: { label: 'Niveau 1 - Meuble groupe loge positif', kind: 'DISPLAY_CASE_POSITIVE' },
  2: { label: 'Niveau 2 - Meuble groupe loge negatif', kind: 'DISPLAY_CASE_NEGATIVE' },
  3: { label: 'Niveau 3 - Chambre froide positive', kind: 'COLD_ROOM_POSITIVE' },
  4: { label: 'Niveau 4 - Chambre froide negative', kind: 'COLD_ROOM_NEGATIVE' },
  5: { label: 'Niveau 5 - Centrale HFC positive', kind: 'RACK_POSITIVE' },
  6: { label: 'Niveau 6 - Centrale HFC negative', kind: 'RACK_NEGATIVE' },
}

const missionInsights: Record<number, { symptom: string; priority: string; sequence: string }> = {
  1: {
    symptom: 'Temperature produit instable sur meuble positif.',
    priority: 'Verifier debit air et etat regulation.',
    sequence: 'Mesures HP/BP -> Temperature -> Schema frigo -> Validation.',
  },
  2: {
    symptom: 'Derive negative et risque de givrage sur meuble.',
    priority: 'Controler degivrage puis circulation air.',
    sequence: 'Controle regulateur -> Mesures -> Schema elec -> Ajustement.',
  },
  3: {
    symptom: 'Chambre positive ne tient plus la consigne.',
    priority: 'Isoler cause frigorifique ou commande.',
    sequence: 'Observation locale -> Pressions -> Alimentation -> Correctif.',
  },
  4: {
    symptom: 'Performance insuffisante en regime negatif.',
    priority: 'Surveiller surchauffe/sous-refroidissement.',
    sequence: 'Releve thermodynamique -> Hypothese -> Reparation ciblee.',
  },
  5: {
    symptom: 'Instabilite sur centrale positive.',
    priority: 'Prioriser condenseur et repartition de charge.',
    sequence: 'HP/BP -> Intensites -> Circuit -> Stabilisation.',
  },
  6: {
    symptom: 'Centrale negative en perte de rendement.',
    priority: 'Securiser electrique puis diagnostiquer process.',
    sequence: 'Securite -> Mesures critiques -> Correction -> Test final.',
  },
}

export function MissionsScreen() {
  const unlockedLevel = useGameStore((state) => state.unlockedLevel)
  const bestScoreByLevel = useGameStore((state) => state.bestScoreByLevel)
  const effectiveUnlockedLevel = Number.isFinite(unlockedLevel) && unlockedLevel > 0 ? unlockedLevel : 1
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'done'>('all')

  const visibleLevels = useMemo(() => {
    const levels = Array.from({ length: 6 }, (_, index) => index + 1)
    if (activeTab === 'open') {
      return levels.filter((level) => level <= effectiveUnlockedLevel && (bestScoreByLevel[level] ?? 0) === 0)
    }
    if (activeTab === 'done') {
      return levels.filter((level) => (bestScoreByLevel[level] ?? 0) > 0)
    }
    return levels
  }, [activeTab, bestScoreByLevel, effectiveUnlockedLevel])

  return (
    <main className="app-screen min-h-screen bg-[linear-gradient(145deg,#030a15,#081a33_56%,#0f2748)] px-4 py-5">
      <section className="app-shell mx-auto grid w-full max-w-[1260px] gap-4 rounded-2xl border border-[#27679e] bg-[linear-gradient(180deg,rgba(8,31,58,.93),rgba(5,18,35,.92))] p-4 shadow-[0_12px_28px_rgba(2,8,15,.34)]">
        <header className="space-y-2">
          <h1 className="font-['Rajdhani'] text-3xl uppercase tracking-wide text-[#e8f3ff]">Missions</h1>
          <p className="text-[#8ba7c2]">Choisis un niveau. La panne pedagogique est attribuee automatiquement.</p>
          <p className="text-[#8ba7c2]">Objectif: intervention realiste, priorite aux mesures et au raisonnement technique.</p>
        </header>

        <div className="flex flex-wrap gap-2">
          <DsButton to="/">Retour accueil</DsButton>
          <DsButton variant="secondary" to="/formation">Voir la formation</DsButton>
        </div>

        <DsTabs
          items={[
            { id: 'all', label: 'Toutes les missions' },
            { id: 'open', label: 'Disponibles' },
            { id: 'done', label: 'Terminees' },
          ]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as 'all' | 'open' | 'done')}
        />

        <section className="app-scroll-y grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {visibleLevels.map((level, index) => {
            const locked = level > effectiveUnlockedLevel
            const meta = levelMeta[level]
            const thumbnail = getLevelThumbnail(meta.kind)
            const insight = missionInsights[level]
            const context = missionClientContextByLevel[level] ?? fallbackMissionClientContext

            return (
              <motion.div
                key={level}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                className={`grid gap-3 transition ${
                  locked
                    ? 'opacity-80'
                    : 'hover:-translate-y-[2px]'
                }`}
              >
                <DsMissionCard
                  title={meta.label}
                  description={locked ? 'Verrouille pour le moment.' : 'Disponible maintenant.'}
                  statusLabel={(bestScoreByLevel[level] ?? 0) > 0 ? 'Intervention terminee' : 'Intervention a faire'}
                  statusTone={(bestScoreByLevel[level] ?? 0) > 0 ? 'ok' : locked ? 'warn' : 'neutral'}
                  progress={(bestScoreByLevel[level] ?? 0) > 0 ? 100 : locked ? 0 : 30}
                  actions={
                    locked ? (
                      <DsButton disabled variant="ghost">Bloque</DsButton>
                    ) : (
                      <DsButton to={`/level/${level}`}>Lancer diagnostic</DsButton>
                    )
                  }
                >
                  <div className="overflow-hidden rounded-lg border border-[#315f86]">
                    <img
                      src={context.missionImage}
                      alt={meta.label}
                      loading="lazy"
                      className="h-36 w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = thumbnail
                      }}
                    />
                  </div>
                  <div className="rounded-lg border border-[#2a5f8f] bg-[rgba(8,29,52,.72)] p-2 text-sm text-[#8ba7c2]">
                    <p><strong className="text-[#d9f3ff]">Symptome:</strong> {insight.symptom}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <DsBadge tone={locked ? 'warn' : 'ok'}>{locked ? 'Verrouillee' : 'Prete'}</DsBadge>
                    </div>
                    <DsProgressBar
                      label="Etat mission"
                      value={(bestScoreByLevel[level] ?? 0) > 0 ? 100 : locked ? 0 : 30}
                      tone={(bestScoreByLevel[level] ?? 0) > 0 ? 'ok' : locked ? 'warn' : 'neutral'}
                    />
                    <details className="mt-2 rounded-md border border-[#2a5f8f] bg-[rgba(4,18,34,.75)] px-2 py-1">
                      <summary className="cursor-pointer text-[#ccecff]">Afficher details mission</summary>
                      <div className="mt-2 grid gap-1">
                        <p><strong className="text-[#d9f3ff]">Priorite:</strong> {insight.priority}</p>
                        <p><strong className="text-[#d9f3ff]">Sequence:</strong> {insight.sequence}</p>
                        <p className="mt-1 text-sm text-[#8ba7c2]">{context.customer} - {context.role}</p>
                        <p className="mt-1 text-sm text-[#d8f0ff]">"{context.dialogue.customerLine}"</p>
                        <p className="mt-1 text-sm text-[#a9f5ce]">Technicien: "{context.dialogue.technicianLine}"</p>
                      </div>
                    </details>
                  </div>
                </DsMissionCard>
              </motion.div>
            )
          })}
        </section>

        {visibleLevels.length === 0 && (
          <p className="rounded-lg border border-[#2a5f8f] bg-[rgba(8,29,52,.72)] p-3 text-[#8ba7c2]">
            Aucun resultat pour cet onglet.
          </p>
        )}
      </section>
    </main>
  )
}
