import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { DsBadge, DsButton, DsCard, DsHUDStat, DsProgressBar, DsTabs } from '../design-system'

export function HistoryScreen() {
  const runtime = useGameStore((state) => state.runtime)
  const missionStep = useGameStore((state) => state.missionStep)
  const missionStats = useGameStore((state) => state.missionStats)
  const totalXp = useGameStore((state) => state.totalXp)
  const totalCredits = useGameStore((state) => state.totalCredits)

  const alarms = runtime?.alarms ?? []
  const lastReading = runtime?.lastReading
  const missionCompletion = missionStats?.requiredRepairs
    ? Math.round((missionStats.repairs / missionStats.requiredRepairs) * 100)
    : 0
  const [activeTab, setActiveTab] = useState<'synthese' | 'alarmes' | 'mesures'>('synthese')

  return (
    <main className="app-screen min-h-screen bg-[linear-gradient(145deg,#030a15,#081a33_56%,#0f2748)] px-4 py-5">
      <section className="app-shell mx-auto grid w-full max-w-[1180px] gap-4 rounded-2xl border border-[#27679e] bg-[linear-gradient(180deg,rgba(8,31,58,.93),rgba(5,18,35,.92))] p-4 shadow-[0_12px_28px_rgba(2,8,15,.34)]">
        <header className="space-y-2">
          <h1 className="font-['Rajdhani'] text-3xl uppercase tracking-wide text-[#e8f3ff]">Historique</h1>
          <p className="text-[#8ba7c2]">Resume des alarmes, mesures et etat de mission courant.</p>
        </header>

        <div className="flex flex-wrap gap-2">
          <DsButton to="/">Retour accueil</DsButton>
          <DsButton variant="secondary" to="/missions">Ouvrir missions</DsButton>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
          <DsHUDStat label="XP total" value={totalXp.toLocaleString('fr-FR')} tone="ok" />
          <DsHUDStat label="Credits" value={`${totalCredits.toLocaleString('fr-FR')} EUR`} />
          <DsHUDStat label="Etape mission" value={missionStep} />
          <DsHUDStat label="Alarmes" value={`${alarms.length}`} tone={alarms.length > 0 ? 'warn' : 'ok'} />
        </div>

        <DsTabs
          items={[
            { id: 'synthese', label: 'Synthese' },
            { id: 'alarmes', label: 'Alarmes' },
            { id: 'mesures', label: 'Mesures' },
          ]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as 'synthese' | 'alarmes' | 'mesures')}
        />

        {activeTab === 'synthese' && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <DsCard title="Progression joueur" subtitle="Recompenses cumulees">
              <p>XP total: {totalXp.toLocaleString('fr-FR')}</p>
              <p>Credits: {totalCredits.toLocaleString('fr-FR')} EUR</p>
              <DsProgressBar label="Reparation mission" value={missionCompletion} tone={missionCompletion >= 75 ? 'ok' : 'warn'} />
              {missionStats?.completed && (
                <p>Derniere mission: {missionStats.score} pts ({'★'.repeat(missionStats.stars)}{'☆'.repeat(3 - missionStats.stars)})</p>
              )}
            </DsCard>

            <DsCard title="Etat mission" subtitle="Progression operationnelle">
              <p>Etape actuelle: {missionStep}</p>
              <DsBadge tone={alarms.length > 0 ? 'warn' : 'ok'}>
                {alarms.length > 0 ? `${alarms.length} alarme(s)` : 'Aucune alarme'}
              </DsBadge>
            </DsCard>
          </div>
        )}

        {activeTab === 'mesures' && (
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
        )}

        {activeTab === 'alarmes' && (
          <DsCard title="Alarmes actives" subtitle="Priorites terrain">
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
        )}
      </section>
    </main>
  )
}
