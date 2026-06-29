import { ElectricalEngine } from './ElectricalEngine'
import { RefrigerationEngine } from './RefrigerationEngine'
import {
  evaluateAlarms,
  evaluateDiagnosis,
  getEngineSuite,
  readTool,
  registerEngineSuite,
} from './SimulationOrchestrator'
import { buildFreshLinePOS900 } from '../systems/FreshLine_POS900'
import { buildFreshLineNEG900 } from '../systems/FreshLine_NEG900'
import { buildCryoRoomCPlus } from '../systems/CryoRoom_CPlus'
import { buildPolarRackPositive } from '../systems/PolarRack_Positive'
import { ConnectionGraph } from '../graph/ConnectionGraph'
import type { ComponentNode } from '../graph/ComponentNode'
import { createDefaultPorts } from '../graph/ComponentNode'
import { createConnectionId } from '../graph/Connection'
import { Compressor } from '../models/Compressor'
import { Condenser } from '../models/Condenser'
import { Evaporator } from '../models/Evaporator'
import { ExpansionValve } from '../models/ExpansionValve'
import { FilterDrier } from '../models/FilterDrier'
import { Fan } from '../models/Fan'
import { SightGlass } from '../models/SightGlass'
import { TemperatureProbe } from '../models/TemperatureProbe'
import type { RefrigerationComponent, RefrigerantState, SystemContext } from '../models/ComponentTypes'
import type {
  ComponentKind,
  FaultDefinition,
  InstallationDefinition,
  InstallationRuntime,
  RuntimeComponentState,
  ToolReading,
  ToolType,
} from '../types/game'

const smooth = (current: number, target: number, speed: number, dt: number) => {
  const alpha = 1 - Math.exp(-speed * dt)
  return current + (target - current) * alpha
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const refrigerationOrder: ComponentKind[] = [
  'compressor',
  'condenser',
  'receiver',
  'filterDrier',
  'solenoidValve',
  'expansionValve',
  'evaporator',
  'fan',
  'sensor',
]

const refrigerationKinds = new Set<ComponentKind>(refrigerationOrder)

const selectBlueprint = (definition: InstallationDefinition) => {
  if (definition.id === 'freshline-pos-900') {
    return buildFreshLinePOS900()
  }
  if (definition.id === 'freshline-neg-900') {
    return buildFreshLineNEG900()
  }
  if (definition.id === 'cryoroom-c-plus') {
    return buildCryoRoomCPlus()
  }
  if (definition.id === 'polarrack-positive') {
    return buildPolarRackPositive()
  }

  switch (definition.kind) {
    case 'DISPLAY_CASE_NEGATIVE':
    case 'COLD_ROOM_NEGATIVE':
      return buildFreshLineNEG900()
    case 'COLD_ROOM_POSITIVE':
      return buildCryoRoomCPlus()
    case 'RACK_POSITIVE':
      return buildPolarRackPositive()
    default:
      return buildFreshLinePOS900()
  }
}

const createModelByKind = (kind: ComponentKind, id: string, name: string): RefrigerationComponent | null => {
  if (kind === 'compressor') return new Compressor(id, name)
  if (kind === 'condenser') return new Condenser(id, name)
  if (kind === 'evaporator') return new Evaporator(id, name)
  if (kind === 'expansionValve') return new ExpansionValve(id, name)
  if (kind === 'filterDrier') return new FilterDrier(id, name)
  if (kind === 'fan') return new Fan(id, name)
  if (kind === 'sensor') return new TemperatureProbe(id, name)
  if (kind === 'receiver' || kind === 'solenoidValve') return new SightGlass(id, name)
  return null
}

/**
 * Wraps a refrigeration model component as a graph node.
 */
const createGraphNode = (
  componentId: string,
  kind: ComponentKind,
  component: RefrigerationComponent,
  runtimeState: RuntimeComponentState,
): ComponentNode<RefrigerantState, SystemContext> => {
  const { inputPorts, outputPorts } = createDefaultPorts()

  return {
    id: componentId,
    type: kind,
    inputPorts,
    outputPorts,
    state: {
      powered: runtimeState.powered,
      running: runtimeState.running,
      leaking: runtimeState.leaking,
      open: runtimeState.open,
      health: runtimeState.health,
    },
    physicalProperties: {
      nominalFlow: 1,
      thermalInertia: 1,
    },
    update: (input, context) => {
      component.state = {
        ...component.state,
        powered: runtimeState.powered,
        running: runtimeState.running,
        open: runtimeState.open,
        health: runtimeState.health,
      }

      const next = component.update(input, context)
      const leakPenalty = runtimeState.leaking ? 0.9 : 1
      return {
        ...next,
        massFlow: next.massFlow * leakPenalty,
      }
    },
  }
}

const createOrderedRefrigerationIds = (definition: InstallationDefinition) => {
  const byKind = new Map<ComponentKind, string>()
  for (const component of definition.components) {
    if (!refrigerationKinds.has(component.kind)) {
      continue
    }
    if (!byKind.has(component.kind)) {
      byKind.set(component.kind, component.id)
    }
  }

  const ordered = refrigerationOrder
    .map((kind) => byKind.get(kind))
    .filter((id): id is string => Boolean(id))

  const leftovers = definition.components
    .filter((component) => refrigerationKinds.has(component.kind) && !ordered.includes(component.id))
    .map((component) => component.id)

  return [...ordered, ...leftovers]
}

/**
 * Builds a component connection graph from installation components.
 */
const createRefrigerationGraph = (
  definition: InstallationDefinition,
  componentStates: Record<string, RuntimeComponentState>,
) => {
  const graph = new ConnectionGraph<RefrigerantState, SystemContext>()
  const orderedIds = createOrderedRefrigerationIds(definition)

  for (const componentId of orderedIds) {
    const componentDef = definition.components.find((item) => item.id === componentId)
    if (!componentDef) {
      continue
    }

    const model = createModelByKind(componentDef.kind, componentDef.id, componentDef.name)
    const runtimeState = componentStates[componentDef.id] ?? componentDef.defaultState
    if (!model) {
      continue
    }

    graph.addNode(createGraphNode(componentDef.id, componentDef.kind, model, runtimeState))
  }

  for (let index = 0; index < orderedIds.length - 1; index += 1) {
    const fromNodeId = orderedIds[index]
    const toNodeId = orderedIds[index + 1]
    graph.addConnection({
      id: createConnectionId(fromNodeId, 'out', toNodeId, 'in'),
      fromNodeId,
      fromPortId: 'out',
      toNodeId,
      toPortId: 'in',
    })
  }

  if (orderedIds.length > 2) {
    const firstNodeId = orderedIds[0]
    const lastNodeId = orderedIds[orderedIds.length - 1]
    graph.addConnection({
      id: createConnectionId(lastNodeId, 'out', firstNodeId, 'in'),
      fromNodeId: lastNodeId,
      fromPortId: 'out',
      toNodeId: firstNodeId,
      toPortId: 'in',
    })
  }

  return {
    graph,
    seedNodeId: orderedIds[0],
  }
}

const createGraphSnapshot = (
  definition: InstallationDefinition,
  runtime: InstallationRuntime,
  traversal: string[],
) => {
  const nodes = definition.components
    .filter((component) => refrigerationKinds.has(component.kind))
    .map((component) => ({
      id: component.id,
      componentId: component.id,
      type: component.kind,
      label: component.name,
      inputPorts: [{ id: 'in', kind: 'in' as const, signal: 0 }],
      outputPorts: [{ id: 'out', kind: 'out' as const, signal: 0 }],
      state: runtime.components[component.id] ?? component.defaultState,
      physicalProperties: {
        hp: runtime.thermo.hp,
        bp: runtime.thermo.bp,
        flowRatio: runtime.thermo.flowRatio,
      },
    }))

  const byId = new Set(nodes.map((node) => node.id))
  const connections = [] as InstallationRuntime['graph']['connections']
  for (let index = 0; index < traversal.length - 1; index += 1) {
    const fromNodeId = traversal[index]
    const toNodeId = traversal[index + 1]
    if (!byId.has(fromNodeId) || !byId.has(toNodeId)) {
      continue
    }

    connections.push({
      id: createConnectionId(fromNodeId, 'out', toNodeId, 'in'),
      fromNodeId,
      fromPortId: 'out',
      toNodeId,
      toPortId: 'in',
    })
  }

  if (traversal.length > 2) {
    const firstNodeId = traversal[0]
    const lastNodeId = traversal[traversal.length - 1]
    if (byId.has(firstNodeId) && byId.has(lastNodeId)) {
      connections.push({
        id: createConnectionId(lastNodeId, 'out', firstNodeId, 'in'),
        fromNodeId: lastNodeId,
        fromPortId: 'out',
        toNodeId: firstNodeId,
        toPortId: 'in',
      })
    }
  }

  return {
    nodes,
    connections,
    traversal: traversal.filter((nodeId) => byId.has(nodeId)),
  }
}

const aggregateFaults = (faults: FaultDefinition[]) => {
  const result = {
    hpShift: 0,
    bpShift: 0,
    tempShift: 0,
    currentMultiplier: 0,
    forceStops: new Set<string>(),
    powerCuts: new Set<string>(),
    leaks: new Set<string>(),
    alarms: new Set<string>(),
  }

  for (const fault of faults) {
    result.hpShift += fault.effects.pressureShift.hp
    result.bpShift += fault.effects.pressureShift.bp
    result.tempShift += fault.effects.temperatureShift
    result.currentMultiplier += fault.effects.currentMultiplier
    fault.effects.forceStopComponentIds.forEach((id) => result.forceStops.add(id))
    fault.effects.powerCutComponentIds.forEach((id) => result.powerCuts.add(id))
    fault.effects.leakComponentIds.forEach((id) => result.leaks.add(id))
    fault.effects.alarms.forEach((alarm) => result.alarms.add(alarm))
  }

  return result
}

const createEngines = (definition: InstallationDefinition) => {
  const blueprint = selectBlueprint(definition)
  const componentStates = Object.fromEntries(
    definition.components.map((component) => [component.id, { ...component.defaultState }]),
  )
  const { graph, seedNodeId } = createRefrigerationGraph(definition, componentStates)

  const refrigeration = new RefrigerationEngine(
    graph,
    {
      hp: definition.base.hp,
      bp: definition.base.bp,
      fluidTemperature: blueprint.initialLoop.fluidTemperature,
      massFlow: blueprint.initialLoop.massFlow,
      superheat: definition.base.superheat,
      subcool: definition.base.subcool,
    },
    definition.base.boxTemp,
    seedNodeId,
  )

  const electrical = new ElectricalEngine(definition)
  registerEngineSuite(definition.id, refrigeration, electrical)
}

export const createRuntime = (definition: InstallationDefinition): InstallationRuntime => {
  createEngines(definition)

  const components = Object.fromEntries(
    definition.components.map((component) => [component.id, { ...component.defaultState }]),
  )

  const baseRuntime: InstallationRuntime = {
    installationId: definition.id,
    timeSeconds: 0,
    components,
    graph: {
      nodes: [],
      connections: [],
      traversal: [],
    },
    activeFaultIds: [],
    alarms: [],
    regulator: {
      setpoint: definition.base.boxTemp,
      fanForcedOff: false,
      defrostActive: false,
    },
    thermo: {
      hp: definition.base.hp,
      bp: definition.base.bp,
      boxTemp: definition.base.boxTemp,
      tCond: definition.base.hp * 2.2 + 7,
      tEvap: definition.base.bp * 7.1 - 31,
      tSuction: definition.base.bp * 7.1 - 31 + definition.base.superheat,
      tDischarge: definition.base.hp * 2.2 + 28,
      superheat: definition.base.superheat,
      subcool: definition.base.subcool,
      compressorCurrent: definition.base.compressorCurrent,
      flowRatio: 0.82,
      airFlowM3h: 2450,
      condenserApproach: 10,
      condenserDeltaT: 13,
      evapDeltaT: 7,
      electricalPower: true,
    },
    electrical: {
      nodes: {},
      edges: [],
      activeEdges: [],
      loadCurrentByComponent: {},
      testPointVoltage: {},
      selectedProbeA: null,
      selectedProbeB: null,
      measuredVoltage: null,
      railPowered: true,
    },
    lastReading: null,
  }

  baseRuntime.graph = createGraphSnapshot(definition, baseRuntime, createOrderedRefrigerationIds(definition))
  return baseRuntime
}

export const simulateTick = (
  definition: InstallationDefinition,
  runtime: InstallationRuntime,
  dtSeconds: number,
): InstallationRuntime => {
  const suite = getEngineSuite(definition.id)
  if (!suite) {
    return runtime
  }

  const next: InstallationRuntime = {
    ...runtime,
    timeSeconds: runtime.timeSeconds + dtSeconds,
    components: { ...runtime.components },
    alarms: [...runtime.alarms],
    regulator: { ...runtime.regulator },
    thermo: { ...runtime.thermo },
    electrical: { ...runtime.electrical },
  }

  const activeFaults = definition.faults.filter((fault) => next.activeFaultIds.includes(fault.id))
  const faultAggregate = aggregateFaults(activeFaults)

  for (const id of faultAggregate.forceStops) {
    if (next.components[id]) {
      next.components[id] = { ...next.components[id], running: false }
    }
  }
  for (const id of faultAggregate.powerCuts) {
    if (next.components[id]) {
      next.components[id] = { ...next.components[id], powered: false }
    }
  }
  for (const id of faultAggregate.leaks) {
    if (next.components[id]) {
      next.components[id] = { ...next.components[id], leaking: true }
    }
  }

  if (next.regulator.fanForcedOff) {
    const fanComponent = definition.components.find((component) => component.kind === 'fan')
    if (fanComponent && next.components[fanComponent.id]) {
      next.components[fanComponent.id] = {
        ...next.components[fanComponent.id],
        running: false,
      }
    }
  }

  if (next.regulator.defrostActive) {
    const evaporator = definition.components.find((component) => component.kind === 'evaporator')
    if (evaporator && next.components[evaporator.id]) {
      next.components[evaporator.id] = {
        ...next.components[evaporator.id],
        running: false,
      }
    }

    const compressor = definition.components.find((component) => component.kind === 'compressor')
    if (compressor && next.components[compressor.id]) {
      next.components[compressor.id] = {
        ...next.components[compressor.id],
        running: false,
      }
    }
  }

  const electrical = suite.electrical.tick(next, faultAggregate.powerCuts)
  next.electrical = electrical

  for (const node of Object.values(electrical.nodes)) {
    if (!node.linkedComponentId || !next.components[node.linkedComponentId]) {
      continue
    }

    const state = next.components[node.linkedComponentId]
    next.components[node.linkedComponentId] = {
      ...state,
      powered: node.energized,
      running: node.role === 'load' && !node.energized ? false : state.running,
    }
  }

  suite.refrigeration.syncComponentStates(next.components)

  const thermo = suite.refrigeration.tick({
    dt: dtSeconds,
    ambientTemperature: 30,
    roomLoad: 0.55,
    electricalRailPowered: electrical.railPowered,
    electricalCurrentByComponentId: electrical.loadCurrentByComponent,
  })

  const compressor = definition.components.find((component) => component.kind === 'compressor')
  const compressorCurrent = compressor ? electrical.loadCurrentByComponent[compressor.id] ?? 0 : 0

  const targetHp = thermo.loopState.hp + faultAggregate.hpShift
  const targetBp = thermo.loopState.bp + faultAggregate.bpShift
  const defrostOffset = next.regulator.defrostActive ? 1.4 : 0
  const targetBox = thermo.roomTemperature + faultAggregate.tempShift + defrostOffset

  const loadCurrent = compressorCurrent * (1 + faultAggregate.currentMultiplier)
  const healthyFlow = clamp(thermo.loopState.massFlow, 0.08, 1.15)
  const airflowTarget = clamp(850 + healthyFlow * 2100 - faultAggregate.tempShift * 35, 600, 3600)
  const condenserDeltaTarget = clamp(8 + Math.max(0, targetHp - definition.base.hp) * 1.5, 6, 28)
  const approachTarget = clamp(5 + Math.max(0, targetHp - definition.base.hp) * 1.25, 3, 22)
  const evapDeltaTarget = clamp(4 + Math.max(0, definition.base.bp - targetBp) * 2.4, 2, 20)

  const targetCondSatTemp = targetHp * 2.2 + 7
  const targetEvapSatTemp = targetBp * 7.1 - 31
  const targetSuperheat = clamp(thermo.loopState.superheat, 2.5, 22)
  const targetSubcool = clamp(thermo.loopState.subcool, 1.5, 18)
  const targetSuction = targetEvapSatTemp + targetSuperheat
  const dischargeLift = clamp(34 + (targetCondSatTemp - targetEvapSatTemp) * 0.22, 26, 68)
  const targetDischarge = targetCondSatTemp + dischargeLift

  next.thermo.hp = smooth(next.thermo.hp, targetHp, 0.9, dtSeconds)
  next.thermo.bp = smooth(next.thermo.bp, targetBp, 0.9, dtSeconds)
  next.thermo.boxTemp = smooth(next.thermo.boxTemp, targetBox, 0.8, dtSeconds)
  next.thermo.tCond = smooth(next.thermo.tCond, targetCondSatTemp, 1.1, dtSeconds)
  next.thermo.tEvap = smooth(next.thermo.tEvap, targetEvapSatTemp, 1.1, dtSeconds)
  next.thermo.superheat = smooth(next.thermo.superheat, targetSuperheat, 1.1, dtSeconds)
  next.thermo.subcool = smooth(next.thermo.subcool, targetSubcool, 1.1, dtSeconds)
  next.thermo.tSuction = smooth(next.thermo.tSuction, targetSuction, 1.25, dtSeconds)
  next.thermo.tDischarge = smooth(next.thermo.tDischarge, targetDischarge, 1.3, dtSeconds)
  next.thermo.flowRatio = smooth(next.thermo.flowRatio, healthyFlow, 0.9, dtSeconds)
  next.thermo.airFlowM3h = smooth(next.thermo.airFlowM3h, airflowTarget, 0.8, dtSeconds)
  next.thermo.condenserDeltaT = smooth(next.thermo.condenserDeltaT, condenserDeltaTarget, 0.9, dtSeconds)
  next.thermo.condenserApproach = smooth(next.thermo.condenserApproach, approachTarget, 0.95, dtSeconds)
  next.thermo.evapDeltaT = smooth(next.thermo.evapDeltaT, evapDeltaTarget, 0.95, dtSeconds)
  next.thermo.compressorCurrent = smooth(
    next.thermo.compressorCurrent,
    loadCurrent,
    1.3,
    dtSeconds,
  )
  next.thermo.electricalPower = electrical.railPowered

  const refrigerationState = suite.refrigeration.getState()
  next.graph = createGraphSnapshot(definition, next, refrigerationState.traversal)

  const alarms = new Set<string>()
  faultAggregate.alarms.forEach((alarm) => alarms.add(alarm))
  evaluateAlarms(definition, next).forEach((alarm) => alarms.add(alarm))
  evaluateDiagnosis(definition, next).forEach((note) => {
    if (note.includes('critique')) {
      alarms.add(note)
    }
  })

  next.alarms = [...alarms]

  return next
}

export const createToolReading = (
  tool: ToolType,
  definition: InstallationDefinition,
  runtime: InstallationRuntime,
): ToolReading => readTool(tool, definition, runtime)
