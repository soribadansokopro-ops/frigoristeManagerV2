import { Compressor } from '../models/Compressor'
import { Condenser } from '../models/Condenser'
import { Evaporator } from '../models/Evaporator'
import { ExpansionValve } from '../models/ExpansionValve'
import { FilterDrier } from '../models/FilterDrier'
import { Fan } from '../models/Fan'
import { SightGlass } from '../models/SightGlass'
import { TemperatureProbe } from '../models/TemperatureProbe'
import type { RefrigerationComponent, RefrigerantState } from '../models/ComponentTypes'

export interface SystemBlueprint {
  components: RefrigerationComponent[]
  initialLoop: RefrigerantState
}

export const buildFreshLinePOS900 = (): SystemBlueprint => {
  const compressor = new Compressor('cp1', 'Compresseur')
  const condenser = new Condenser('cd1', 'Condenseur')
  const filter = new FilterDrier('fd1', 'Filtre deshydrateur')
  const sightGlass = new SightGlass('sg1', 'Voyant liquide')
  const expansionValve = new ExpansionValve('dt1', 'Detendeur')
  const evaporator = new Evaporator('ev1', 'Evaporateur')
  const fan = new Fan('fv1', 'Ventilateur evaporateur')
  const probe = new TemperatureProbe('tp1', 'Sonde retour air')

  return {
    components: [
      compressor,
      condenser,
      filter,
      sightGlass,
      expansionValve,
      evaporator,
      fan,
      probe,
    ],
    initialLoop: {
      hp: 12.3,
      bp: 2.2,
      fluidTemperature: 18,
      massFlow: 0.74,
      superheat: 6,
      subcool: 4.2,
    },
  }
}
