export type ComponentType =
  | 'compressor'
  | 'condenser'
  | 'evaporator'
  | 'expansionValve'
  | 'filterDrier'
  | 'sightGlass'
  | 'fan'
  | 'temperatureProbe'

export interface RefrigerantState {
  hp: number
  bp: number
  fluidTemperature: number
  massFlow: number
  superheat: number
  subcool: number
}

export interface SystemContext {
  dt: number
  ambientTemperature: number
  roomLoad: number
  electricalRailPowered: boolean
  electricalCurrentByComponentId: Record<string, number>
}

export interface ComponentState {
  running: boolean
  powered: boolean
  health: number
  open: boolean
}

export interface RefrigerationComponent {
  readonly id: string
  readonly type: ComponentType
  readonly name: string
  state: ComponentState
  update(input: RefrigerantState, context: SystemContext): RefrigerantState
}
