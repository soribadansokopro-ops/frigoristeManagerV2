import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getLevelBackground, getLevelThumbnail } from '../config/visuals'
import { useSimulationTick } from '../hooks/useSimulationTick'
import { Toolbox } from '../ui/Tools/Toolbox'
import { GameViewport } from '../ui/GameViewport'
import { ToolPanel } from '../ui/ToolPanel'
import { MissionGuidePanel } from '../ui/Panels/MissionGuidePanel'
import { ProcessPanel } from '../ui/Panels/ProcessPanel'
import { useGameStore } from '../store/gameStore'

const missionLabels = {
  ARRIVEE_SITE: 'Arrivee sur site',
  LOCALISATION_PANNE: 'Localisation de la panne',
  MESURES: 'Mesures et verification',
  DIAGNOSTIC: 'Diagnostic technique',
  REPARATION: 'Reparation en cours',
  TEST_FINAL: 'Test final',
  VALIDATION: 'Intervention validee',
} as const

type MissionJourneyStep = 'INTRO' | 'STORE_ENTRY' | 'STORE_AISLE' | 'DISPLAY_CASE' | 'WORKSHOP'

const missionJourneyOrder: MissionJourneyStep[] = [
  'INTRO',
  'STORE_ENTRY',
  'STORE_AISLE',
  'DISPLAY_CASE',
  'WORKSHOP',
]

const missionJourneyText: Record<Exclude<MissionJourneyStep, 'WORKSHOP'>, { title: string; body: string; action: string }> = {
  INTRO: {
    title: 'Introduction du probleme',
    body: 'Le magasin signale une derive de temperature. Vous devez suivre la procedure terrain avant toute mesure.',
    action: 'Aller au magasin',
  },
  STORE_ENTRY: {
    title: 'Entree magasin',
    body: 'Vous arrivez a l entree du magasin. Verifiez le contexte et preparez votre intervention.',
    action: 'Entrer dans le magasin',
  },
  STORE_AISLE: {
    title: 'Rayon magasin',
    body: 'Vous avancez vers le rayon froid pour localiser l installation en defaut.',
    action: 'Aller au meuble',
  },
  DISPLAY_CASE: {
    title: 'Meuble positif',
    body: 'Vous etes devant le meuble. Ouvrez maintenant la zone de diagnostic pour mesurer et reparer.',
    action: 'Demarrer le diagnostic',
  },
}

const journeySceneConfig: Record<
  Extract<MissionJourneyStep, 'STORE_ENTRY' | 'STORE_AISLE' | 'DISPLAY_CASE'>,
  {
    image: string
    imageAlt: string
    hotspotLabel: string
    hotspotHint: string
    hotspotPolygon: string
  }
> = {
  STORE_ENTRY: {
    image: '/assets/background/freshmarket-entry.png',
    imageAlt: 'Entree du magasin',
    hotspotLabel: 'Porte entree',
    hotspotHint: 'Appuyer sur la porte pour entrer',
    hotspotPolygon: '390,260 620,260 660,845 355,845',
  },
  STORE_AISLE: {
    image: '/assets/background/store-aisle.png',
    imageAlt: 'Rayon magasin froid',
    hotspotLabel: 'Meuble frigorifique',
    hotspotHint: 'Appuyer sur le meuble pour aller au diagnostic',
    hotspotPolygon: '465,215 932,240 925,870 445,855',
  },
  DISPLAY_CASE: {
    image: '/assets/scenes/meuble-positif-page.png',
    imageAlt: 'Meuble positif',
    hotspotLabel: 'Meuble positif',
    hotspotHint: 'Appuyer sur le meuble pour ouvrir le schema frigo',
    hotspotPolygon: '196,175 820,165 870,810 150,820',
  },
}

const nextJourneyStep = (step: MissionJourneyStep): MissionJourneyStep => {
  const index = missionJourneyOrder.indexOf(step)
  if (index < 0 || index >= missionJourneyOrder.length - 1) {
    return 'WORKSHOP'
  }
  return missionJourneyOrder[index + 1]
}

const previousJourneyStep = (step: MissionJourneyStep): MissionJourneyStep => {
  const index = missionJourneyOrder.indexOf(step)
  if (index <= 0) {
    return 'INTRO'
  }
  return missionJourneyOrder[index - 1]
}

export function LevelScreen() {
  const { levelId } = useParams()
  const [searchParams] = useSearchParams()
  const level = Number(levelId)
  const navigate = useNavigate()
  const [journeyStep, setJourneyStep] = useState<MissionJourneyStep>('INTRO')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const appliedFaultPresetRef = useRef<string | null>(null)
  const showHotspotDebug = import.meta.env.DEV

  const installations = useGameStore((state) => state.installations)
  const isLoaded = useGameStore((state) => state.isLoaded)
  const runtime = useGameStore((state) => state.runtime)
  const missionStep = useGameStore((state) => state.missionStep)
  const selectedTool = useGameStore((state) => state.selectedTool)
  const startLevel = useGameStore((state) => state.startLevel)
  const loadInstallations = useGameStore((state) => state.loadInstallations)
  const tick = useGameStore((state) => state.tick)
  const movePlayer = useGameStore((state) => state.movePlayer)
  const setSelectedTool = useGameStore((state) => state.setSelectedTool)
  const validateMission = useGameStore((state) => state.validateMission)
  const setActiveFaults = useGameStore((state) => state.setActiveFaults)

  useEffect(() => {
    if (!isLoaded) {
      void loadInstallations()
    }
  }, [isLoaded, loadInstallations])

  useEffect(() => {
    if (!Number.isFinite(level)) {
      return
    }

    if (!isLoaded || installations.length === 0) {
      return
    }

    startLevel(level)
  }, [installations.length, isLoaded, level, startLevel])

  useSimulationTick(tick, Boolean(isLoaded && runtime && journeyStep === 'WORKSHOP'))

  const definition = useMemo(
    () => installations.find((item) => item.level === level),
    [installations, level],
  )

  const definitionKind = definition?.kind ?? 'DISPLAY_CASE_POSITIVE'
  const definitionId = definition?.id ?? null
  const sceneBackground = getLevelBackground(definitionKind)

  const journeyAsset = useMemo(() => {
    if (journeyStep === 'INTRO') {
      return '/assets/background/home-hangar.png'
    }
    if (journeyStep === 'DISPLAY_CASE') {
      return '/assets/scenes/meuble-positif-page.png'
    }
    if (journeyStep === 'STORE_ENTRY' || journeyStep === 'STORE_AISLE') {
      return journeySceneConfig[journeyStep].image
    }
    return getLevelThumbnail(definitionKind)
  }, [definitionKind, journeyStep])

  useEffect(() => {
    if (journeyStep !== 'WORKSHOP') {
      return
    }
    if (!Number.isFinite(level) || !isLoaded || installations.length === 0 || !definitionId) {
      return
    }

    if (!runtime || runtime.installationId !== definitionId) {
      startLevel(level)
    }
  }, [definitionId, installations.length, isLoaded, journeyStep, level, runtime, startLevel])

  const selectedFaultIds = useMemo(() => {
    const raw = searchParams.get('faults')
    if (!raw || !definition) {
      return [] as string[]
    }

    const valid = new Set(definition.faults.map((fault) => fault.id))
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && valid.has(item))
  }, [definition, searchParams])

  useEffect(() => {
    if (!runtime || !definition) {
      return
    }

    const presetKey = `${definition.id}:${selectedFaultIds.join('|')}`
    if (appliedFaultPresetRef.current === presetKey) {
      return
    }

    setActiveFaults(selectedFaultIds)
    appliedFaultPresetRef.current = presetKey
  }, [definition, runtime, selectedFaultIds, setActiveFaults])

  if (!definition) {
    return (
      <main className="loading-shell">
        <p>Chargement du niveau...</p>
        <Link to="/">Retour menu</Link>
      </main>
    )
  }

  const hasActiveFault = runtime ? runtime.activeFaultIds.length > 0 : false

  const openZone = (zoneId: 'meuble' | 'schema-frigo' | 'schema-elec' | 'regulateur') => {
    navigate(`/level/${level}/zone/${zoneId}`)
  }

  if (journeyStep !== 'WORKSHOP') {
    const content = missionJourneyText[journeyStep]
    const interactiveStep =
      journeyStep === 'STORE_ENTRY' || journeyStep === 'STORE_AISLE' || journeyStep === 'DISPLAY_CASE'
        ? journeySceneConfig[journeyStep]
        : null

    return (
      <main className="mission-flow-shell">
        <figure className="interactive-scene full-screen-scene">
          <img
            src={interactiveStep ? interactiveStep.image : journeyAsset}
            alt={interactiveStep ? interactiveStep.imageAlt : 'Contexte mission'}
          />

          {interactiveStep && (
            <svg
              viewBox="0 0 1000 1000"
              className={`scene-overlay-svg ${showHotspotDebug ? 'debug-hotspot' : ''}`}
              role="img"
              aria-label={interactiveStep.hotspotLabel}
            >
              <polygon
                points={interactiveStep.hotspotPolygon}
                className="scene-hotspot-shape"
                role="button"
                tabIndex={0}
                aria-label={interactiveStep.hotspotLabel}
                onClick={() => {
                  if (journeyStep === 'DISPLAY_CASE') {
                    setJourneyStep('WORKSHOP')
                    openZone('meuble')
                    return
                  }

                  setJourneyStep(nextJourneyStep(journeyStep))
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    if (journeyStep === 'DISPLAY_CASE') {
                      setJourneyStep('WORKSHOP')
                      openZone('meuble')
                      return
                    }

                    setJourneyStep(nextJourneyStep(journeyStep))
                  }
                }}
              />
            </svg>
          )}

          <figcaption className="scene-caption-overlay">
            <h1>{content.title}</h1>
            <p>{content.body}</p>
            <strong>{interactiveStep ? interactiveStep.hotspotHint : content.action}</strong>
            <div className="scene-briefing-grid">
              <span>Objectif: Localiser la panne reellement</span>
              <span>Priorite: Securite electrique puis mesures</span>
              <span>Outils: Manifold, multimetre, thermometre</span>
            </div>
            <div className="mission-flow-actions">
              <button type="button" onClick={() => setJourneyStep(previousJourneyStep(journeyStep))}>
                Retour
              </button>
              {!interactiveStep && (
                <button type="button" onClick={() => setJourneyStep(nextJourneyStep(journeyStep))}>
                  {content.action}
                </button>
              )}
              <Link to="/">Quitter la mission</Link>
            </div>
          </figcaption>
        </figure>
      </main>
    )
  }

  if (!runtime) {
    return (
      <main className="loading-shell">
        <p>Initialisation du moteur de simulation...</p>
        <button type="button" onClick={() => startLevel(level)}>
          Reessayer
        </button>
        <Link to="/">Retour menu</Link>
      </main>
    )
  }

  return (
    <main className="game-shell software-level-shell">
      <aside className="game-sidebar">
        <div className="brand-block">
          <h1>FRIGORISTE MANAGER</h1>
          <p>Intervention professionnelle</p>
        </div>

        <div className="mission-card">
          <h2>{definition.missionTitle}</h2>
          <p>{definition.missionDescription}</p>
          <strong>Etape: {missionLabels[missionStep]}</strong>
        </div>

        <figure className="mission-visual-card">
          <img src={sceneBackground} alt={definition.model} loading="lazy" />
          <figcaption>{definition.model}</figcaption>
        </figure>

        {showAdvanced && (
          <>
            <div className="movement-card">
              <h3>Deplacement technicien</h3>
              <div className="movement-grid">
                <button type="button" onClick={() => movePlayer(0, -18)}>
                  Haut
                </button>
                <button type="button" onClick={() => movePlayer(-18, 0)}>
                  Gauche
                </button>
                <button type="button" onClick={() => movePlayer(18, 0)}>
                  Droite
                </button>
                <button type="button" onClick={() => movePlayer(0, 18)}>
                  Bas
                </button>
              </div>
            </div>

            <ToolPanel installation={definition} selectedTool={selectedTool} runtime={runtime} />
          </>
        )}

        <div className="footer-actions">
          <button type="button" onClick={validateMission}>
            Valider intervention
          </button>
          <Link to="/">Retour menu</Link>
        </div>
      </aside>

      <section className="game-main">
        <nav className="zone-menu-inline" aria-label="Menu zones techniques">
          <button type="button" onClick={() => openZone('meuble')}>Meuble</button>
          <button type="button" onClick={() => openZone('schema-frigo')}>Schema frigo</button>
          <button type="button" onClick={() => openZone('schema-elec')}>Schema elec</button>
          <button type="button" onClick={() => openZone('regulateur')}>Regulateur</button>
        </nav>

        <header className="hud-row">
          <article>
            <small>Installation</small>
            <strong>{definition.model}</strong>
          </article>
          <article>
            <small>HP / BP</small>
            <strong>
              {runtime.thermo.hp.toFixed(1)} bar / {runtime.thermo.bp.toFixed(1)} bar
            </strong>
          </article>
          <article>
            <small>Temperature enceinte</small>
            <strong>{runtime.thermo.boxTemp.toFixed(1)} C</strong>
          </article>
          <article>
            <small>Alarme active</small>
            <strong className={hasActiveFault ? 'warn' : 'ok'}>
              {hasActiveFault ? runtime.activeFaultIds.length : 0}
            </strong>
          </article>
        </header>

        <div className="zone-nav-buttons">
          <button type="button" onClick={() => setShowAdvanced((current) => !current)}>
            {showAdvanced ? 'Mode essentiel' : 'Afficher details'}
          </button>
        </div>

        {showAdvanced && <Toolbox selectedTool={selectedTool} onSelect={setSelectedTool} />}

        <GameViewport
          installation={definition}
          runtime={runtime}
          backgroundImage={sceneBackground}
          onOpenMeuble={() => openZone('meuble')}
        />

        <section className="zone-content-grid">
          <MissionGuidePanel installation={definition} runtime={runtime} />
          {showAdvanced && <ProcessPanel runtime={runtime} />}
        </section>
      </section>
    </main>
  )
}
