import type {
  ComponentState,
  RefrigerantState,
  RefrigerationComponent,
  SystemContext,
} from './ComponentTypes'

export class Condenser implements RefrigerationComponent {
  public readonly type = 'condenser' as const

  public readonly id: string

  public readonly name: string

  public state: ComponentState = {
    running: true,
    powered: true,
    health: 100,
    open: false,
  }

  public fanRunning = true
  public dirty = false
  public condensingTemperature = 35

  public constructor(id: string, name: string) {
    this.id = id
    this.name = name
  }

  public update(input: RefrigerantState, context: SystemContext): RefrigerantState {
    const efficiency = this.dirty ? 0.45 : 0.8
    const fanFactor = this.fanRunning ? 1 : 0.35
    const thermalExchange = efficiency * fanFactor

    this.condensingTemperature =
      context.ambientTemperature + (input.hp * (1.8 - thermalExchange))

    return {
      ...input,
      hp: input.hp + (1 - thermalExchange) * 0.25 * context.dt,
      fluidTemperature: input.fluidTemperature - thermalExchange * 0.6 * context.dt,
      subcool: Math.min(20, input.subcool + thermalExchange * 0.3 * context.dt),
    }
  }
}
