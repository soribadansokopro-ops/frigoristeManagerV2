import type { GraphConnectionRuntime, GraphNodeRuntime } from '../../types/game'

export interface RenderNode {
  id: string
  label: string
  componentId: string
  type: string
  x: number
  y: number
  width: number
  height: number
}

const refrigerationTypes = new Set([
  'compressor',
  'condenser',
  'receiver',
  'filterDrier',
  'solenoidValve',
  'expansionValve',
  'evaporator',
  'fan',
  'sensor',
])

export const classifyRefrigerationEdge = (fromType: string) => {
  if (fromType === 'compressor' || fromType === 'condenser' || fromType === 'receiver' || fromType === 'filterDrier') {
    return 'pipe-HP'
  }
  if (fromType === 'expansionValve' || fromType === 'evaporator') {
    return 'pipe-BP'
  }
  return 'pipe-MIXED'
}

export const getOrderedRefrigerationNodes = (
  graphNodes: GraphNodeRuntime[],
  traversal: string[],
) => {
  const filtered = graphNodes.filter((node) => refrigerationTypes.has(node.type))
  if (filtered.length === 0) {
    return [] as GraphNodeRuntime[]
  }

  const byId = new Map(filtered.map((node) => [node.id, node]))
  const ordered = traversal
    .map((nodeId) => byId.get(nodeId))
    .filter((node): node is GraphNodeRuntime => Boolean(node))

  if (ordered.length > 0) {
    return ordered
  }

  return filtered
}

export const buildLoopRenderNodes = (
  nodes: GraphNodeRuntime[],
  viewWidth: number,
  viewHeight: number,
): RenderNode[] => {
  const centerX = viewWidth / 2
  const centerY = viewHeight / 2
  const radiusX = Math.max(160, viewWidth * 0.36)
  const radiusY = Math.max(70, viewHeight * 0.28)

  return nodes.map((node, index) => {
    const ratio = index / Math.max(1, nodes.length)
    const angle = ratio * Math.PI * 2 - Math.PI / 2
    const width = node.type === 'evaporator' ? 184 : 138
    const height = node.type === 'evaporator' ? 66 : 54

    return {
      id: node.id,
      label: node.label,
      componentId: node.componentId,
      type: node.type,
      x: centerX + Math.cos(angle) * radiusX - width / 2,
      y: centerY + Math.sin(angle) * radiusY - height / 2,
      width,
      height,
    }
  })
}

export const buildCompactRenderNodes = (nodes: GraphNodeRuntime[]): RenderNode[] => {
  return nodes.map((node, index) => {
    const width = node.type === 'evaporator' ? 132 : 104
    const x = 24 + index * 110
    const y = node.type === 'evaporator' ? 168 : index % 2 === 0 ? 42 : 96

    return {
      id: node.id,
      label: node.label,
      componentId: node.componentId,
      type: node.type,
      x,
      y,
      width,
      height: 52,
    }
  })
}

export const buildRenderLinks = (
  renderNodes: RenderNode[],
  connections: GraphConnectionRuntime[],
) => {
  const byId = new Map(renderNodes.map((node) => [node.id, node]))

  return connections
    .filter((edge) => byId.has(edge.fromNodeId) && byId.has(edge.toNodeId))
    .map((edge) => {
      const from = byId.get(edge.fromNodeId)
      const to = byId.get(edge.toNodeId)
      if (!from || !to) {
        return null
      }

      return {
        id: edge.id,
        x1: from.x + from.width / 2,
        y1: from.y + from.height / 2,
        x2: to.x + to.width / 2,
        y2: to.y + to.height / 2,
        className: classifyRefrigerationEdge(from.type),
      }
    })
    .filter((edge): edge is NonNullable<typeof edge> => Boolean(edge))
}
