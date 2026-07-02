import { useEffect, useState } from 'react'
import { readUiPreferences, writeUiPreferences } from '../utils/uiPreferences'
import { DsBadge, DsButton, DsCard, DsProgressBar, DsTabs } from '../design-system'

export function SettingsScreen() {
  const [focusMode, setFocusMode] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [activeTab, setActiveTab] = useState('affichage')

  useEffect(() => {
    const current = readUiPreferences()
    setFocusMode(current.focusMode)
    setReducedMotion(current.reducedMotion)
  }, [])

  const apply = (nextFocusMode: boolean, nextReducedMotion: boolean) => {
    const current = readUiPreferences()
    writeUiPreferences({
      focusMode: nextFocusMode,
      reducedMotion: nextReducedMotion,
      soundEnabled: current.soundEnabled,
      soundVolume: current.soundVolume,
    })
    setFocusMode(nextFocusMode)
    setReducedMotion(nextReducedMotion)
  }

  return (
    <main className="app-screen min-h-screen bg-[linear-gradient(145deg,#030a15,#081a33_56%,#0f2748)] px-4 py-5">
      <section className="app-shell mx-auto grid w-full max-w-[980px] gap-4 rounded-2xl border border-[#27679e] bg-[linear-gradient(180deg,rgba(8,31,58,.93),rgba(5,18,35,.92))] p-4 shadow-[0_12px_28px_rgba(2,8,15,.34)]">
        <header className="space-y-2">
          <h1 className="font-['Rajdhani'] text-3xl uppercase tracking-wide text-[#e8f3ff]">Parametres interface</h1>
          <p className="text-[#8ba7c2]">Personnalise le rendu pour une lecture plus confortable.</p>
        </header>

        <div className="flex flex-wrap gap-2">
          <DsButton to="/">Retour accueil</DsButton>
          <DsButton variant="secondary" to="/missions">Aller aux missions</DsButton>
        </div>

        <DsTabs
          items={[
            { id: 'affichage', label: 'Affichage' },
            { id: 'accessibilite', label: 'Accessibilite' },
          ]}
          activeId={activeTab}
          onChange={setActiveTab}
        />

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <DsCard title="Mode lecture simple" subtitle="Clarte interface" variant="elevated">
            <p className="m-0 text-[#8ba7c2]">Reduit les effets decoratifs et augmente la lisibilite des contenus.</p>
            <DsBadge tone={focusMode ? 'ok' : 'neutral'}>{focusMode ? 'Actif' : 'Inactif'}</DsBadge>
            <DsProgressBar label="Confort visuel" value={focusMode ? 100 : 35} tone={focusMode ? 'ok' : 'warn'} />
            <DsButton onClick={() => apply(!focusMode, reducedMotion)}>
              {focusMode ? 'Desactiver' : 'Activer'}
            </DsButton>
          </DsCard>

          <DsCard title="Animations reduites" subtitle="Stabilite visuelle" variant="subtle">
            <p className="m-0 text-[#8ba7c2]">Diminue les animations pour un affichage plus stable.</p>
            <DsBadge tone={reducedMotion ? 'ok' : 'neutral'}>{reducedMotion ? 'Actif' : 'Inactif'}</DsBadge>
            <DsProgressBar label="Mouvement UI" value={reducedMotion ? 25 : 100} tone={reducedMotion ? 'warn' : 'ok'} />
            <DsButton variant="secondary" onClick={() => apply(focusMode, !reducedMotion)}>
              {reducedMotion ? 'Desactiver' : 'Activer'}
            </DsButton>
          </DsCard>
        </section>

        {activeTab === 'accessibilite' && (
          <DsCard title="Conseil accessibilite" subtitle="Reglage recommande" variant="subtle">
            <p className="text-[#8ba7c2]">
              Pour les longues sessions de diagnostic, active le mode lecture simple et garde les animations reduites uniquement si la scene te fatigue visuellement.
            </p>
          </DsCard>
        )}
      </section>
    </main>
  )
}
