import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getLevelBackground } from '../config/visuals'
import { useSimulationTick } from '../hooks/useSimulationTick'
import { ElectricalDiagram } from '../ui/Diagram/Electrical/ElectricalDiagram'
import { RefrigerationDiagram } from '../ui/Diagram/RefrigerationDiagram'
import { AlarmPanel } from '../ui/Panels/AlarmPanel'
import { MissionGuidePanel } from '../ui/Panels/MissionGuidePanel'
import { ProcessPanel } from '../ui/Panels/ProcessPanel'
import { PropertiesPanel } from '../ui/Panels/PropertiesPanel'
import { RegulatorPanel } from '../ui/Panels/RegulatorPanel'
import { ElectricalSchematic } from '../ui/ElectricalSchematic'
import { RefrigerationSchematic } from '../ui/RefrigerationSchematic'
import { useGameStore } from '../store/gameStore'

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
  const [showMeubleMenu, setShowMeubleMenu] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)

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

  useEffect(() => {
    if (safeZoneId === 'meuble') {
      setShowMeubleMenu(true)
    }
  }, [safeZoneId])

  if (!definition || !runtime) {
    return (
      <main className="loading-shell">
        <p>Chargement zone...</p>
        <Link to={`/level/${level}`}>Retour atelier</Link>
      </main>
    )
  }

  const bg = getLevelBackground(definition.kind)

  return (
    <main className="zone-shell software-zone-shell">
      <header className="zone-topbar">
        <div>
          <h1>{zoneLabel[safeZoneId] ?? 'Zone technique'}</h1>
          <p>{definition.model} - Navigation zone interactive</p>
        </div>
        <div className="zone-nav-buttons">
          <button type="button" onClick={() => navigate(`/level/${level}/zone/meuble`)}>Meuble</button>
          <button type="button" onClick={() => navigate(`/level/${level}/zone/schema-frigo`)}>Schema frigo</button>
          <button type="button" onClick={() => navigate(`/level/${level}/zone/schema-elec`)}>Schema elec</button>
          <button type="button" onClick={() => navigate(`/level/${level}/zone/regulateur`)}>Regulateur</button>
          <button type="button" onClick={() => setShowAdvanced((current) => !current)}>
            {showAdvanced ? 'Mode essentiel' : 'Afficher details'}
          </button>
          <Link to={`/level/${level}`}>Atelier complet</Link>
        </div>
      </header>

      {!isKnownZone(zoneId) && (
        <article className="schema-card">
          <header>
            <h3>Zone non reconnue</h3>
            <p>Redirection automatique sur schema frigo.</p>
          </header>
        </article>
      )}

      {safeZoneId === 'meuble' && (
        <section className="zone-content-grid meuble-grid">
          <article className="zone-scene-card">
            <img src="/assets/scenes/meuble-positif-page.png" alt="Meuble positif" />
            <button
              type="button"
              className="zone-hidden-hotspot meuble-scene-hotspot"
              onClick={() => setShowMeubleMenu((current) => !current)}
              aria-label="Ouvrir le menu du meuble"
            >
              Ouvrir menu meuble
            </button>
          </article>

          <article className="schema-card meuble-menu-card">
            <header>
              <h3>Menu meuble</h3>
              <p>Cliquer sur le meuble dans l image pour afficher ce menu.</p>
            </header>
            <button
              type="button"
              className="meuble-menu-toggle"
              onClick={() => setShowMeubleMenu((current) => !current)}
            >
              {showMeubleMenu ? 'Masquer menu' : 'Afficher menu'}
            </button>
            {showMeubleMenu && (
              <div className="meuble-menu-actions">
                <button type="button" onClick={() => navigate(`/level/${level}/zone/schema-frigo`)}>
                  Schema frigo
                </button>
                <button type="button" onClick={() => navigate(`/level/${level}/zone/schema-elec`)}>
                  Schema elec
                </button>
                <button type="button" onClick={() => navigate(`/level/${level}/zone/regulateur`)}>
                  Regulateur
                </button>
              </div>
            )}

            {showAdvanced && (
              <div className="diagram-inspector compact">
                {Object.entries(runtime.components).slice(0, 8).map(([id, state]) => (
                  <span key={id}>{id}: {state.running ? 'ON' : 'OFF'} / {state.powered ? 'alim' : 'off'}</span>
                ))}
              </div>
            )}

            {!showMeubleMenu && <p className="meuble-hint">Astuce: cliquez sur le meuble pour ouvrir le menu.</p>}
            {showMeubleMenu && <p className="meuble-hint is-active">Menu meuble actif. Choisissez la vue technique.</p>}
          </article>

          <MissionGuidePanel installation={definition} runtime={runtime} />
          {showAdvanced && <ProcessPanel runtime={runtime} />}
        </section>
      )}

      {safeZoneId === 'schema-frigo' && (
        <section className="zone-content-grid">
          <article className="schema-card">
            <header>
              <h3>Schema frigorifique reel</h3>
              <p>Groupe loge complet et cliquable</p>
            </header>
            <RefrigerationDiagram installation={definition} runtime={runtime} />
          </article>
          <MissionGuidePanel installation={definition} runtime={runtime} />
          {showAdvanced && <ProcessPanel runtime={runtime} />}
          {showAdvanced && <RefrigerationSchematic installation={definition} runtime={runtime} />}
          {showAdvanced && <PropertiesPanel runtime={runtime} />}
        </section>
      )}

      {safeZoneId === 'schema-elec' && (
        <section className="zone-content-grid">
          <article className="schema-card">
            <header>
              <h3>Schema electrique reel</h3>
              <p>Prise de tension point a point avec procedure guidee</p>
            </header>
            <ElectricalDiagram runtime={runtime} />
          </article>
          <MissionGuidePanel installation={definition} runtime={runtime} />
          {showAdvanced && <ProcessPanel runtime={runtime} />}
          {showAdvanced && <ElectricalSchematic installation={definition} runtime={runtime} />}
          {showAdvanced && <AlarmPanel runtime={runtime} />}
        </section>
      )}

      {safeZoneId === 'regulateur' && (
        <section className="zone-content-grid">
          <RegulatorPanel installation={definition} runtime={runtime} />
          <MissionGuidePanel installation={definition} runtime={runtime} />
          {showAdvanced && <ProcessPanel runtime={runtime} />}
          {showAdvanced && <AlarmPanel runtime={runtime} />}
          <article className="zone-scene-card">
            <img src={bg} alt={definition.model} />
          </article>
        </section>
      )}
    </main>
  )
}
