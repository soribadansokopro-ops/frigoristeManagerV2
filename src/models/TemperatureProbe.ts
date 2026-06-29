import type {
  ComponentState,
  RefrigerantState,
  RefrigerationComponent,
  SystemContext,
} from './ComponentTypes'

export class TemperatureProbe implements RefrigerationComponent {
  public readonly type = 'temperatureProbe' as const

  public readonly id: string

  public readonly name: string

  public state: ComponentState = {
    running: true,
    powered: true,
    health: 100,
    open: false,
  }

  public measuredTemperature = 0
  public cut = false

  public constructor(id: string, name: string) {
    this.id = id
    this.name = name
  }

  public update(input: RefrigerantState, context: SystemContext): RefrigerantState {
    void context
    this.measuredTemperature = this.cut ? 999 : input.fluidTemperature
    return input
  }
}
