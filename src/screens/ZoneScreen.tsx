import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getLevelBackground } from '../config/visuals'
import { useSimulationTick } from '../hooks/useSimulationTick'
import { ElectricalDiagram } from '../ui/Diagram/Electrical/ElectricalDiagram'
import { RefrigerationDiagram } from '../ui/Diagram/RefrigerationDiagram'
import { AlarmPanel } from '../ui/Panels/AlarmPanel'
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

  const bg = getLevelBackground(definition.kind)

  return (
    <main className="zone-shell">
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
        <section className="zone-content-grid">
          <article className="zone-scene-card">
            <img src="/assets/scenes/meuble-positif-page.png" alt="Meuble positif" />
            <button
              type="button"
              className="zone-outline-hotspot meuble-scene-hotspot"
              onClick={() => navigate(`/level/${level}/zone/schema-frigo`)}
            >
              Ouvrir schema frigo
            </button>
          </article>

          <article className="schema-card">
            <header>
              <h3>Etat equipements meuble</h3>
              <p>Vue detaillee des principaux organes</p>
            </header>
            <div className="diagram-inspector">
              {Object.entries(runtime.components)
                .slice(0, 8)
                .map(([id, state]) => (
                  <span key={id}>{id}: {state.running ? 'ON' : 'OFF'} / {state.powered ? 'alim' : 'off'}</span>
                ))}
            </div>
          </article>
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
          <RefrigerationSchematic installation={definition} runtime={runtime} />
          <PropertiesPanel runtime={runtime} />
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
          <ElectricalSchematic installation={definition} runtime={runtime} />
          <AlarmPanel runtime={runtime} />
        </section>
      )}

      {safeZoneId === 'regulateur' && (
        <section className="zone-content-grid">
          <RegulatorPanel installation={definition} runtime={runtime} />
          <AlarmPanel runtime={runtime} />
          <article className="zone-scene-card">
            <img src={bg} alt={definition.model} />
          </article>
        </section>
      )}
    </main>
  )
}
