import type {
  ComponentState,
  RefrigerantState,
  RefrigerationComponent,
  SystemContext,
} from './ComponentTypes'

export class Fan implements RefrigerationComponent {
  public readonly type = 'fan' as const

  public readonly id: string

  public readonly name: string

  public state: ComponentState = {
    running: true,
    powered: true,
    health: 100,
    open: false,
  }

  public rpm = 980

  public constructor(id: string, name: string) {
    this.id = id
    this.name = name
  }

  public update(input: RefrigerantState, context: SystemContext): RefrigerantState {
    const shouldRun = this.state.running && this.state.powered && context.electricalRailPowered
    this.rpm = shouldRun ? 980 : 0

    return {
      ...input,
      fluidTemperature: shouldRun
        ? input.fluidTemperature - 0.08 * context.dt
        : input.fluidTemperature + 0.1 * context.dt,
    }
  }
}
