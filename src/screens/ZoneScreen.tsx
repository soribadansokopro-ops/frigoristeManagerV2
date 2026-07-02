import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSimulationTick } from '../hooks/useSimulationTick'
import { SimpleLearningSchema } from '../ui/Diagram/SimpleLearningSchema'
import { ExplodedMeubleView } from '../ui/Diagram/ExplodedMeubleView'
import { FloatingActionDock } from '../ui/components/FloatingActionDock'
import { useGameStore } from '../store/gameStore'
import { RegulatorPage } from '../pages/RegulatorPage'
import { DsButton, DsTabs } from '../design-system'

const zoneLabel: Record<string, string> = {
  meuble: 'Page meuble',
  'schema-frigo': 'Schema frigorifique',
  'schema-elec': 'Schema electrique',
  regulateur: 'Page regulateur',
}

const isKnownZone = (zoneId: string | undefined): zoneId is 'meuble' | 'schema-frigo' | 'schema-elec' | 'regulateur' =>
  zoneId === 'meuble' || zoneId === 'schema-frigo' || zoneId === 'schema-elec' || zoneId === 'regulateur'

export function ZoneScreen() {
  const { levelId, zoneId } = useParams()
  const level = Number(levelId)
  const navigate = useNavigate()
  const [showZoneHeader, setShowZoneHeader] = useState(false)

  const installations = useGameStore((state) => state.installations)
  const isLoaded = useGameStore((state) => state.isLoaded)
  const runtime = useGameStore((state) => state.runtime)
  const loadInstallations = useGameStore((state) => state.loadInstallations)
  const startLevel = useGameStore((state) => state.startLevel)
  const tick = useGameStore((state) => state.tick)

  useEffect(() => {
    if (!isLoaded) {
      void loadInstallations()
    }
  }, [isLoaded, loadInstallations])

  useEffect(() => {
    if (!Number.isFinite(level) || !isLoaded || installations.length === 0) {
      return
    }

    const definition = installations.find((item) => item.level === level)
    if (!definition) {
      return
    }

    if (!runtime || runtime.installationId !== definition.id) {
      startLevel(level)
    }
  }, [installations, isLoaded, level, runtime, startLevel])

  useSimulationTick(tick, Boolean(runtime))

  const definition = useMemo(
    () => installations.find((item) => item.level === level),
    [installations, level],
  )

  const safeZoneId = isKnownZone(zoneId) ? zoneId : 'schema-frigo'

  if (!definition || !runtime) {
    return (
      <main className="loading-shell">
        <p>Chargement zone...</p>
        <Link to={`/level/${level}`}>Retour atelier</Link>
      </main>
    )
  }

  const airFlowM3h = runtime.thermo.airFlowM3h ?? runtime.thermo.flowRatio * 3000
  const condenserApproach = runtime.thermo.condenserApproach ?? 10
  const airflowLow = airFlowM3h < 1700
  const condenserHot = condenserApproach > 14
  const electricalIssue = !runtime.thermo.electricalPower

  const nextZone = electricalIssue ? 'schema-elec' : airflowLow || condenserHot ? 'schema-frigo' : 'regulateur'
  const nextZoneLabel =
    nextZone === 'schema-elec'
      ? 'Schema elec'
      : nextZone === 'schema-frigo'
        ? 'Schema frigo'
        : 'Regulateur'

  return (
    <main className="zone-shell software-zone-shell grid min-h-screen grid-rows-[auto_1fr] gap-3 p-3">
      <FloatingActionDock
        title="Navigation zone"
        actions={[
          {
            id: 'toggle-zone-header',
            label: showZoneHeader ? 'Masquer navigation' : 'Afficher navigation',
            onClick: () => setShowZoneHeader((current) => !current),
            variant: 'secondary',
            hint: 'Afficher ou masquer les controles de navigation',
          },
          {
            id: 'open-navigation-target',
            label: `Aller ${nextZoneLabel}`,
            onClick: () => navigate(`/level/${level}/zone/${nextZone}`),
            hint: 'Navigation recommandee selon les mesures',
          },
          {
            id: 'open-schema-elec',
            label: 'Schema elec',
            onClick: () => navigate(`/level/${level}/zone/schema-elec`),
            hint: 'Acces rapide au schema electrique',
          },
          {
            id: 'back-workshop',
            label: 'Atelier complet',
            onClick: () => navigate(`/level/${level}`),
            variant: 'primary',
            hint: 'Revenir a la vue atelier complete',
          },
        ]}
      />

      {showZoneHeader && (
        <header className="zone-topbar">
          <div>
            <h1>{zoneLabel[safeZoneId] ?? 'Zone technique'}</h1>
            <p>{definition.model} - Page dediee a une seule vue technique</p>
          </div>
          <div className="zone-nav-buttons">
            <DsTabs
              items={[
                { id: 'meuble', label: 'Meuble' },
                { id: 'schema-frigo', label: 'Schema frigo' },
                { id: 'schema-elec', label: 'Schema elec' },
                { id: 'regulateur', label: 'Regulateur' },
              ]}
              activeId={safeZoneId}
              onChange={(id) => navigate(`/level/${level}/zone/${id}`)}
            />
            <DsButton to={`/level/${level}`}>Atelier complet</DsButton>
          </div>
        </header>
      )}

      {!isKnownZone(zoneId) && (
        <article className="schema-card">
          <header>
            <h3>Zone non reconnue</h3>
            <p>Redirection automatique sur schema frigo.</p>
          </header>
        </article>
      )}

      {safeZoneId === 'meuble' && (
        <ExplodedMeubleView
          model={definition.model}
          setpoint={runtime.regulator.setpoint}
          boxTemp={runtime.thermo.boxTemp}
          alarmsCount={runtime.alarms.length}
          electricalPower={runtime.thermo.electricalPower}
          airFlowM3h={airFlowM3h}
          condenserApproach={condenserApproach}
          onOpenFrigo={() => navigate(`/level/${level}/zone/schema-frigo`)}
          onOpenElec={() => navigate(`/level/${level}/zone/schema-elec`)}
          onOpenRegulator={() => navigate(`/level/${level}/zone/regulateur`)}
        />
      )}

      {safeZoneId === 'schema-frigo' && (
        <section className="zone-content-grid">
          <article className="schema-card">
            <header>
              <h3>Schema frigorifique simplifie</h3>
              <p>Schema statique: composants cliquables et informations par menu deroulant.</p>
            </header>
            <SimpleLearningSchema installation={definition} mode="schema-frigo" />
          </article>
        </section>
      )}

      {safeZoneId === 'schema-elec' && (
        <section className="zone-content-grid">
          <article className="schema-card">
            <header>
              <h3>Schema electrique simplifie</h3>
              <p>Schema statique: composants cliquables et informations par menu deroulant.</p>
            </header>
            <SimpleLearningSchema installation={definition} mode="schema-elec" />
          </article>
        </section>
      )}

      {safeZoneId === 'regulateur' && (
        <RegulatorPage
          installation={definition}
          runtime={runtime}
          onBack={() => navigate(`/level/${level}`)}
        />
      )}
    </main>
  )
}
