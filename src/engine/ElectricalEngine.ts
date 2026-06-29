import { simulateElectricalNetwork } from './electrical'
import type { ElectricalSnapshot, InstallationDefinition, InstallationRuntime } from '../types/game'

export class ElectricalEngine {
  private readonly definition: InstallationDefinition

  public constructor(definition: InstallationDefinition) {
    this.definition = definition
  }

  public tick(runtime: InstallationRuntime, powerCutIds: Set<string>): ElectricalSnapshot {
    return simulateElectricalNetwork(this.definition, runtime, powerCutIds)
  }
}
