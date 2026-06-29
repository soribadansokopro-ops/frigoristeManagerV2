import type {
  ComponentState,
  RefrigerantState,
  RefrigerationComponent,
  SystemContext,
} from './ComponentTypes'

/** Compressor component model for simplified but coherent thermodynamic behavior. */
export class Compressor implements RefrigerationComponent {
  public readonly type = 'compressor' as const

  public readonly id: string

  public readonly name: string

  public state: ComponentState = {
    running: true,
    powered: true,
    health: 100,
    open: false,
  }

  public temperature = 62
  public ampere = 0
  public thermalProtection = false
  public lockedRotor = false
  public oilTemperature = 45

  public constructor(id: string, name: string) {
    this.id = id
    this.name = name
  }

  public update(input: RefrigerantState, context: SystemContext): RefrigerantState {
    const isRunning =
      this.state.running &&
      this.state.powered &&
      context.electricalRailPowered &&
      !this.thermalProtection &&
      !this.lockedRotor

    this.ampere = isRunning ? (context.electricalCurrentByComponentId[this.id] ?? 0) : 0
    this.temperature += (isRunning ? 0.3 : -0.25) * context.dt
    this.oilTemperature += (isRunning ? 0.15 : -0.1) * context.dt

    if (this.temperature > 118) {
      this.thermalProtection = true
    }
    if (this.temperature < 88) {
      this.thermalProtection = false
    }

    if (!isRunning) {
      return {
        ...input,
        hp: input.hp - 0.12 * context.dt,
        bp: input.bp + 0.08 * context.dt,
        massFlow: input.massFlow * 0.92,
      }
    }

    return {
      ...input,
      hp: input.hp + 0.42 * context.dt,
      bp: Math.max(0.4, input.bp - 0.14 * context.dt),
      fluidTemperature: input.fluidTemperature + 0.5 * context.dt,
      massFlow: Math.min(1.2, input.massFlow + 0.07 * context.dt),
    }
  }
}
