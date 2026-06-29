/**
 * Runtime state of one graph port.
 */
export interface PortState {
  id: string
  kind: 'in' | 'out'
  signal: number
}

/**
 * Generic graph node contract used by the solver.
 */
export interface ComponentNode<TFlow, TContext> {
  id: string
  type: string
  inputPorts: PortState[]
  outputPorts: PortState[]
  state: {
    powered: boolean
    running: boolean
    leaking: boolean
    open: boolean
    health: number
  }
  physicalProperties: Record<string, number>
  update: (input: TFlow, context: TContext) => TFlow
}

/**
 * Creates a default pair of in/out ports for single-stream components.
 */
export const createDefaultPorts = () => ({
  inputPorts: [{ id: 'in', kind: 'in' as const, signal: 0 }],
  outputPorts: [{ id: 'out', kind: 'out' as const, signal: 0 }],
})
