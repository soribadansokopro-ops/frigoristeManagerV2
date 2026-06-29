import type {
  ComponentDefinition,
  ComponentKind,
  ElectricalEdge,
  ElectricalNodeRuntime,
  ElectricalNodeRole,
  ElectricalSnapshot,
  InstallationDefinition,
  InstallationRuntime,
} from '../types/game'

interface ElectricalNodeModel {
  id: string
  label: string
  role: ElectricalNodeRole
  linkedComponentId: string | null
}

const SOURCE_ID = 'source:l'
const RETURN_ID = 'return:n'

const TEST_POINTS = {
  L: 'tp:l',
  FUSE_OUT: 'tp:fuse_out',
  REG_OUT: 'tp:reg_out',
  KM_A1: 'tp:km_a1',
  COMP_L: 'tp:comp_l',
  N: 'tp:n',
} as const

const loadKinds: ComponentKind[] = [
  'compressor',
  'fan',
  'condenser',
  'evaporator',
  'solenoidValve',
  'expansionValve',
]

const chainKindOrder: ComponentKind[] = ['fuse', 'relay', 'regulator', 'contactor']

const componentByKind = (components: ComponentDefinition[], kind: ComponentKind) =>
  components.find((component) => component.kind === kind)

const createNodeFromComponent = (
  component: ComponentDefinition,
  role: ElectricalNodeRole,
): ElectricalNodeModel => ({
  id: `cmp:${component.id}`,
  label: component.name,
  role,
  linkedComponentId: component.id,
})

const buildElectricalGraph = (definition: InstallationDefinition) => {
  const nodes: ElectricalNodeModel[] = [
    {
      id: SOURCE_ID,
      label: 'Alimentation L',
      role: 'source',
      linkedComponentId: null,
    },
    {
      id: RETURN_ID,
      label: 'Retour N',
      role: 'return',
      linkedComponentId: null,
    },
  ]

  const edges: ElectricalEdge[] = []

  const chainNodes: ElectricalNodeModel[] = []
  for (const kind of chainKindOrder) {
    const component = componentByKind(definition.components, kind)
    if (!component) {
      continue
    }

    const role: ElectricalNodeRole =
      kind === 'fuse' ? 'protection' : kind === 'contactor' ? 'switch' : 'control'

    const node = createNodeFromComponent(component, role)
    chainNodes.push(node)
    nodes.push(node)
  }

  const loadNodes = definition.components
    .filter((component) => loadKinds.includes(component.kind))
    .map((component) => createNodeFromComponent(component, 'load'))

  loadNodes.forEach((node) => nodes.push(node))

  const tailId = chainNodes.length > 0 ? chainNodes[chainNodes.length - 1].id : SOURCE_ID

  if (chainNodes.length > 0) {
    edges.push({ from: SOURCE_ID, to: chainNodes[0].id })

    for (let index = 0; index < chainNodes.length - 1; index += 1) {
      edges.push({ from: chainNodes[index].id, to: chainNodes[index + 1].id })
    }
  }

  for (const loadNode of loadNodes) {
    edges.push({ from: tailId, to: loadNode.id })
    edges.push({ from: loadNode.id, to: RETURN_ID })
  }

  return { nodes, edges }
}

const conductanceByRole = (
  role: ElectricalNodeRole,
  linkedComponentId: string | null,
  runtime: InstallationRuntime,
  powerCutIds: Set<string>,
) => {
  if (role === 'source' || role === 'return') {
    return { conductive: true, blockedBy: null as string | null }
  }

  if (!linkedComponentId) {
    return { conductive: true, blockedBy: null as string | null }
  }

  const componentState = runtime.components[linkedComponentId]
  if (!componentState) {
    return { conductive: false, blockedBy: 'composant-introuvable' }
  }

  if (powerCutIds.has(linkedComponentId)) {
    return { conductive: false, blockedBy: 'coupure-defaut' }
  }

  if (!componentState.powered) {
    return { conductive: false, blockedBy: 'hors-tension' }
  }

  if (role === 'protection' && componentState.health <= 20) {
    return { conductive: false, blockedBy: 'protection-ouverte' }
  }

  if (role === 'switch' && (!componentState.running || componentState.open)) {
    return { conductive: false, blockedBy: 'contact-ouvert' }
  }

  if (role === 'control' && !componentState.running) {
    return { conductive: false, blockedBy: 'commande-desactivee' }
  }

  return { conductive: true, blockedBy: null as string | null }
}

const nominalCurrentByKind = (kind: ComponentKind) => {
  if (kind === 'compressor') {
    return 12
  }
  if (kind === 'fan') {
    return 1.4
  }
  if (kind === 'condenser') {
    return 1.8
  }
  if (kind === 'evaporator') {
    return 1.1
  }
  if (kind === 'solenoidValve') {
    return 0.22
  }

  return 0.5
}

export const simulateElectricalNetwork = (
  definition: InstallationDefinition,
  runtime: InstallationRuntime,
  powerCutIds: Set<string>,
): ElectricalSnapshot => {
  const { nodes: nodeModels, edges } = buildElectricalGraph(definition)
  const nodes: Record<string, ElectricalNodeRuntime> = Object.fromEntries(
    nodeModels.map((node) => [
      node.id,
      {
        ...node,
        energized: false,
        voltage: 0,
        blockedBy: null,
      },
    ]),
  )

  nodes[SOURCE_ID].energized = true
  nodes[SOURCE_ID].voltage = 230

  const activeEdges: string[] = []
  const queue = [SOURCE_ID]
  const visited = new Set<string>([SOURCE_ID])

  while (queue.length > 0) {
    const from = queue.shift()
    if (!from) {
      break
    }

    const outgoing = edges.filter((edge) => edge.from === from)
    for (const edge of outgoing) {
      const target = nodes[edge.to]
      const source = nodes[from]
      if (!target || !source.energized) {
        continue
      }

      const { conductive, blockedBy } = conductanceByRole(
        target.role,
        target.linkedComponentId,
        runtime,
        powerCutIds,
      )

      if (!conductive) {
        if (!target.blockedBy) {
          target.blockedBy = blockedBy
        }
        continue
      }

      target.energized = true
      target.voltage = source.voltage
      activeEdges.push(`${edge.from}->${edge.to}`)

      if (!visited.has(edge.to)) {
        visited.add(edge.to)
        queue.push(edge.to)
      }
    }
  }

  const loadCurrentByComponent: Record<string, number> = {}

  for (const node of Object.values(nodes)) {
    if (node.role !== 'load' || !node.linkedComponentId) {
      continue
    }

    const component = definition.components.find((item) => item.id === node.linkedComponentId)
    const state = runtime.components[node.linkedComponentId]

    if (!component || !state) {
      continue
    }

    loadCurrentByComponent[node.linkedComponentId] =
      node.energized && state.running ? nominalCurrentByKind(component.kind) : 0
  }

  const contactorComponent = definition.components.find((component) => component.kind === 'contactor')
  const fuseComponent = definition.components.find((component) => component.kind === 'fuse')
  const regulatorComponent = definition.components.find((component) => component.kind === 'regulator')
  const compressorComponent = definition.components.find((component) => component.kind === 'compressor')

  const voltageAt = (nodeId: string | undefined) => {
    if (!nodeId) {
      return 0
    }
    return nodes[nodeId]?.voltage ?? 0
  }

  const testPointVoltage: Record<string, number> = {
    [TEST_POINTS.L]: voltageAt(SOURCE_ID),
    [TEST_POINTS.FUSE_OUT]: voltageAt(fuseComponent ? `cmp:${fuseComponent.id}` : SOURCE_ID),
    [TEST_POINTS.REG_OUT]: voltageAt(regulatorComponent ? `cmp:${regulatorComponent.id}` : SOURCE_ID),
    [TEST_POINTS.KM_A1]: voltageAt(contactorComponent ? `cmp:${contactorComponent.id}` : SOURCE_ID),
    [TEST_POINTS.COMP_L]: voltageAt(compressorComponent ? `cmp:${compressorComponent.id}` : SOURCE_ID),
    [TEST_POINTS.N]: voltageAt(RETURN_ID),
  }

  const selectedProbeA = runtime.electrical.selectedProbeA
  const selectedProbeB = runtime.electrical.selectedProbeB
  const measuredVoltage =
    selectedProbeA && selectedProbeB
      ? Math.abs((testPointVoltage[selectedProbeA] ?? 0) - (testPointVoltage[selectedProbeB] ?? 0))
      : null

  const railPowered = contactorComponent
    ? Boolean(nodes[`cmp:${contactorComponent.id}`]?.energized)
    : Boolean(nodes[SOURCE_ID]?.energized)

  return {
    nodes,
    edges,
    activeEdges,
    loadCurrentByComponent,
    testPointVoltage,
    selectedProbeA,
    selectedProbeB,
    measuredVoltage,
    railPowered,
  }
}
