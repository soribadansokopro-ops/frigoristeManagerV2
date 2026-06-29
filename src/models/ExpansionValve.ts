import type {
  ComponentState,
  RefrigerantState,
  RefrigerationComponent,
  SystemContext,
} from './ComponentTypes'

export class ExpansionValve implements RefrigerationComponent {
  public readonly type = 'expansionValve' as const

  public readonly id: string

  public readonly name: string

  public state: ComponentState = {
    running: true,
    powered: true,
    health: 100,
    open: false,
  }

  public opening = 0.52
  public blocked = false
  public superheatTarget = 6.5

  public constructor(id: string, name: string) {
    this.id = id
    this.name = name
  }

  public update(input: RefrigerantState, context: SystemContext): RefrigerantState {
    const openingFactor = this.blocked ? 0.18 : this.opening
    const expansionDrop = 0.65 * (1 - openingFactor)

    return {
      ...input,
      hp: input.hp - expansionDrop * context.dt,
      bp: input.bp + expansionDrop * 0.4 * context.dt,
      fluidTemperature: input.fluidTemperature - 1.2 * openingFactor * context.dt,
      superheat: Math.max(1.5, input.superheat + (this.superheatTarget - input.superheat) * 0.22),
      massFlow: Math.max(0.1, input.massFlow * (0.75 + openingFactor * 0.4)),
    }
  }
}
