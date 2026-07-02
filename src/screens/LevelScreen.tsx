import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getLevelBackground } from '../config/visuals'
import { useSimulationTick } from '../hooks/useSimulationTick'
import { ToolPanel } from '../ui/ToolPanel'
import { GameModal } from '../ui/components/GameModal'
import { FloatingActionDock } from '../ui/components/FloatingActionDock'
import { useGameStore } from '../store/gameStore'
import { fallbackMissionClientContext, missionClientContextByLevel } from '../data/missions/missionContext'
import fx from './LevelScreen.effects.module.css'
import { DsButton, DsHUDStat, DsMissionCard, DsProgressBar, DsTabs, successBurst } from '../design-system'

const missionLabels = {
  ARRIVEE_SITE: 'Arrivee sur site',
  LOCALISATION_PANNE: 'Localisation de la panne',
  MESURES: 'Mesures et verification',
  DIAGNOSTIC: 'Diagnostic technique',
  REPARATION: 'Reparation en cours',
  TEST_FINAL: 'Test final',
  VALIDATION: 'Intervention validee',
} as const

type ProtocolStatus = 'pending' | 'active' | 'done'

interface MissionProtocolStep {
  id: 'electrical' | 'measurement' | 'diagnostic' | 'correction' | 'validation'
  title: string
  detail: string
  status: ProtocolStatus
}

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
    title: 'Briefing mission',
    body: 'Le magasin signale une derive de temperature. Suivez la procedure terrain avant toute reparation.',
    action: 'Aller au magasin',
  },
  STORE_ENTRY: {
    title: 'Entree magasin',
    body: 'Vous arrivez sur site. Observez le contexte client avant de vous approcher du rayon froid.',
    action: 'Entrer dans le magasin',
  },
  STORE_AISLE: {
    title: 'Rayon froid',
    body: 'Vous avancez dans le rayon pour localiser le meuble en defaut et preparer vos mesures.',
    action: 'Aller au meuble',
  },
  DISPLAY_CASE: {
    title: 'Devant le meuble',
    body: 'Le meuble est localise. Vous pouvez maintenant ouvrir l atelier de diagnostic et commencer l intervention.',
    action: 'Commencer intervention',
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
    hotspotHint: 'Appuyer sur le meuble pour vous approcher',
    hotspotPolygon: '465,215 932,240 925,870 445,855',
  },
  DISPLAY_CASE: {
    image: '/assets/scenes/meuble-zone-v2.png',
    imageAlt: 'Meuble positif',
    hotspotLabel: 'Meuble positif',
    hotspotHint: 'Appuyer sur le meuble pour ouvrir l atelier',
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
  const level = Number(levelId)
  const navigate = useNavigate()
  const [journeyStep, setJourneyStep] = useState<MissionJourneyStep>('INTRO')
  const [showSidebar, setShowSidebar] = useState(false)
  const [activeWorkshopPopup, setActiveWorkshopPopup] = useState<'mission' | 'technical' | 'tools' | null>(null)
  const [activeZoneQuick, setActiveZoneQuick] = useState<'meuble' | 'schema-frigo' | 'schema-elec' | 'regulateur'>('meuble')
  const showHotspotDebug = import.meta.env.DEV

  const installations = useGameStore((state) => state.installations)
  const isLoaded = useGameStore((state) => state.isLoaded)
  const runtime = useGameStore((state) => state.runtime)
  const missionStep = useGameStore((state) => state.missionStep)
  const selectedTool = useGameStore((state) => state.selectedTool)
  const missionStats = useGameStore((state) => state.missionStats)
  const startLevel = useGameStore((state) => state.startLevel)
  const loadInstallations = useGameStore((state) => state.loadInstallations)
  const tick = useGameStore((state) => state.tick)
  const validateMission = useGameStore((state) => state.validateMission)

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

  const missionContext = missionClientContextByLevel[level] ?? fallbackMissionClientContext

  const safeBaseBoxTemp = definition?.base.boxTemp ?? 0
  const safeHp = runtime?.thermo.hp ?? 0
  const safeBp = runtime?.thermo.bp ?? 0
  const safeBoxTemp = runtime?.thermo.boxTemp ?? safeBaseBoxTemp
  const safeElectricalReady = runtime?.thermo.electricalPower ?? false
  const safeAlarms = runtime?.alarms ?? []
  const safeActiveFaultCount = runtime?.activeFaultIds.length ?? 0
  const safeMeasurements = missionStats?.measurements ?? 0

  const hasActiveFault = safeActiveFaultCount > 0
  const elapsed = missionStats ? Math.floor(missionStats.elapsedSeconds) : 0
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0')
  const seconds = (elapsed % 60).toString().padStart(2, '0')

  const objectiveMeasureDone = safeMeasurements >= 2
  const objectiveRepairDone = safeActiveFaultCount === 0
  const objectiveStabilityDone = safeBoxTemp <= safeBaseBoxTemp + 1.5
  const electricalReady = safeElectricalReady
  const diagnosisStarted = missionStep === 'DIAGNOSTIC' || missionStep === 'REPARATION' || missionStep === 'TEST_FINAL' || missionStep === 'VALIDATION'

  const missionProtocol = useMemo<MissionProtocolStep[]>(() => [
    {
      id: 'electrical',
      title: 'Securite electrique',
      detail: 'Confirmer la presence alimentation et l etat commande avant mesure avancee.',
      status: electricalReady ? 'done' : 'active',
    },
    {
      id: 'measurement',
      title: 'Releve de mesures',
      detail: `Executer au moins 2 mesures fiables (actuel: ${safeMeasurements}).`,
      status: objectiveMeasureDone ? 'done' : electricalReady ? 'active' : 'pending',
    },
    {
      id: 'diagnostic',
      title: 'Hypothese technique',
      detail: 'Croiser pressions, temperatures, intensites et alarms avant action.',
      status: diagnosisStarted ? 'done' : objectiveMeasureDone ? 'active' : 'pending',
    },
    {
      id: 'correction',
      title: 'Correction ciblee',
      detail: 'Traiter la cause racine et eviter les remplacements au hasard.',
      status: objectiveRepairDone ? 'done' : diagnosisStarted ? 'active' : 'pending',
    },
    {
      id: 'validation',
      title: 'Validation thermique',
      detail: `Stabiliser la temperature proche base (${safeBaseBoxTemp.toFixed(1)} C).`,
      status: missionStep === 'VALIDATION' ? 'done' : objectiveRepairDone && objectiveStabilityDone ? 'active' : 'pending',
    },
  ], [diagnosisStarted, electricalReady, missionStep, objectiveMeasureDone, objectiveRepairDone, objectiveStabilityDone, safeBaseBoxTemp, safeMeasurements])

  const protocolCompletion = Math.round((missionProtocol.filter((step) => step.status === 'done').length / missionProtocol.length) * 100)

  if (!definition) {
    return (
      <main className="loading-shell">
        <p>Chargement du niveau...</p>
        <Link to="/missions">Retour missions</Link>
      </main>
    )
  }

  if (!runtime) {
    return (
      <main className="loading-shell">
        <p>Initialisation du moteur de simulation...</p>
        <DsButton onClick={() => startLevel(level)}>Reessayer</DsButton>
        <Link to="/missions">Retour missions</Link>
      </main>
    )
  }

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
            src={interactiveStep ? interactiveStep.image : '/assets/background/home-hangar.png'}
            alt={interactiveStep ? interactiveStep.imageAlt : 'Contexte mission'}
          />

          {interactiveStep && (
            <svg
              viewBox="0 0 1000 1000"
              className={`${fx.sceneOverlaySvg} ${showHotspotDebug ? fx.debugHotspot : ''}`}
              role="img"
              aria-label={interactiveStep.hotspotLabel}
            >
              <polygon
                points={interactiveStep.hotspotPolygon}
                className={fx.sceneHotspotShape}
                role="button"
                tabIndex={0}
                aria-label={interactiveStep.hotspotLabel}
                onClick={() => {
                  if (journeyStep === 'DISPLAY_CASE') {
                    navigate(`/level/${level}/zone/meuble`)
                    return
                  }

                  setJourneyStep(nextJourneyStep(journeyStep))
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    if (journeyStep === 'DISPLAY_CASE') {
                      navigate(`/level/${level}/zone/meuble`)
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
            <article className={fx.missionClientBrief}>
              <h3>Contexte client</h3>
              <p>{missionContext.customer} - {missionContext.role}</p>
              <p className={fx.customerLine}>"{missionContext.dialogue.customerLine}"</p>
              <p className={fx.technicianLine}>Technicien: "{missionContext.dialogue.technicianLine}"</p>
            </article>
            <div className="scene-briefing-grid">
              <span>Objectif: Identifier la panne sans remplacer au hasard</span>
              <span>Priorite: Securite electrique puis mesures</span>
              <span>Outils: Manifold, multimetre, thermometre</span>
            </div>
            <div className="mission-flow-actions">
              <DsButton variant="secondary" onClick={() => setJourneyStep(previousJourneyStep(journeyStep))}>Retour</DsButton>
              {!interactiveStep && (
                <DsButton onClick={() => setJourneyStep(nextJourneyStep(journeyStep))}>
                  {content.action}
                </DsButton>
              )}
              <Link to="/missions">Quitter mission</Link>
            </div>
          </figcaption>
        </figure>
      </main>
    )
  }

  const sceneBackground = getLevelBackground(definition.kind)

  return (
    <main className={`game-shell software-level-shell grid min-h-screen ${showSidebar ? 'grid-cols-1 xl:grid-cols-[330px_1fr]' : 'grid-cols-1'}`}>
      {showSidebar && (
        <aside className="game-sidebar border-r border-[#1f5788] bg-[linear-gradient(180deg,rgba(6,29,53,.93),rgba(4,16,30,.92))] p-3">
          <div className="brand-block">
            <h1>FRIGORISTE MANAGER</h1>
            <p>Intervention professionnelle</p>
          </div>

          <DsMissionCard
            title={definition.missionTitle}
            description={definition.missionDescription}
            statusLabel={`Etape: ${missionLabels[missionStep]}`}
            statusTone={hasActiveFault ? 'warn' : 'ok'}
            progress={protocolCompletion}
            actions={(
              <>
                <DsButton onClick={validateMission}>Valider intervention</DsButton>
                <DsButton variant="secondary" to="/missions">Retour missions</DsButton>
              </>
            )}
          />

          <figure className="mission-visual-card">
            <img src={sceneBackground} alt={definition.model} loading="lazy" />
            <figcaption>{definition.model}</figcaption>
          </figure>

          <ToolPanel installation={definition} selectedTool={selectedTool} runtime={runtime} />

        </aside>
      )}

      <section className="game-main level-main-compact grid gap-3 p-3">
        <FloatingActionDock
          title="Atelier rapide"
          actions={[
            {
              id: 'sidebar',
              label: showSidebar ? 'Masquer barre mission' : 'Afficher barre mission',
              onClick: () => setShowSidebar((current) => !current),
              variant: 'secondary',
              hint: 'Bascule la barre mission pour liberer la vue',
            },
            {
              id: 'mission-popup',
              label: 'Popup mission',
              onClick: () => setActiveWorkshopPopup('mission'),
              hint: 'Ouvrir le protocole complet en fenetre',
            },
            {
              id: 'technical-popup',
              label: 'Popup technique',
              onClick: () => setActiveWorkshopPopup('technical'),
              hint: 'Afficher la synthese technique detaillee',
            },
            {
              id: 'tools-popup',
              label: 'Popup outils',
              onClick: () => setActiveWorkshopPopup('tools'),
              hint: 'Acceder aux outils sans couvrir la scene',
            },
          ]}
        />

        <div className="zone-menu-inline">
          <DsTabs
            items={[
              { id: 'meuble', label: 'Meuble' },
              { id: 'schema-frigo', label: 'Schema frigo' },
              { id: 'schema-elec', label: 'Schema elec' },
              { id: 'regulateur', label: 'Regulateur' },
            ]}
            activeId={activeZoneQuick}
            onChange={(id) => {
              const next = id as 'meuble' | 'schema-frigo' | 'schema-elec' | 'regulateur'
              setActiveZoneQuick(next)
              openZone(next)
            }}
          />
        </div>

        <header className="hud-row">
          <DsHUDStat label="Installation" value={definition.model} />
          <DsHUDStat label="HP / BP" value={`${safeHp.toFixed(1)} / ${safeBp.toFixed(1)} bar`} />
          <DsHUDStat label="Temperature enceinte" value={`${safeBoxTemp.toFixed(1)} C`} tone={objectiveStabilityDone ? 'ok' : 'warn'} />
          <DsHUDStat label="Alarme active" value={`${hasActiveFault ? runtime.activeFaultIds.length : 0}`} tone={hasActiveFault ? 'warn' : 'ok'} />
          <DsHUDStat label="Temps mission" value={`${minutes}:${seconds}`} />
        </header>

        {missionStep === 'VALIDATION' && (
          <motion.section
            className="mission-complete-banner"
            role="status"
            aria-live="polite"
            initial={successBurst.initial}
            animate={successBurst.animate}
            transition={successBurst.transition}
          >
            <div>
              <strong>Intervention validee</strong>
              <p>
                Panne resolue, temperature stabilisee et intervention techniquement validee.
              </p>
              {missionStats && (
                <p>
                  Mesures: {missionStats.measurements} | Reparation: {missionStats.repairs}/{missionStats.requiredRepairs} | Temps: {minutes}:{seconds}
                </p>
              )}
            </div>
            <div className="mission-complete-actions">
              {level < 6 && <DsButton to={`/level/${level + 1}`}>Niveau suivant</DsButton>}
              <DsButton to={`/level/${level}`}>Rejouer ce niveau</DsButton>
            </div>
          </motion.section>
        )}

        <section className="level-focus-grid">
          <article className="zone-scene-card level-scene-main">
            <img src="/assets/scenes/meuble-zone-v2.png" alt="Meuble en intervention" />
          </article>

          <aside className="level-quick-panel">
            <h3>Actions directes</h3>
            <p>Interface simplifiee: scene centrale + navigation rapide.</p>
            <DsProgressBar
              label="Progression protocole"
              value={protocolCompletion}
              tone={protocolCompletion >= 75 ? 'ok' : protocolCompletion >= 40 ? 'warn' : 'neutral'}
            />
            <div className="level-quick-actions">
              <DsButton onClick={() => openZone('meuble')}>Vue eclatee meuble</DsButton>
              <DsButton variant="secondary" onClick={() => openZone('schema-frigo')}>Schema frigo</DsButton>
              <DsButton variant="secondary" onClick={() => openZone('schema-elec')}>Schema elec</DsButton>
              <DsButton variant="ghost" onClick={() => openZone('regulateur')}>Regulateur</DsButton>
              <DsButton variant="success" onClick={validateMission}>Valider intervention</DsButton>
            </div>
          </aside>
        </section>

        {activeWorkshopPopup === 'mission' && (
          <GameModal
            title="Protocole intervention frigoriste"
            subtitle="Detail complet des etapes de mission"
            onClose={() => setActiveWorkshopPopup(null)}
            footer={<DsButton variant="secondary" onClick={() => setActiveWorkshopPopup(null)}>Fermer</DsButton>}
          >
            <section className="mission-objective-panel">
              <header>
                <h3>Sequence metier</h3>
                <p>Suivez la sequence complete pour un diagnostic fiable et une reparation propre.</p>
              </header>
              <div className="mission-protocol-grid">
                {missionProtocol.map((step) => (
                  <article key={step.id} className={`mission-protocol-step is-${step.status}`}>
                    <strong>{step.title}</strong>
                    <p>{step.detail}</p>
                  </article>
                ))}
              </div>
            </section>
          </GameModal>
        )}

        {activeWorkshopPopup === 'technical' && (
          <GameModal
            title="Lecture technique instantanee"
            subtitle="Synthese terrain en pop-up"
            onClose={() => setActiveWorkshopPopup(null)}
            footer={<DsButton variant="secondary" onClick={() => setActiveWorkshopPopup(null)}>Fermer</DsButton>}
          >
            <section className="mission-technical-panel">
              <header>
                <h3>Lecture technique instantanee</h3>
                <p>Reperez la cause probable avant d ouvrir les schemas detailles.</p>
              </header>
              <div className="mission-technical-grid">
                <article>
                  <small>Etat electrique</small>
                  <strong className={electricalReady ? 'ok' : 'warn'}>{electricalReady ? 'Alimentation OK' : 'Anomalie electrique'}</strong>
                </article>
                <article>
                  <small>Thermique enceinte</small>
                  <strong className={objectiveStabilityDone ? 'ok' : 'warn'}>{safeBoxTemp.toFixed(1)} C</strong>
                </article>
                <article>
                  <small>Pressions process</small>
                  <strong>{safeHp.toFixed(1)} / {safeBp.toFixed(1)} bar</strong>
                </article>
                <article>
                  <small>Alarmes</small>
                  <strong className={hasActiveFault ? 'warn' : 'ok'}>{safeAlarms.length > 0 ? safeAlarms.join(', ') : 'Aucune alarme'}</strong>
                </article>
              </div>
            </section>
          </GameModal>
        )}

        {activeWorkshopPopup === 'tools' && (
          <GameModal
            title="Panneau outils"
            subtitle="Mesures et reparations rapides"
            onClose={() => setActiveWorkshopPopup(null)}
            footer={<DsButton variant="secondary" onClick={() => setActiveWorkshopPopup(null)}>Fermer</DsButton>}
          >
            <ToolPanel installation={definition} selectedTool={selectedTool} runtime={runtime} />
          </GameModal>
        )}
      </section>
    </main>
  )
}
