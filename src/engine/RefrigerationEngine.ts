import type {
  SystemContext,
  RefrigerantState,
} from '../models/ComponentTypes'
import type { ConnectionGraph } from '../graph/ConnectionGraph'
import { GraphSolver } from '../graph/GraphSolver'
import type { RuntimeComponentState } from '../types/game'

export interface RefrigerationTickResult {
  loopState: RefrigerantState
  roomTemperature: number
}

/**
 * Refrigeration loop solver using ordered component propagation.
 * It keeps a simplified coherent model suited for troubleshooting gameplay.
 */
export class RefrigerationEngine {
  private readonly graph: ConnectionGraph<RefrigerantState, SystemContext>

  private readonly solver: GraphSolver<RefrigerantState, SystemContext>

  private readonly seedNodeId: string | undefined

  private lastTraversal: string[] = []

  private loopState: RefrigerantState

  private roomTemperature: number

  public constructor(
    graph: ConnectionGraph<RefrigerantState, SystemContext>,
    loopState: RefrigerantState,
    initialRoomTemperature: number,
    seedNodeId?: string,
  ) {
    this.graph = graph
    this.solver = new GraphSolver(graph)
    this.seedNodeId = seedNodeId
    this.loopState = loopState
    this.roomTemperature = initialRoomTemperature
  }

  public getState() {
    return {
      loopState: this.loopState,
      roomTemperature: this.roomTemperature,
      traversal: this.lastTraversal,
    }
  }

  public getGraph() {
    return this.graph
  }

  public syncComponentStates(states: Record<string, RuntimeComponentState>) {
    for (const node of this.graph.getNodes()) {
      const nextState = states[node.id]
      if (!nextState) {
        continue
      }

      node.state.powered = nextState.powered
      node.state.running = nextState.running
      node.state.leaking = nextState.leaking
      node.state.open = nextState.open
      node.state.health = nextState.health
    }
  }

  public tick(context: SystemContext): RefrigerationTickResult {
    const solved = this.solver.solve(this.loopState, context, this.seedNodeId)
    const stream = solved.flow
    this.lastTraversal = solved.traversal

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
