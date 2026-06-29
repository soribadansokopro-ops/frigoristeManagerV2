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
import type {
  FaultDefinition,
  InstallationDefinition,
  InstallationRuntime,
  ToolReading,
  ToolType,
} from '../types/game'

const smooth = (current: number, target: number, speed: number, dt: number) => {
  const alpha = 1 - Math.exp(-speed * dt)
  return current + (target - current) * alpha
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
  const blueprint = buildFreshLinePOS900()
  const refrigeration = new RefrigerationEngine(
    blueprint.components,
    {
      hp: definition.base.hp,
      bp: definition.base.bp,
      fluidTemperature: definition.base.boxTemp + 8,
      massFlow: 0.75,
      superheat: definition.base.superheat,
      subcool: definition.base.subcool,
    },
    definition.base.boxTemp,
  )

  const electrical = new ElectricalEngine(definition)
  registerEngineSuite(definition.id, refrigeration, electrical)
}

export const createRuntime = (definition: InstallationDefinition): InstallationRuntime => {
  createEngines(definition)

  const components = Object.fromEntries(
    definition.components.map((component) => [component.id, { ...component.defaultState }]),
  )

  return {
    installationId: definition.id,
    timeSeconds: 0,
    components,
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
      superheat: definition.base.superheat,
      subcool: definition.base.subcool,
      compressorCurrent: definition.base.compressorCurrent,
      flowRatio: 0.82,
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

  next.thermo.hp = smooth(next.thermo.hp, targetHp, 0.9, dtSeconds)
  next.thermo.bp = smooth(next.thermo.bp, targetBp, 0.9, dtSeconds)
  next.thermo.boxTemp = smooth(next.thermo.boxTemp, targetBox, 0.8, dtSeconds)
  next.thermo.tCond = smooth(next.thermo.tCond, next.thermo.hp * 2.2 + 7, 1.1, dtSeconds)
  next.thermo.tEvap = smooth(next.thermo.tEvap, next.thermo.bp * 7.1 - 31, 1.1, dtSeconds)
  next.thermo.superheat = smooth(next.thermo.superheat, thermo.loopState.superheat, 1.1, dtSeconds)
  next.thermo.subcool = smooth(next.thermo.subcool, thermo.loopState.subcool, 1.1, dtSeconds)
  next.thermo.flowRatio = smooth(next.thermo.flowRatio, thermo.loopState.massFlow, 0.9, dtSeconds)
  next.thermo.compressorCurrent = smooth(
    next.thermo.compressorCurrent,
    compressorCurrent * (1 + faultAggregate.currentMultiplier),
    1.3,
    dtSeconds,
  )
  next.thermo.electricalPower = electrical.railPowered

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
