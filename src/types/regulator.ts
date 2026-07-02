export type RegulatorConnectionType = 'power' | 'sensor' | 'relay' | 'communication'

export type RegulatorOutputId = 'compressor' | 'fan' | 'defrost' | 'alarm'

export interface RegulatorConnection {
  id: string
  label: string
  kind: RegulatorConnectionType
  color: string
  from: string
  to: string
  outputId?: RegulatorOutputId
}

export interface RegulatorInfoItem {
  label: string
  value: string
}

export interface RegulatorErrorCode {
  code: string
  title: string
  severity: 'ok' | 'warn' | 'fault'
}

export interface RegulatorParameter {
  id: string
  label: string
  value: string
}

export interface RegulatorOutputState {
  id: RegulatorOutputId
  label: string
  description: string
  isOn: boolean
  isPulsing: boolean
}

export interface LegendItem {
  label: string
  color: string
}

export interface RegulatorTerminal {
  id: string
  code: string
  number: number
  label: string
  voltage: number
  color: string
  positionKey: string
}
