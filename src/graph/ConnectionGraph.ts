import type { ComponentNode } from './ComponentNode'
import type { Connection } from './Connection'

/**
 * Immutable-friendly directed graph for simulation nodes.
 */
export class ConnectionGraph<TFlow, TContext> {
  private readonly nodesById = new Map<string, ComponentNode<TFlow, TContext>>()

  private readonly outgoingByNodeId = new Map<string, Connection[]>()

  private readonly incomingCountByNodeId = new Map<string, number>()

  public addNode(node: ComponentNode<TFlow, TContext>) {
    this.nodesById.set(node.id, node)
    if (!this.outgoingByNodeId.has(node.id)) {
      this.outgoingByNodeId.set(node.id, [])
    }
    if (!this.incomingCountByNodeId.has(node.id)) {
      this.incomingCountByNodeId.set(node.id, 0)
    }
  }

  public addConnection(connection: Connection) {
    if (!this.nodesById.has(connection.fromNodeId) || !this.nodesById.has(connection.toNodeId)) {
      return
    }

    const outgoing = this.outgoingByNodeId.get(connection.fromNodeId) ?? []
    outgoing.push(connection)
    this.outgoingByNodeId.set(connection.fromNodeId, outgoing)

    const incoming = this.incomingCountByNodeId.get(connection.toNodeId) ?? 0
    this.incomingCountByNodeId.set(connection.toNodeId, incoming + 1)
  }

  public getNode(nodeId: string) {
    return this.nodesById.get(nodeId)
  }

  public getNodeIds() {
    return [...this.nodesById.keys()]
  }

  public getNodes() {
    return [...this.nodesById.values()]
  }

  public getOutgoing(nodeId: string) {
    return [...(this.outgoingByNodeId.get(nodeId) ?? [])]
  }

  public getConnections() {
    return [...this.outgoingByNodeId.values()].flat()
  }

  public getRootNodeIds() {
    return this.getNodeIds().filter((id) => (this.incomingCountByNodeId.get(id) ?? 0) === 0)
  }
}
