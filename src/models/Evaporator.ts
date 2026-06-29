import type {
  ComponentState,
  RefrigerantState,
  RefrigerationComponent,
  SystemContext,
} from './ComponentTypes'

export class Evaporator implements RefrigerationComponent {
  public readonly type = 'evaporator' as const

  public readonly id: string

  public readonly name: string

  public state: ComponentState = {
    running: true,
    powered: true,
    health: 100,
    open: false,
  }

  public fanRunning = true
  public evaporatingTemperature = -6

  public constructor(id: string, name: string) {
    this.id = id
    this.name = name
  }

  public update(input: RefrigerantState, context: SystemContext): RefrigerantState {
    const fanFactor = this.fanRunning && this.state.running ? 1 : 0.45
    const loadFactor = 1 + context.roomLoad * 0.3

    this.evaporatingTemperature = input.fluidTemperature - 5 * fanFactor

    return {
      ...input,
      bp: input.bp - 0.06 * fanFactor * context.dt,
      fluidTemperature: input.fluidTemperature - 0.42 * fanFactor * context.dt,
      superheat: Math.max(2, input.superheat + 0.25 * loadFactor * context.dt),
      massFlow: Math.max(0.08, input.massFlow - 0.04 * (1 - fanFactor) * context.dt),
    }
  }
}
