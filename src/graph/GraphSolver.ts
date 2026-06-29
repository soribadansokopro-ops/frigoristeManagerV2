import type { Connection } from './Connection'
import type { ConnectionGraph } from './ConnectionGraph'

export interface GraphSolveResult<TFlow> {
  flow: TFlow
  traversal: string[]
}

/**
 * Walks a directed graph and propagates a flow state through component update methods.
 * Nodes are independent and never access neighbors directly.
 */
export class GraphSolver<TFlow, TContext> {
  private readonly graph: ConnectionGraph<TFlow, TContext>

  public constructor(graph: ConnectionGraph<TFlow, TContext>) {
    this.graph = graph
  }

  public solve(initialFlow: TFlow, context: TContext, seedNodeId?: string): GraphSolveResult<TFlow> {
    const traversal = this.buildTraversal(seedNodeId)

    let current = initialFlow
    for (const nodeId of traversal) {
      const node = this.graph.getNode(nodeId)
      if (!node) {
        continue
      }

      current = node.update(current, context)
    }

    return {
      flow: current,
      traversal,
    }
  }

  private buildTraversal(seedNodeId?: string) {
    const nodeIds = this.graph.getNodeIds()
    if (nodeIds.length === 0) {
      return []
    }

    const roots = this.graph.getRootNodeIds().sort()
    const start = seedNodeId && nodeIds.includes(seedNodeId)
      ? seedNodeId
      : roots[0] ?? nodeIds.slice().sort()[0]

    const visited = new Set<string>()
    const order: string[] = []
    const queue = [start]

    while (queue.length > 0) {
      const nodeId = queue.shift()
      if (!nodeId || visited.has(nodeId)) {
        continue
      }

      visited.add(nodeId)
      order.push(nodeId)

      const outgoing = this.graph
        .getOutgoing(nodeId)
        .slice()
        .sort((a: Connection, b: Connection) => a.toNodeId.localeCompare(b.toNodeId))

      for (const edge of outgoing) {
        if (!visited.has(edge.toNodeId)) {
          queue.push(edge.toNodeId)
        }
      }
    }

    const remaining = nodeIds
      .filter((id) => !visited.has(id))
      .sort((a, b) => a.localeCompare(b))

    return [...order, ...remaining]
  }
}
