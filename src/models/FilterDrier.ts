import type {
  ComponentState,
  RefrigerantState,
  RefrigerationComponent,
  SystemContext,
} from './ComponentTypes'

export class FilterDrier implements RefrigerationComponent {
  public readonly type = 'filterDrier' as const

  public readonly id: string

  public readonly name: string

  public state: ComponentState = {
    running: true,
    powered: true,
    health: 100,
    open: false,
  }

  public clogRate = 0

  public constructor(id: string, name: string) {
    this.id = id
    this.name = name
  }

  public update(input: RefrigerantState, context: SystemContext): RefrigerantState {
    const pressureDrop = (0.08 + this.clogRate * 0.6) * context.dt

    return {
      ...input,
      hp: input.hp - pressureDrop,
      subcool: Math.max(0, input.subcool - 0.03 * this.clogRate * context.dt),
      massFlow: Math.max(0.05, input.massFlow - 0.02 * this.clogRate * context.dt),
    }
  }
}
