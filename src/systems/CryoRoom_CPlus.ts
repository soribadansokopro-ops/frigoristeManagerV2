import { buildFreshLinePOS900, type SystemBlueprint } from './FreshLine_POS900'

export const buildCryoRoomCPlus = (): SystemBlueprint => {
  const blueprint = buildFreshLinePOS900()
  return {
    ...blueprint,
    initialLoop: {
      ...blueprint.initialLoop,
      hp: 13.8,
      bp: 2.6,
      fluidTemperature: 7,
      massFlow: 0.86,
      superheat: 5.8,
      subcool: 5.2,
    },
  }
}
