import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import type { InstallationDefinition, InstallationRuntime } from '../types/game'
import type {
  LegendItem,
  RegulatorConnection,
  RegulatorErrorCode,
  RegulatorInfoItem,
  RegulatorOutputId,
  RegulatorOutputState,
  RegulatorParameter,
  RegulatorTerminal,
} from '../types/regulator'

interface UseRegulatorDiagnosticsArgs {
  installation: InstallationDefinition
  runtime: InstallationRuntime
}

const legendItems: LegendItem[] = [
  { label: 'Sondes', color: '#3B82F6' },
  { label: 'Alimentation', color: '#EF4444' },
  { label: 'Relais sorties', color: '#F59E0B' },
  { label: 'Communication', color: '#22C55E' },
]

const regulatorConnections: RegulatorConnection[] = [
  { id: 'wire-power', label: 'Alimentation', kind: 'power', color: '#EF4444', from: 'pwr', to: 'supply-node' },
  { id: 'wire-compressor', label: 'Compresseur', kind: 'relay', color: '#F59E0B', from: 'comp', to: 'compressor-node', outputId: 'compressor' },
  { id: 'wire-fan', label: 'Ventilateurs', kind: 'relay', color: '#F59E0B', from: 'fan', to: 'fan-node', outputId: 'fan' },
  { id: 'wire-defrost', label: 'Degivrage', kind: 'relay', color: '#F59E0B', from: 'defrost', to: 'defrost-node', outputId: 'defrost' },
  { id: 'wire-alarm', label: 'Alarme', kind: 'relay', color: '#F59E0B', from: 'alarm', to: 'alarm-node', outputId: 'alarm' },
  { id: 'wire-s1', label: 'Sonde 1', kind: 'sensor', color: '#3B82F6', from: 's1', to: 'sensor1-node' },
  { id: 'wire-s2', label: 'Sonde 2', kind: 'sensor', color: '#3B82F6', from: 's2', to: 'sensor2-node' },
  { id: 'wire-com', label: 'Module com', kind: 'communication', color: '#22C55E', from: 'modbus', to: 'com-node' },
]

const defaultErrors: RegulatorErrorCode[] = [
  { code: 'E1', title: 'Sonde 1 defaut', severity: 'warn' },
  { code: 'E2', title: 'Sonde 2 defaut', severity: 'warn' },
  { code: 'P1', title: 'Pressostat BP', severity: 'fault' },
  { code: 'HAL', title: 'Haute temperature', severity: 'fault' },
  { code: 'dA', title: 'Porte ouverte', severity: 'warn' },
  { code: 'AdA', title: 'Degivrage actif', severity: 'ok' },
]

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function useRegulatorDiagnostics({ installation, runtime }: UseRegulatorDiagnosticsArgs) {
  const toggleComponentRun = useGameStore((state) => state.toggleComponentRun)
  const setRegulatorDefrostActive = useGameStore((state) => state.setRegulatorDefrostActive)
  const setRegulatorSetpoint = useGameStore((state) => state.setRegulatorSetpoint)
  const acknowledgeAlarms = useGameStore((state) => state.acknowledgeAlarms)

  const [hoveredConnectionId, setHoveredConnectionId] = useState<string | null>(null)
  const [pulsingOutputs, setPulsingOutputs] = useState<Record<RegulatorOutputId, boolean>>({
    compressor: false,
    fan: false,
    defrost: false,
    alarm: false,
  })
  const [manualAlarmTest, setManualAlarmTest] = useState(false)
  const [selectedTerminalA, setSelectedTerminalA] = useState<string | null>(null)
  const [selectedTerminalB, setSelectedTerminalB] = useState<string | null>(null)

  useEffect(() => {
    if (runtime.alarms.length > 0) {
      setManualAlarmTest(false)
    }
  }, [runtime.alarms.length])

  const componentIdByKind = useMemo(() => {
    const map = new Map<string, string>()
    installation.components.forEach((component) => {
      if (!map.has(component.kind)) {
        map.set(component.kind, component.id)
      }
    })
    return map
  }, [installation.components])

  const compressorId = componentIdByKind.get('compressor')
  const fanId = componentIdByKind.get('fan')

  const compressorOn = compressorId ? runtime.components[compressorId]?.running ?? false : false
  const fanOn = fanId ? runtime.components[fanId]?.running ?? false : false
  const defrostOn = runtime.regulator.defrostActive
  const alarmOn = runtime.alarms.length > 0 || manualAlarmTest

  const outputs: RegulatorOutputState[] = [
    {
      id: 'compressor',
      label: 'Compresseur',
      description: 'Sortie relais compresseur',
      isOn: compressorOn,
      isPulsing: pulsingOutputs.compressor,
    },
    {
      id: 'fan',
      label: 'Ventilateur',
      description: 'Sortie ventilateurs evaporateur',
      isOn: fanOn,
      isPulsing: pulsingOutputs.fan,
    },
    {
      id: 'defrost',
      label: 'Degivrage',
      description: 'Relais resistance degivrage',
      isOn: defrostOn,
      isPulsing: pulsingOutputs.defrost,
    },
    {
      id: 'alarm',
      label: 'Alarme',
      description: 'Sortie alarme externe',
      isOn: alarmOn,
      isPulsing: pulsingOutputs.alarm,
    },
  ]

  const triggerOutputPulse = (outputId: RegulatorOutputId) => {
    setPulsingOutputs((current) => ({ ...current, [outputId]: true }))
    window.setTimeout(() => {
      setPulsingOutputs((current) => ({ ...current, [outputId]: false }))
    }, 1200)
  }

  const testOutput = (outputId: RegulatorOutputId) => {
    triggerOutputPulse(outputId)

    if (outputId === 'compressor' && compressorId) {
      toggleComponentRun(compressorId)
    }

    if (outputId === 'fan' && fanId) {
      toggleComponentRun(fanId)
    }

    if (outputId === 'defrost') {
      setRegulatorDefrostActive(!runtime.regulator.defrostActive)
    }

    if (outputId === 'alarm') {
      setManualAlarmTest((current) => !current)
    }
  }

  const testAllOutputs = () => {
    testOutput('compressor')
    testOutput('fan')
    testOutput('defrost')
    testOutput('alarm')
  }

  const infoItems: RegulatorInfoItem[] = [
    { label: 'Nom regulateur', value: 'Dixell XR44CH' },
    { label: 'Type', value: 'Regulation positive / negative' },
    { label: 'Alimentation', value: runtime.thermo.electricalPower ? '230V AC - OK' : 'Alimentation absente' },
    { label: 'Sorties', value: 'Compresseur, ventilateurs, degivrage, alarme' },
    { label: 'Sondes', value: 'S1 Retour air, S2 Evaporateur' },
    { label: 'Plage', value: '-50C a +99C' },
    { label: 'Protection', value: 'HP/BP + temporisations' },
  ]

  const statusText = runtime.alarms.length > 0 ? 'Alarme active' : 'Fonctionnement normal'
  const statusTone: 'ok' | 'warn' | 'fault' = runtime.alarms.length > 0
    ? 'fault'
    : runtime.thermo.electricalPower
      ? 'ok'
      : 'warn'

  const errors: RegulatorErrorCode[] = defaultErrors.map((error) => {
    if (error.code === 'AdA') {
      return { ...error, severity: defrostOn ? 'ok' : 'warn' }
    }

    if (error.code === 'HAL' || error.code === 'P1') {
      return {
        ...error,
        severity: runtime.alarms.length > 0 ? 'fault' : 'ok',
      }
    }

    return error
  })

  const differential = clamp(Math.abs(runtime.thermo.boxTemp - runtime.regulator.setpoint) + 1, 0.8, 8)
  const defrostDuration = runtime.regulator.defrostActive ? 12 : 0

  const terminals: RegulatorTerminal[] = [
    { id: 'l', code: 'L', number: 1, label: 'Phase alimentation', voltage: runtime.thermo.electricalPower ? 230 : 0, color: '#EF4444', positionKey: 'pwr-l' },
    { id: 'n', code: 'N', number: 2, label: 'Neutre alimentation', voltage: 0, color: '#EF4444', positionKey: 'pwr-n' },
    { id: 'c', code: 'C', number: 3, label: 'Commun relais', voltage: runtime.thermo.electricalPower ? 230 : 0, color: '#F59E0B', positionKey: 'comp-c' },
    { id: 'o1', code: 'O1', number: 4, label: 'Sortie compresseur', voltage: compressorOn ? 230 : 0, color: '#F59E0B', positionKey: 'comp-o1' },
    { id: 'o2', code: 'O2', number: 5, label: 'Sortie ventilateurs', voltage: fanOn ? 230 : 0, color: '#F59E0B', positionKey: 'fan-o2' },
    { id: 'o3', code: 'O3', number: 6, label: 'Sortie degivrage', voltage: defrostOn ? 230 : 0, color: '#F59E0B', positionKey: 'defrost-o3' },
    { id: 'o4', code: 'O4', number: 7, label: 'Sortie alarme', voltage: alarmOn ? 230 : 0, color: '#F59E0B', positionKey: 'alarm-o4' },
    { id: 's1', code: 'S1', number: 8, label: 'Sonde retour air', voltage: 2.1, color: '#3B82F6', positionKey: 's1-terminal' },
    { id: 's2', code: 'S2', number: 9, label: 'Sonde evaporateur', voltage: 1.7, color: '#3B82F6', positionKey: 's2-terminal' },
    { id: 'a-b', code: 'A/B', number: 10, label: 'Bus communication', voltage: runtime.thermo.electricalPower ? 5 : 0, color: '#22C55E', positionKey: 'com-terminal' },
  ]

  const terminalById = new Map(terminals.map((terminal) => [terminal.id, terminal]))
  const terminalA = selectedTerminalA ? terminalById.get(selectedTerminalA) ?? null : null
  const terminalB = selectedTerminalB ? terminalById.get(selectedTerminalB) ?? null : null
  const measuredVoltage = terminalA && terminalB ? Math.abs(terminalA.voltage - terminalB.voltage) : null

  const selectTerminal = (terminalId: string) => {
    if (!selectedTerminalA || (selectedTerminalA && selectedTerminalB)) {
      setSelectedTerminalA(terminalId)
      setSelectedTerminalB(null)
      return
    }

    if (selectedTerminalA === terminalId) {
      setSelectedTerminalA(null)
      setSelectedTerminalB(null)
      return
    }

    setSelectedTerminalB(terminalId)
  }

  const parameters: RegulatorParameter[] = [
    { id: 'setpoint', label: 'Consigne', value: `${runtime.regulator.setpoint.toFixed(1)} C` },
    { id: 'diff', label: 'Differentiel', value: `${differential.toFixed(1)} K` },
    { id: 'deftype', label: 'Type degivrage', value: 'Electrique' },
    { id: 'defdur', label: 'Duree degivrage', value: `${defrostDuration} min` },
    { id: 'defend', label: 'Fin degivrage', value: `${(runtime.thermo.tEvap + 6).toFixed(1)} C` },
    { id: 'fanmode', label: 'Ventilation', value: runtime.regulator.fanForcedOff ? 'Force OFF' : 'Automatique' },
  ]

  return {
    legendItems,
    infoItems,
    errors,
    outputs,
    parameters,
    terminals,
    selectedTerminalA,
    selectedTerminalB,
    measuredVoltage,
    connections: regulatorConnections,
    hoveredConnectionId,
    setHoveredConnectionId,
    statusText,
    statusTone,
    manualAlarmTest,
    testOutput,
    testAllOutputs,
    adjustSetpoint: (delta: number) => setRegulatorSetpoint(delta),
    forceDefrost: () => setRegulatorDefrostActive(true),
    resetAlarms: () => {
      setManualAlarmTest(false)
      acknowledgeAlarms()
    },
    selectTerminal,
    clearTerminalSelection: () => {
      setSelectedTerminalA(null)
      setSelectedTerminalB(null)
    },
  }
}
