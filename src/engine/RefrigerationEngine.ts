import type {
  RefrigerantState,
  RefrigerationComponent,
  SystemContext,
} from '../models/ComponentTypes'

export interface RefrigerationTickResult {
  loopState: RefrigerantState
  roomTemperature: number
}

/**
 * Refrigeration loop solver using ordered component propagation.
 * It keeps a simplified coherent model suited for troubleshooting gameplay.
 */
export class RefrigerationEngine {
  private readonly components: RefrigerationComponent[]

  private loopState: RefrigerantState

  private roomTemperature: number

  public constructor(
    components: RefrigerationComponent[],
    loopState: RefrigerantState,
    initialRoomTemperature: number,
  ) {
    this.components = components
    this.loopState = loopState
    this.roomTemperature = initialRoomTemperature
  }

  public getState() {
    return {
      loopState: this.loopState,
      roomTemperature: this.roomTemperature,
    }
  }

  public tick(context: SystemContext): RefrigerationTickResult {
    let stream = this.loopState

    for (const component of this.components) {
      stream = component.update(stream, context)
    }

    const coolingEffect = Math.max(0, stream.massFlow) * 0.65
    const loadEffect = context.roomLoad * 0.4
    const drift = (loadEffect - coolingEffect) * context.dt
    this.roomTemperature += drift

    this.loopState = {
      hp: Math.max(4.5, Math.min(28, stream.hp)),
      bp: Math.max(0.3, Math.min(8, stream.bp)),
      fluidTemperature: Math.max(-45, Math.min(90, stream.fluidTemperature)),
      massFlow: Math.max(0.02, Math.min(1.2, stream.massFlow)),
      superheat: Math.max(1, Math.min(30, stream.superheat)),
      subcool: Math.max(0, Math.min(20, stream.subcool)),
    }

    return {
      loopState: this.loopState,
      roomTemperature: this.roomTemperature,
    }
  }
}
