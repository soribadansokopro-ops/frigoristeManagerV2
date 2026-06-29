import { buildFreshLinePOS900, type SystemBlueprint } from './FreshLine_POS900'

export const buildPolarRackPositive = (): SystemBlueprint => {
  const blueprint = buildFreshLinePOS900()
  return {
    ...blueprint,
    initialLoop: {
      ...blueprint.initialLoop,
      hp: 14.4,
      bp: 2.9,
      fluidTemperature: 23,
      massFlow: 0.98,
      superheat: 6.4,
      subcool: 6.1,
    },
  }
}
