import { AlarmEngine } from './AlarmEngine'
import { DiagnosisEngine } from './DiagnosisEngine'
import { ElectricalEngine } from './ElectricalEngine'
import { RefrigerationEngine } from './RefrigerationEngine'
import { ToolEngine } from './ToolEngine'
import type { InstallationDefinition, InstallationRuntime, ToolType } from '../types/game'

interface EngineSuite {
  refrigeration: RefrigerationEngine
  electrical: ElectricalEngine
}

const suites = new Map<string, EngineSuite>()

const alarmEngine = new AlarmEngine()
const diagnosisEngine = new DiagnosisEngine()
const toolEngine = new ToolEngine()

export const registerEngineSuite = (
  installationId: string,
  refrigeration: RefrigerationEngine,
  electrical: ElectricalEngine,
) => {
  suites.set(installationId, { refrigeration, electrical })
}

export const getEngineSuite = (installationId: string) => suites.get(installationId)

export const evaluateAlarms = (definition: InstallationDefinition, runtime: InstallationRuntime) =>
  alarmEngine.evaluate(definition, runtime)

export const evaluateDiagnosis = (definition: InstallationDefinition, runtime: InstallationRuntime) =>
  diagnosisEngine.summarize(definition, runtime)

export const readTool = (
  tool: ToolType,
  definition: InstallationDefinition,
  runtime: InstallationRuntime,
) => toolEngine.read(tool, definition, runtime)
