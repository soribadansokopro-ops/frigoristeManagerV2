import type {
  ComponentState,
  RefrigerantState,
  RefrigerationComponent,
  SystemContext,
} from './ComponentTypes'

export class SightGlass implements RefrigerationComponent {
  public readonly type = 'sightGlass' as const

  public readonly id: string

  public readonly name: string

  public state: ComponentState = {
    running: true,
    powered: true,
    health: 100,
    open: false,
  }

  public hasBubbles = false

  public constructor(id: string, name: string) {
    this.id = id
    this.name = name
  }

  public update(input: RefrigerantState, context: SystemContext): RefrigerantState {
    void context
    this.hasBubbles = input.subcool < 2.2 || input.massFlow < 0.22
    return input
  }
}
