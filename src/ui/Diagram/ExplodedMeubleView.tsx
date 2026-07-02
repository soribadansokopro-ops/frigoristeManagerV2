import { useEffect, useMemo, useState } from 'react'
import { DsBadge, DsButton, DsProgressBar } from '../../design-system'
import styles from './ExplodedMeubleView.module.css'

type ComponentHotspot = {
  id: string
  index: number
  label: string
  shortLabel: string
  description: string
  locationHint: string
  diagnosticHint: string
  priorityLabel: string
  markerX: number
  markerY: number
  calloutX: number
  calloutY: number
  calloutAlign?: 'left' | 'right'
}

const clampAxis = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const hotspotsDesktop: ComponentHotspot[] = [
  { id: 'evaporateur', index: 1, shortLabel: 'Evap.', label: 'Evaporateur', description: 'Batterie froide du meuble. C est ici que le fluide absorbe la chaleur des produits.', locationHint: 'Au centre bas, batterie ailetee argent.', diagnosticHint: 'Controle Delta T air entree/sortie et givrage local.', priorityLabel: 'Priorite: temperature d evaporation et surchauffe.', markerX: 55, markerY: 72, calloutX: 63, calloutY: 66, calloutAlign: 'right' },
  { id: 'ventilo-evap', index: 2, shortLabel: 'Vent. evap', label: 'Ventilateur evaporateur', description: 'Ventilateur de circulation d air du meuble. Il force le passage de l air a travers la batterie froide.', locationHint: 'En haut a droite, groupe a double turbine.', diagnosticHint: 'Verifier debit d air, bruit palier et consommation moteur.', priorityLabel: 'Priorite: debit d air et intensite moteur.', markerX: 68, markerY: 17, calloutX: 78, calloutY: 17, calloutAlign: 'right' },
  { id: 'detendeur', index: 3, shortLabel: 'Detendeur', label: 'Detendeur thermostatique', description: 'Organe de detente qui abaisse pression et temperature avant l evaporateur.', locationHint: 'En bas a droite, petit organe sur la ligne cuivre.', diagnosticHint: 'Mesurer surchauffe et stabilite aspiration.', priorityLabel: 'Priorite: surchauffe et alimentation evaporateur.', markerX: 79, markerY: 92, calloutX: 88, calloutY: 96, calloutAlign: 'right' },
  { id: 'sonde', index: 4, shortLabel: 'Sonde', label: 'Sonde de temperature', description: 'Capteur de temperature de reprise utilise par le regulateur pour corriger la consigne.', locationHint: 'Zone haute gauche, capillaire et bulbe de mesure.', diagnosticHint: 'Comparer valeur regulateur et temperature reelle.', priorityLabel: 'Priorite: ecart sonde vs thermometre de reference.', markerX: 32, markerY: 16, calloutX: 23, calloutY: 12, calloutAlign: 'left' },
  { id: 'tableau', index: 5, shortLabel: 'Tableau', label: 'Tableau electrique', description: 'Tableau de puissance et protections (relais, alimentation, bornier).', locationHint: 'Partie basse droite, coffret ouvert avec composants.', diagnosticHint: 'Verifier tension entree, relais et fusibles.', priorityLabel: 'Priorite: alimentation et protection du circuit.', markerX: 66, markerY: 75, calloutX: 78, calloutY: 70, calloutAlign: 'right' },
  { id: 'regulateur', index: 6, shortLabel: 'Regul.', label: 'Regulateur electronique', description: 'Module de commande qui gere cycles, degivrage et maintien de temperature.', locationHint: 'En haut a droite, boitier noir avec afficheur.', diagnosticHint: 'Lire alarmes, consigne et etat des sorties.', priorityLabel: 'Priorite: consigne, hysteresis et alarmes actives.', markerX: 73, markerY: 13, calloutX: 84, calloutY: 9, calloutAlign: 'right' },
  { id: 'compresseur', index: 7, shortLabel: 'Comp.', label: 'Compresseur', description: 'Compresseur hermetique. Il aspire le gaz BP et le refoule en HP vers le condenseur.', locationHint: 'En bas a gauche, cloche noire principale.', diagnosticHint: 'Controler intensite, temperature carter et pression aspiration.', priorityLabel: 'Priorite: HP/BP, amperage et temperature de refoulement.', markerX: 30, markerY: 67, calloutX: 20, calloutY: 62, calloutAlign: 'left' },
  { id: 'pressostat-hp', index: 8, shortLabel: 'HP', label: 'Pressostat HP', description: 'Securite haute pression: coupe la machine en cas de pression condenseur trop elevee.', locationHint: 'Bas droite, organe de securite sur ligne HP.', diagnosticHint: 'Valider seuil de coupure HP et reset.', priorityLabel: 'Priorite: seuil de coupure haute pression.', markerX: 71, markerY: 88, calloutX: 60, calloutY: 83, calloutAlign: 'left' },
  { id: 'pressostat-bp', index: 9, shortLabel: 'BP', label: 'Pressostat BP', description: 'Securite basse pression: protege le compresseur en cas de manque de fluide ou faible aspiration.', locationHint: 'Bas gauche, proche compresseur sur aspiration.', diagnosticHint: 'Valider seuil BP et comportement en manque de charge.', priorityLabel: 'Priorite: pression aspiration et securite manque de charge.', markerX: 24, markerY: 67, calloutX: 13, calloutY: 72, calloutAlign: 'left' },
  { id: 'condenseur', index: 10, shortLabel: 'Cond.', label: 'Condenseur', description: 'Echangeur de condensation qui rejette la chaleur du circuit vers l ambiance.', locationHint: 'Bas centre gauche, batterie noire avec ventilateur frontal.', diagnosticHint: 'Suivre pression de condensation et temperature de sortie liquide.', priorityLabel: 'Priorite: pression et temperature de condensation.', markerX: 43, markerY: 70, calloutX: 35, calloutY: 64, calloutAlign: 'left' },
  { id: 'ventilo-cond', index: 11, shortLabel: 'Vent. cond', label: 'Ventilateur condenseur', description: 'Ventilateur qui balaie la batterie condenseur pour maintenir une HP correcte.', locationHint: 'Au centre de la batterie condenseur (helice frontale).', diagnosticHint: 'Verifier rotation, debit et encrassement de grille.', priorityLabel: 'Priorite: balayage air condenseur et delta air.', markerX: 43, markerY: 70, calloutX: 33, calloutY: 58, calloutAlign: 'left' },
  { id: 'filtre', index: 12, shortLabel: 'Filtre', label: 'Filtre deshydrateur', description: 'Filtre deshydrateur sur ligne liquide pour retenir humidite et particules.', locationHint: 'En bas a droite, petit cylindre noir vertical.', diagnosticHint: 'Surveiller chute de temperature entree/sortie et colmatage.', priorityLabel: 'Priorite: perte de charge et humidite.', markerX: 68, markerY: 89, calloutX: 80, calloutY: 86, calloutAlign: 'right' },
  { id: 'voyant', index: 13, shortLabel: 'Voyant', label: 'Voyant liquide', description: 'Voyant liquide pour verifier l etat de la ligne liquide et la presence de bulles.', locationHint: 'Bas droite, inserte sur ligne cuivre avant detendeur.', diagnosticHint: 'Observer bulles et humidite en regime stable.', priorityLabel: 'Priorite: etat de la ligne liquide.', markerX: 75, markerY: 93, calloutX: 86, calloutY: 90, calloutAlign: 'right' },
  { id: 'reservoir', index: 14, shortLabel: 'Reserv.', label: 'Reservoir de liquide', description: 'Reservoir liquide qui stocke le refrigerant condense avant alimentation du detendeur.', locationHint: 'Bas gauche, bouteille verticale noire proche groupe.', diagnosticHint: 'Verifier temperature de sortie et reserve liquide.', priorityLabel: 'Priorite: niveau de reserve et sous-refroidissement.', markerX: 18, markerY: 66, calloutX: 10, calloutY: 61, calloutAlign: 'left' },
  { id: 'bac', index: 15, shortLabel: 'Bac', label: 'Bac d evacuation', description: 'Bac de recuperation des condensats evacues depuis le meuble.', locationHint: 'Bas centre, grand bac galvanise rectangulaire.', diagnosticHint: 'Verifier ecoulement, pente et absence de debordement.', priorityLabel: 'Priorite: evacuation condensats et hygiene.', markerX: 45, markerY: 84, calloutX: 35, calloutY: 90, calloutAlign: 'left' },
  { id: 'chassis', index: 16, shortLabel: 'Chassis', label: 'Chassis', description: 'Structure mecanique principale qui supporte habillage, echangeurs et accessoires.', locationHint: 'Corps principal du meuble au centre de la scene.', diagnosticHint: 'Controler alignement, points de fixation et vibrations.', priorityLabel: 'Priorite: tenue mecanique et vibrations.', markerX: 52, markerY: 47, calloutX: 61, calloutY: 41, calloutAlign: 'right' },
]

const hotspotsMobile: ComponentHotspot[] = hotspotsDesktop.map((item, index) => {
  const push = item.calloutAlign === 'left' ? 9 : -9
  const yNudge = index % 2 === 0 ? 1.6 : -1.6
  return {
    ...item,
    calloutX: clampAxis(item.calloutX + push, 10, 90),
    calloutY: clampAxis(item.calloutY + yNudge, 8, 95),
  }
})

interface ExplodedMeubleViewProps {
  model: string
  setpoint: number
  boxTemp: number
  alarmsCount: number
  electricalPower: boolean
  airFlowM3h: number
  condenserApproach: number
  onOpenFrigo: () => void
  onOpenElec: () => void
  onOpenRegulator: () => void
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

type TechnicalReading = { label: string; value: string }

export function ExplodedMeubleView({
  model,
  setpoint,
  boxTemp,
  alarmsCount,
  electricalPower,
  airFlowM3h,
  condenserApproach,
  onOpenFrigo,
  onOpenElec,
  onOpenRegulator,
}: ExplodedMeubleViewProps) {
  const [selectedId, setSelectedId] = useState('')
  const [isCompactView, setIsCompactView] = useState<boolean>(() => window.innerWidth < 1200)

  const hotspots = useMemo(
    () => (isCompactView ? hotspotsMobile : hotspotsDesktop),
    [isCompactView],
  )

  const selectedComponent = useMemo(
    () => hotspots.find((item) => item.id === selectedId),
    [hotspots, selectedId],
  )

  useEffect(() => {
    const onResize = () => {
      setIsCompactView(window.innerWidth < 1200)
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (hotspots.some((item) => item.id === selectedId)) {
      return
    }
    setSelectedId('')
  }, [hotspots, selectedId])

  const thermalStability = clamp(100 - Math.abs(boxTemp - setpoint) * 18, 0, 100)
  const airflowScore = clamp((airFlowM3h / 2200) * 100, 0, 100)
  const condenserScore = clamp(100 - (condenserApproach - 8) * 10, 0, 100)
  const condensingTemp = 30 + condenserApproach
  const evaporationTemp = Math.min(setpoint - 5, boxTemp - 6)
  const hpBar = clamp(13 + (condenserApproach - 10) * 0.7, 8, 28)
  const bpBar = clamp(2.2 - Math.max(0, boxTemp - setpoint) * 0.08, 0.6, 4.2)
  const superheat = clamp(5 + Math.abs(boxTemp - setpoint) * 0.6, 4, 14)
  const subcooling = clamp(6 + (condenserApproach - 8) * 0.45, 3, 16)

  const selectedReadings = useMemo<TechnicalReading[]>(() => {
    if (!selectedComponent) {
      return []
    }

    switch (selectedComponent.id) {
      case 'evaporateur':
        return [
          { label: 'Temperature evaporation', value: `${evaporationTemp.toFixed(1)} C` },
          { label: 'Surchauffe sortie evap', value: `${superheat.toFixed(1)} K` },
          { label: 'Debit air evap', value: `${Math.round(airFlowM3h)} m3/h` },
        ]
      case 'ventilo-evap':
        return [
          { label: 'Debit air meuble', value: `${Math.round(airFlowM3h)} m3/h` },
          { label: 'Stabilite thermique', value: `${thermalStability.toFixed(0)} %` },
          { label: 'Alimentation moteur', value: electricalPower ? 'OK' : 'Defaut' },
        ]
      case 'detendeur':
        return [
          { label: 'Surchauffe reglee', value: `${superheat.toFixed(1)} K` },
          { label: 'Pression BP', value: `${bpBar.toFixed(1)} bar` },
          { label: 'Sous-refroidissement liquide', value: `${subcooling.toFixed(1)} K` },
        ]
      case 'sonde':
        return [
          { label: 'Temperature sonde', value: `${boxTemp.toFixed(1)} C` },
          { label: 'Consigne regulateur', value: `${setpoint.toFixed(1)} C` },
          { label: 'Ecart mesure/consigne', value: `${(boxTemp - setpoint).toFixed(1)} C` },
        ]
      case 'tableau':
        return [
          { label: 'Etat alimentation', value: electricalPower ? 'Presente' : 'Coupee' },
          { label: 'Alarmes actives', value: `${alarmsCount}` },
          { label: 'Demande regulation', value: boxTemp > setpoint ? 'Froid ON' : 'Froid OFF' },
        ]
      case 'regulateur':
        return [
          { label: 'Consigne', value: `${setpoint.toFixed(1)} C` },
          { label: 'Temperature lue', value: `${boxTemp.toFixed(1)} C` },
          { label: 'Ecart regulation', value: `${(boxTemp - setpoint).toFixed(1)} C` },
        ]
      case 'compresseur':
        return [
          { label: 'Pression HP', value: `${hpBar.toFixed(1)} bar` },
          { label: 'Pression BP', value: `${bpBar.toFixed(1)} bar` },
          { label: 'Ecart HP/BP', value: `${(hpBar - bpBar).toFixed(1)} bar` },
        ]
      case 'pressostat-hp':
        return [
          { label: 'Pression condensation', value: `${hpBar.toFixed(1)} bar` },
          { label: 'Seuil securite HP', value: '24.0 bar' },
          { label: 'Etat contact', value: hpBar >= 24 ? 'Ouvert securite' : 'Ferme normal' },
        ]
      case 'pressostat-bp':
        return [
          { label: 'Pression aspiration', value: `${bpBar.toFixed(1)} bar` },
          { label: 'Seuil securite BP', value: '0.8 bar' },
          { label: 'Etat contact', value: bpBar <= 0.8 ? 'Ouvert securite' : 'Ferme normal' },
        ]
      case 'condenseur':
        return [
          { label: 'Pression condensation', value: `${hpBar.toFixed(1)} bar` },
          { label: 'Temperature condensation', value: `${condensingTemp.toFixed(1)} C` },
          { label: 'Approche condenseur', value: `${condenserApproach.toFixed(1)} K` },
        ]
      case 'ventilo-cond':
        return [
          { label: 'Approche condenseur', value: `${condenserApproach.toFixed(1)} K` },
          { label: 'Rendement condenseur', value: `${condenserScore.toFixed(0)} %` },
          { label: 'Alimentation moteur', value: electricalPower ? 'OK' : 'Defaut' },
        ]
      case 'filtre':
        return [
          { label: 'Sous-refroidissement', value: `${subcooling.toFixed(1)} K` },
          { label: 'Delta T filtre', value: `${(subcooling > 12 ? 2.0 : 0.6).toFixed(1)} K` },
          { label: 'Etat humidite', value: subcooling > 12 ? 'A surveiller' : 'Correct' },
        ]
      case 'voyant':
        return [
          { label: 'Etat liquide', value: subcooling >= 5 ? 'Pleine colonne' : 'Bulles visibles' },
          { label: 'Sous-refroidissement', value: `${subcooling.toFixed(1)} K` },
          { label: 'Stabilite circuit', value: `${Math.round((thermalStability + condenserScore) / 2)} %` },
        ]
      case 'reservoir':
        return [
          { label: 'Stock liquide', value: subcooling >= 5 ? 'Suffisant' : 'Limite' },
          { label: 'Temperature liquide', value: `${(condensingTemp - subcooling).toFixed(1)} C` },
          { label: 'Pression ligne liquide', value: `${(hpBar - 0.3).toFixed(1)} bar` },
        ]
      case 'bac':
        return [
          { label: 'Temperature bac', value: `${Math.max(boxTemp - 2, 0).toFixed(1)} C` },
          { label: 'Etat evacuation', value: thermalStability >= 55 ? 'Flux normal' : 'Risque debordement' },
          { label: 'Charge condensats', value: `${Math.round(clamp((100 - thermalStability) * 0.55, 10, 85))} %` },
        ]
      case 'chassis':
        return [
          { label: 'Stabilite mecanique', value: `${Math.round((thermalStability + airflowScore) / 2)} %` },
          { label: 'Niveau vibration', value: electricalPower ? 'Nominal' : 'A controler' },
          { label: 'Etat structure', value: 'Conforme visuel' },
        ]
      default:
        return []
    }
  }, [airFlowM3h, alarmsCount, boxTemp, condenserApproach, condenserScore, electricalPower, hpBar, bpBar, selectedComponent, setpoint, subcooling, superheat, thermalStability, airflowScore, condensingTemp, evaporationTemp])

  return (
    <section className={styles.shell}>
      <aside className={styles.leftPanel}>
        <header className={styles.panelHeader}>
          <h2>VUE ECLATEE</h2>
          <p>{model}</p>
        </header>

        <div className={styles.componentList}>
          {hotspots.map((component) => {
            const isActive = component.id === selectedComponent?.id
            return (
              <button
                key={component.id}
                type="button"
                className={`${styles.componentButton} ${isActive ? styles.isActive : ''}`}
                onClick={() => setSelectedId(component.id)}
              >
                <span className={styles.componentIndex}>{String(component.index).padStart(2, '0')}</span>
                <span className={styles.componentLabel}>{component.label}</span>
              </button>
            )
          })}
        </div>
      </aside>

      <article className={styles.stage}>
        <div className={styles.stageTopBar}>
          <span>Image fixe plein ecran interactive</span>
          <div className={styles.stageTopActions}>
            <DsBadge tone={alarmsCount > 0 ? 'warn' : 'ok'}>{alarmsCount > 0 ? `${alarmsCount} alarme(s)` : 'Aucune alarme'}</DsBadge>
          </div>
        </div>

        <div className={styles.zoneQuickNav}>
          <DsButton variant="secondary" onClick={onOpenFrigo}>Schema frigo</DsButton>
          <DsButton variant="secondary" onClick={onOpenElec}>Schema elec</DsButton>
          <DsButton variant="secondary" onClick={onOpenRegulator}>Regulateur</DsButton>
        </div>

        <div className={styles.viewport}>
          <img className={styles.stageImage} src="/assets/scenes/meuble-zone-v2.png" alt="Meuble vue eclatee interactive" />

          <svg className={styles.connectorLayer} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {hotspots.map((component) => {
              const active = component.id === selectedComponent?.id
              return (
                <line
                  key={`line-${component.id}`}
                  x1={component.markerX}
                  y1={component.markerY}
                  x2={component.calloutX}
                  y2={component.calloutY}
                  className={`${styles.connectorLine} ${active ? styles.isActive : ''}`}
                />
              )
            })}
          </svg>

          {hotspots.map((component) => {
            const isActive = component.id === selectedComponent?.id
            return (
              <button
                key={`marker-${component.id}`}
                type="button"
                aria-label={component.label}
                className={`${styles.markerPoint} ${isActive ? styles.isActive : ''}`}
                style={{ left: `${component.markerX}%`, top: `${component.markerY}%` }}
                onClick={() => setSelectedId(component.id)}
              />
            )
          })}

          {hotspots.map((component) => {
            const isActive = component.id === selectedComponent?.id
            return (
              <button
                key={`callout-${component.id}`}
                type="button"
                aria-label={component.label}
                className={`${styles.markerCallout} ${component.calloutAlign === 'left' ? styles.alignLeft : styles.alignRight} ${isActive ? styles.isActive : ''}`}
                style={{ left: `${component.calloutX}%`, top: `${component.calloutY}%` }}
                onClick={() => setSelectedId(component.id)}
              >
                <span className={styles.calloutIndex}>{String(component.index).padStart(2, '0')}</span>
                <span className={styles.calloutLabel}>{component.shortLabel}</span>
              </button>
            )
          })}

          {selectedComponent && (
            <article className={styles.infoOverlay}>
              <div className={styles.infoOverlayHeader}>
                <h3>{selectedComponent.label}</h3>
                <DsButton variant="ghost" onClick={() => setSelectedId('')}>Fermer</DsButton>
              </div>

              <p>{selectedComponent.description}</p>

              <p><strong>Emplacement:</strong> {selectedComponent.locationHint}</p>
              <p><strong>Controle:</strong> {selectedComponent.diagnosticHint}</p>
              <p><strong>{selectedComponent.priorityLabel}</strong></p>

              <div className={styles.infoOverlayBadges}>
                <DsBadge tone="neutral">Repere {String(selectedComponent.index).padStart(2, '0')}</DsBadge>
                <DsBadge tone={electricalPower ? 'ok' : 'fault'}>{electricalPower ? 'Alimentation OK' : 'Defaut alimentation'}</DsBadge>
              </div>

              <div className={styles.infoOverlayReadings}>
                {selectedReadings.map((reading) => (
                  <div key={reading.label} className={styles.infoReadingRow}>
                    <small>{reading.label}</small>
                    <strong>{reading.value}</strong>
                  </div>
                ))}
              </div>

              <DsProgressBar label="Sante globale boucle" value={Math.round((thermalStability + airflowScore + condenserScore) / 3)} tone={thermalStability >= 70 ? 'ok' : 'warn'} />
            </article>
          )}
        </div>
      </article>
    </section>
  )
}
