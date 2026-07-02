import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { DsBadge, DsButton, DsCard, DsProgressBar } from '../design-system'

interface FaultScenario {
  id: string
  title: string
  brief: string
  faultIds: string[]
  difficulty: 'Facile' | 'Moyen' | 'Difficile'
}

const chapterOneScenarioBlueprint: Omit<FaultScenario, 'faultIds'>[] = [
  { id: 'c1-s1', title: 'Panne 1 - Contacteur ne colle plus', brief: 'Le compresseur ne part pas au demarrage.', difficulty: 'Facile' },
  { id: 'c1-s2', title: 'Panne 2 - Sonde air incoherente', brief: 'La regulation derive avec mesures instables.', difficulty: 'Facile' },
  { id: 'c1-s3', title: 'Panne 3 - Coupure intermittente compresseur', brief: 'Arrets frequents en charge.', difficulty: 'Moyen' },
  { id: 'c1-s4', title: 'Panne 4 - Surconsommation compresseur', brief: 'Intensite anormale et rendement faible.', difficulty: 'Moyen' },
  { id: 'c1-s5', title: 'Panne 5 - Remontee de temperature meuble', brief: 'Le froid devient insuffisant.', difficulty: 'Moyen' },
  { id: 'c1-s6', title: 'Panne 6 - Commande electrique instable', brief: 'Les etats changent de facon erratique.', difficulty: 'Moyen' },
  { id: 'c1-s7', title: 'Panne 7 - Defaut simultane commande + regulation', brief: 'Deux symptomes se cumulent.', difficulty: 'Difficile' },
  { id: 'c1-s8', title: 'Panne 8 - Defaut severe de maintien en temperature', brief: 'Le meuble sort vite de sa plage cible.', difficulty: 'Difficile' },
  { id: 'c1-s9', title: 'Panne 9 - Diagnostic electrique complet requis', brief: 'Le schema electrique devient prioritaire.', difficulty: 'Difficile' },
  { id: 'c1-s10', title: 'Panne 10 - Cas final chapitre 1', brief: 'Intervention complete de verification finale.', difficulty: 'Difficile' },
]

const fallbackDifficultyByFaultCount = (count: number): FaultScenario['difficulty'] => {
  if (count <= 1) return 'Facile'
  if (count === 2) return 'Moyen'
  return 'Difficile'
}

export function FaultSelectionScreen() {
  const { levelId } = useParams()
  const level = Number(levelId)
  const navigate = useNavigate()

  const installations = useGameStore((state) => state.installations)
  const isLoaded = useGameStore((state) => state.isLoaded)
  const loadInstallations = useGameStore((state) => state.loadInstallations)

  useEffect(() => {
    if (!isLoaded) {
      void loadInstallations()
    }
  }, [isLoaded, loadInstallations])

  const definition = useMemo(
    () => installations.find((item) => item.level === level),
    [installations, level],
  )

  const scenarios = useMemo<FaultScenario[]>(() => {
    if (!definition) {
      return []
    }

    const faults = definition.faults
    if (faults.length === 0) {
      return []
    }

    if (level === 1) {
      const cycle = (index: number) => faults[index % faults.length]?.id

      return chapterOneScenarioBlueprint.map((scenario, index) => {
        const primary = cycle(index)
        const secondary = cycle(index + 2)
        const tertiary = cycle(index + 4)

        const faultIds =
          index < 4
            ? [primary].filter(Boolean) as string[]
            : index < 8
              ? [primary, secondary].filter(Boolean) as string[]
              : [primary, secondary, tertiary].filter(Boolean) as string[]

        return {
          ...scenario,
          faultIds,
          difficulty: index < 4 ? 'Facile' : index < 8 ? 'Moyen' : 'Difficile',
        }
      })
    }

    return faults.map((fault, index) => ({
      id: `lvl-${level}-f-${fault.id}`,
      title: `Panne ${index + 1} - ${fault.name}`,
      brief: fault.description,
      difficulty: fallbackDifficultyByFaultCount(1),
      faultIds: [fault.id],
    }))
  }, [definition, level])

  if (!Number.isFinite(level)) {
    return (
      <main className="loading-shell">
        <p>Niveau invalide.</p>
        <Link to="/">Retour menu</Link>
      </main>
    )
  }

  if (!definition) {
    return (
      <main className="loading-shell">
        <p>Chargement des pannes...</p>
        <Link to="/">Retour menu</Link>
      </main>
    )
  }

  return (
    <main className="app-screen min-h-screen bg-[linear-gradient(145deg,#030a15,#081a33_56%,#0f2748)] px-4 py-5">
      <section className="app-shell mx-auto grid w-full max-w-[1180px] gap-4 rounded-2xl border border-[#27679e] bg-[linear-gradient(180deg,rgba(8,31,58,.93),rgba(5,18,35,.92))] p-4 shadow-[0_12px_28px_rgba(2,8,15,.34)]">
        <header className="space-y-2">
          <h1 className="font-['Rajdhani'] text-3xl uppercase tracking-wide text-[#e8f3ff]">Choix de la panne</h1>
          <p className="text-[#8ba7c2]">
            {definition.model} - Choisir un cas de panne avant de commencer l intervention.
          </p>
        </header>

        <div className="app-scroll-y grid grid-cols-1 gap-3 lg:grid-cols-2">
          {scenarios.map((scenario, index) => (
            <motion.div
              key={scenario.id}
              className="grid gap-2 transition hover:-translate-y-[2px]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
            >
              <DsCard title={scenario.title} subtitle={scenario.brief} variant="elevated">
                <DsBadge tone={scenario.difficulty === 'Difficile' ? 'fault' : scenario.difficulty === 'Moyen' ? 'warn' : 'ok'}>
                  Difficulte: {scenario.difficulty}
                </DsBadge>
                <DsProgressBar
                  label="Complexite"
                  value={scenario.difficulty === 'Difficile' ? 90 : scenario.difficulty === 'Moyen' ? 60 : 30}
                  tone={scenario.difficulty === 'Difficile' ? 'fault' : scenario.difficulty === 'Moyen' ? 'warn' : 'ok'}
                />
                <details className="rounded-md border border-[#2a5f8f] bg-[rgba(4,18,34,.75)] px-2 py-1 text-[#8ba7c2]">
                  <summary className="cursor-pointer text-[#ccecff]">Voir pannes associees</summary>
                  <p className="mt-2 mb-0">IDs: {scenario.faultIds.join(', ')}</p>
                </details>
                <DsButton
                  onClick={() => {
                    const query = new URLSearchParams({
                      faults: scenario.faultIds.join(','),
                      scenario: scenario.id,
                    })
                    navigate(`/level/${level}?${query.toString()}`)
                  }}
                >
                  Lancer ce scenario
                </DsButton>
              </DsCard>
            </motion.div>
          ))}
        </div>

        <footer className="flex justify-end">
          <DsButton to="/">Retour menu</DsButton>
        </footer>
      </section>
    </main>
  )
}
