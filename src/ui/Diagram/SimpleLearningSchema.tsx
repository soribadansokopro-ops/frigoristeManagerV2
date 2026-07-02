import { useMemo, useState } from 'react'
import type { ComponentDefinition, ComponentKind, InstallationDefinition } from '../../types/game'

type SchemaMode = 'schema-frigo' | 'schema-elec'
type InfoView = 'fonction' | 'controle' | 'symptome' | 'reparation'

interface SimpleLearningSchemaProps {
  installation: InstallationDefinition
  mode: SchemaMode
}

const kindOrderByMode: Record<SchemaMode, ComponentKind[]> = {
  'schema-frigo': [
    'compressor',
    'condenser',
    'receiver',
    'filterDrier',
    'solenoidValve',
    'expansionValve',
    'evaporator',
    'fan',
    'sensor',
    'regulator',
  ],
  'schema-elec': [
    'fuse',
    'relay',
    'contactor',
    'regulator',
    'sensor',
    'compressor',
    'fan',
    'door',
  ],
}

const kindInfo: Record<ComponentKind, Record<InfoView, string>> = {
  compressor: {
    fonction: 'Assure la compression du refrigerant pour faire circuler le fluide dans tout le circuit.',
    controle: 'Verifier intensite, continuites enroulements, alimentation et temperature de refoulement.',
    symptome: 'Si defaut: temperature monte, BP anormale, bruit ou coupures thermiques.',
    reparation: 'Controler contacteur/protection, remplacement uniquement apres mesures valides.',
  },
  condenser: {
    fonction: 'Evacue la chaleur du refrigerant vers l air ambiant pour condenser le fluide.',
    controle: 'Verifier proprete batterie, ventilation, delta T air entree/sortie, pression HP.',
    symptome: 'HP elevee, surchauffe de compresseur, mauvaise descente en temperature.',
    reparation: 'Nettoyage, verification ventilateurs, retablissement debit air et echange thermique.',
  },
  evaporator: {
    fonction: 'Capte la chaleur de l enceinte pour produire le froid utile.',
    controle: 'Verifier givrage, debit air, sonde, surchauffe et etat ventilateurs.',
    symptome: 'Enceinte chaude, givre excessif, circulation air insuffisante.',
    reparation: 'Degivrage, controle ventilation et alimentation liquide, reprise des reglages.',
  },
  expansionValve: {
    fonction: 'Detend le refrigerant et regule le debit vers evaporateur.',
    controle: 'Verifier surchauffe, capillaire/sonde bulbe, stabilite BP.',
    symptome: 'Surchauffe trop haute ou trop basse, BP instable, perte de rendement.',
    reparation: 'Recalage reglage ou remplacement apres confirmation des mesures.',
  },
  solenoidValve: {
    fonction: 'Ouvre ou ferme l alimentation liquide selon la commande.',
    controle: 'Verifier bobine, alimentation, ouverture mecanique et chute de pression.',
    symptome: 'Pas de froid par absence de debit liquide, fonctionnement intermittent.',
    reparation: 'Controle electrique complet puis remplacement bobine/corps si confirme.',
  },
  filterDrier: {
    fonction: 'Retient humidite et impuretes du circuit frigorifique.',
    controle: 'Verifier chute de temperature amont/aval et perte de charge.',
    symptome: 'Sous alimentation evaporateur, surchauffe elevee, instabilites.',
    reparation: 'Remplacement filtre et procedure de remise en service conforme.',
  },
  receiver: {
    fonction: 'Stocke le refrigerant liquide pour stabiliser l alimentation du detendeur.',
    controle: 'Verifier niveau, pressions associees et regularite du debit.',
    symptome: 'Alimentation liquide irreguliere, regime instable.',
    reparation: 'Controle ligne liquide et conditions de condensation avant intervention.',
  },
  fan: {
    fonction: 'Assure le debit d air sur evaporateur ou condenseur.',
    controle: 'Verifier rotation, intensite, sens de soufflage et etat pale/moteur.',
    symptome: 'Echange thermique faible, HP/temperature enceinte anormales.',
    reparation: 'Remise en etat mecanique/electrique puis validation debit air.',
  },
  regulator: {
    fonction: 'Pilote la demande de froid selon consigne et mesures capteurs.',
    controle: 'Verifier consigne, hysteresis, sorties de commande et alimentation.',
    symptome: 'Cycles incoherents, derive temperature, arrets intempestifs.',
    reparation: 'Verifier parametrage et chaines de mesure avant remplacement.',
  },
  contactor: {
    fonction: 'Commande la puissance vers les charges (compresseur/ventilation).',
    controle: 'Verifier bobine, contacts puissance et commande, chute de tension.',
    symptome: 'Compresseur ne demarre pas ou s arrete sans cause thermodynamique.',
    reparation: 'Reserrer, controler alimentation bobine, remplacer si contacts defectueux.',
  },
  sensor: {
    fonction: 'Mesure les grandeurs (temperature, pression) pour regulation et diagnostic.',
    controle: 'Comparer mesure reelle, valeur lue regulateur et etat cablage.',
    symptome: 'Consigne non tenue, regulation instable, fausses alarmes.',
    reparation: 'Repositionnement, recalibration ou remplacement apres verification.',
  },
  fuse: {
    fonction: 'Protege les circuits contre surintensites et courts-circuits.',
    controle: 'Verifier continuite et tension amont/aval sous charge.',
    symptome: 'Absence alimentation en aval, equipements inactifs.',
    reparation: 'Identifier cause racine avant remplacement pour eviter recidive.',
  },
  relay: {
    fonction: 'Assure une logique de commande intermediaire dans le circuit electrique.',
    controle: 'Verifier commande bobine, etat contact et temporisations.',
    symptome: 'Commande aleatoire, non maintien, coupures intermittentes.',
    reparation: 'Controle complet de commande puis remplacement si necessaire.',
  },
  door: {
    fonction: 'Partie d enceinte influencant pertes thermiques et stabilite de temperature.',
    controle: 'Verifier fermeture, joints et frequences d ouverture.',
    symptome: 'Remontee temperature, cycles prolonges, givre local.',
    reparation: 'Remise en etat et sensibilisation usage terrain.',
  },
}

const defaultInfoByView: Record<InfoView, string> = {
  fonction: 'Fonction a definir pour ce composant.',
  controle: 'Controle terrain a definir.',
  symptome: 'Symptomes associes a definir.',
  reparation: 'Action de reparation a definir.',
}

const componentImageByKind: Partial<Record<ComponentKind, string>> = {
  compressor: '/assets/components/compressor.svg',
  condenser: '/assets/components/condenser.svg',
  evaporator: '/assets/components/evaporator.svg',
  expansionValve: '/assets/components/expansion-valve.svg',
  solenoidValve: '/assets/components/solenoid-valve.svg',
  filterDrier: '/assets/components/filter-drier.svg',
  receiver: '/assets/components/receiver.svg',
  fan: '/assets/components/fan-motor.svg',
  regulator: '/assets/components/electrical-panel.svg',
  contactor: '/assets/components/electrical-panel.svg',
  sensor: '/assets/components/electrical-panel.svg',
  fuse: '/assets/components/electrical-panel.svg',
  relay: '/assets/components/electrical-panel.svg',
  door: '/assets/components/generic-component.svg',
}

const getFallbackInfo = (view: InfoView) => defaultInfoByView[view]

const filterComponentsForMode = (components: ComponentDefinition[], mode: SchemaMode) => {
  const order = kindOrderByMode[mode]
  const rank = new Map(order.map((kind, index) => [kind, index]))

  return components
    .filter((component) => rank.has(component.kind))
    .sort((a, b) => {
      const rankA = rank.get(a.kind) ?? 999
      const rankB = rank.get(b.kind) ?? 999
      if (rankA !== rankB) return rankA - rankB
      return a.name.localeCompare(b.name)
    })
}

export function SimpleLearningSchema({ installation, mode }: SimpleLearningSchemaProps) {
  const [selectedComponentId, setSelectedComponentId] = useState<string>('')
  const [infoView, setInfoView] = useState<InfoView>('fonction')

  const components = useMemo(
    () => filterComponentsForMode(installation.components, mode),
    [installation.components, mode],
  )

  const selectedComponent = useMemo(() => {
    if (components.length === 0) {
      return null
    }
    return components.find((component) => component.id === selectedComponentId) ?? components[0]
  }, [components, selectedComponentId])

  const selectedInfo = selectedComponent
    ? kindInfo[selectedComponent.kind]?.[infoView] ?? getFallbackInfo(infoView)
    : 'Aucun composant disponible pour ce schema.'

  const selectedImage = selectedComponent
    ? componentImageByKind[selectedComponent.kind] ?? '/assets/components/generic-component.svg'
    : '/assets/components/generic-component.svg'

  const width = 980
  const columns = 4
  const xStart = 32
  const yStart = 60
  const cellW = 230
  const cellH = 108

  return (
    <section className="simple-schema-wrap">
      <svg viewBox={`0 0 ${width} 370`} className="simple-schema-canvas" role="img" aria-label="Schema pedagogique simplifie">
        {components.map((component, index) => {
          const col = index % columns
          const row = Math.floor(index / columns)
          const x = xStart + col * cellW
          const y = yStart + row * cellH
          const isSelected = selectedComponent?.id === component.id

          const previousIndex = index - 1
          const previousCol = previousIndex % columns
          const previousRow = Math.floor(previousIndex / columns)
          const previousX = xStart + previousCol * cellW
          const previousY = yStart + previousRow * cellH

          return (
            <g key={component.id}>
              {index > 0 && (
                <line
                  x1={previousX + 184}
                  y1={previousY + 34}
                  x2={x}
                  y2={y + 34}
                  className="simple-schema-link"
                />
              )}

              <rect
                x={x}
                y={y}
                width={184}
                height={66}
                rx="8"
                className={`simple-schema-node ${isSelected ? 'is-selected' : ''}`}
                onClick={() => setSelectedComponentId(component.id)}
              />
              <text x={x + 12} y={y + 26} className="simple-schema-node-title">
                {component.name}
              </text>
              <text x={x + 12} y={y + 46} className="simple-schema-node-kind">
                {component.kind}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="simple-schema-controls">
        <label htmlFor="info-view-select">Information a verifier</label>
        <select
          id="info-view-select"
          value={infoView}
          onChange={(event) => setInfoView(event.target.value as InfoView)}
        >
          <option value="fonction">Fonction</option>
          <option value="controle">Controle terrain</option>
          <option value="symptome">Symptomes possibles</option>
          <option value="reparation">Action de reparation</option>
        </select>
      </div>

      <article className="simple-schema-info">
        <h4>{selectedComponent ? selectedComponent.name : 'Aucun composant'}</h4>
        <figure className="simple-schema-info-media">
          <img src={selectedImage} alt={selectedComponent ? selectedComponent.name : 'Composant'} loading="lazy" />
        </figure>
        <p>{selectedInfo}</p>
      </article>
    </section>
  )
}
