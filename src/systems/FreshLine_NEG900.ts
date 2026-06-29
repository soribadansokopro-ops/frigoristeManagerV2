import { buildFreshLinePOS900, type SystemBlueprint } from './FreshLine_POS900'

export const buildFreshLineNEG900 = (): SystemBlueprint => {
  const blueprint = buildFreshLinePOS900()
  return {
    ...blueprint,
    initialLoop: {
      ...blueprint.initialLoop,
      bp: 1.1,
      fluidTemperature: -14,
      superheat: 8,
    },
  }
}
