import { useMemo, useState } from 'react'
import { DsButton, DsCard, DsTabs } from '../design-system'

const modules = [
  {
    title: 'Sequence de diagnostic',
    points: [
      'Observer symptomes visuels et alarmes.',
      'Mesurer HP/BP puis temperatures cle.',
      'Confirmer par schema electrique et intensites.',
      'Reparer puis valider stabilite.',
    ],
  },
  {
    title: 'Lecture rapide des indicateurs',
    points: [
      'HP haute + courant haut: verifier condenseur.',
      'BP basse + surchauffe haute: verifier alimentation liquide.',
      'Debit air faible: verifier ventilateurs/evaporateur.',
      'Commande instable: suivre la chaine electrique.',
    ],
  },
  {
    title: 'Bonnes pratiques',
    points: [
      'Toujours partir des mesures de base.',
      'Eviter les remplacements sans preuve de mesure.',
      'Valider la temperature enceinte en fin de mission.',
    ],
  },
]

export function TrainingScreen() {
  const [activeModule, setActiveModule] = useState(modules[0]?.title ?? '')
  const currentModule = useMemo(
    () => modules.find((module) => module.title === activeModule) ?? modules[0],
    [activeModule],
  )

  return (
    <main className="app-screen min-h-screen bg-[linear-gradient(145deg,#030a15,#081a33_56%,#0f2748)] px-4 py-5">
      <section className="app-shell mx-auto grid w-full max-w-[1180px] gap-4 rounded-2xl border border-[#27679e] bg-[linear-gradient(180deg,rgba(8,31,58,.93),rgba(5,18,35,.92))] p-4 shadow-[0_12px_28px_rgba(2,8,15,.34)]">
        <header className="space-y-2">
          <h1 className="font-['Rajdhani'] text-3xl uppercase tracking-wide text-[#e8f3ff]">Formation</h1>
          <p className="text-[#8ba7c2]">Guide court pour progresser plus vite en depannage frigorifique.</p>
        </header>

        <div className="flex flex-wrap gap-2">
          <DsButton to="/">Retour accueil</DsButton>
          <DsButton variant="secondary" to="/missions">Ouvrir les missions</DsButton>
          <DsButton variant="ghost" to="/level/1">Aller a l atelier</DsButton>
        </div>

        <DsTabs
          items={modules.map((module) => ({ id: module.title, label: module.title }))}
          activeId={currentModule.title}
          onChange={setActiveModule}
        />

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <DsCard title={currentModule.title} subtitle="Fiche de reference terrain" variant="elevated">
            <ul className="m-0 grid list-disc gap-1 pl-5 text-[#8ba7c2]">
              {currentModule.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </DsCard>

          <DsCard title="Objectif pedagogique" subtitle="Apprentissage progressif" variant="subtle">
            <p className="text-[#8ba7c2]">
              Travaille un module a la fois, puis lance une mission pour appliquer directement les reflexes de diagnostic frigoriste.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <DsButton to="/missions">Passer a la pratique</DsButton>
              <DsButton variant="secondary" to="/historique">Voir mes progres</DsButton>
            </div>
          </DsCard>
        </div>
      </section>
    </main>
  )
}
