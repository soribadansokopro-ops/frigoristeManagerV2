export type InstallationKind =
  | 'DISPLAY_CASE_POSITIVE'
  | 'DISPLAY_CASE_NEGATIVE'
  | 'COLD_ROOM_POSITIVE'
  | 'COLD_ROOM_NEGATIVE'
  | 'RACK_POSITIVE'
  | 'RACK_NEGATIVE'

export type ComponentKind =
  | 'compressor'
  | 'condenser'
  | 'evaporator'
  | 'expansionValve'
  | 'solenoidValve'
  | 'filterDrier'
  | 'receiver'
  | 'fan'
  | 'regulator'
  | 'contactor'
  | 'sensor'
  | 'fuse'
  | 'relay'
  | 'door'

export type ToolType =
  | 'MANIFOLD'
  | 'THERMOMETER'
  | 'MULTIMETER'
  | 'CLAMP_METER'
  | 'LEAK_DETECTOR'

export interface BaseThermoProfile {
  hp: number
  bp: number
  boxTemp: number
  superheat: number
  subcool: number
  compressorCurrent: number
}

export interface ComponentDefinition {
  id: string
  name: string
  kind: ComponentKind
  defaultState: {
    powered: boolean
    running: boolean
    open: boolean
    health: number
    leaking: boolean
  }
}

export interface FaultDefinition {
  id: string
  name: string
  description: string
  severity: 'warning' | 'critical'
  effects: {
    pressureShift: { hp: number; bp: number }
    temperatureShift: number
    currentMultiplier: number
    forceStopComponentIds: string[]
    powerCutComponentIds: string[]
    leakComponentIds: string[]
    alarms: string[]
  }
  repairAction: string
}

export interface InstallationDefinition {
  id: string
  level: number
  name: string
  model: string
  kind: InstallationKind
  missionTitle: string
  missionDescription: string
  base: BaseThermoProfile
  components: ComponentDefinition[]
  faults: FaultDefinition[]
}

export interface RuntimeComponentState {
  powered: boolean
  running: boolean
  open: boolean
  health: number
  leaking: boolean
}

export type ElectricalNodeRole =
  | 'source'
  | 'protection'
  | 'control'
  | 'switch'
  | 'load'
  | 'return'

export interface ElectricalEdge {
  from: string
  to: string
}

export interface ElectricalNodeRuntime {
  id: string
  label: string
  role: ElectricalNodeRole
  linkedComponentId: string | null
  energized: boolean
  voltage: number
  blockedBy: string | null
}

export interface ElectricalSnapshot {
  nodes: Record<string, ElectricalNodeRuntime>
  edges: ElectricalEdge[]
  activeEdges: string[]
  loadCurrentByComponent: Record<string, number>
  testPointVoltage: Record<string, number>
  selectedProbeA: string | null
  selectedProbeB: string | null
  measuredVoltage: number | null
  railPowered: boolean
}

export interface RegulatorRuntime {
  setpoint: number
  fanForcedOff: boolean
  defrostActive: boolean
}

export interface LiveThermoValues {
  hp: number
  bp: number
  boxTemp: number
  tCond: number
  tEvap: number
  superheat: number
  subcool: number
  compressorCurrent: number
  flowRatio: number
  electricalPower: boolean
}

export interface ToolReading {
  tool: ToolType
  title: string
  lines: string[]
  measuredAt: string
}

export interface InstallationRuntime {
  installationId: string
  timeSeconds: number
  components: Record<string, RuntimeComponentState>
  activeFaultIds: string[]
  alarms: string[]
  regulator: RegulatorRuntime
  thermo: LiveThermoValues
  electrical: ElectricalSnapshot
  lastReading: ToolReading | null
}