import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'

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
    <main className="fault-select-shell">
      <section className="fault-select-panel">
        <header>
          <h1>Choix de la panne</h1>
          <p>
            {definition.model} - Choisir un cas de panne avant de commencer l intervention.
          </p>
        </header>

        <div className="fault-select-grid">
          {scenarios.map((scenario, index) => (
            <motion.button
              key={scenario.id}
              type="button"
              className="fault-choice-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
              onClick={() => {
                const query = new URLSearchParams({
                  faults: scenario.faultIds.join(','),
                  scenario: scenario.id,
                })
                navigate(`/level/${level}?${query.toString()}`)
              }}
            >
              <strong>{scenario.title}</strong>
              <span>{scenario.brief}</span>
              <small>Difficulte: {scenario.difficulty}</small>
            </motion.button>
          ))}
        </div>

        <footer className="fault-select-footer">
          <Link to="/">Retour menu</Link>
        </footer>
      </section>
    </main>
  )
}
