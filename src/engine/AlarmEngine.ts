import type { InstallationDefinition, InstallationRuntime } from '../types/game'

export class AlarmEngine {
  public evaluate(definition: InstallationDefinition, runtime: InstallationRuntime): string[] {
    const alarms = new Set<string>()

    if (!runtime.thermo.electricalPower) {
      alarms.add('RAIL ELECTRIQUE HORS TENSION')
    }
    if (runtime.thermo.hp < 6.5) {
      alarms.add('PRESSION HP BASSE')
    }
    if (runtime.thermo.boxTemp > definition.base.boxTemp + 4) {
      alarms.add('ALARME HAUTE TEMPERATURE ENCEINTE')
    }
    if (runtime.electrical.activeEdges.length <= 1) {
      alarms.add('CIRCUIT DE COMMANDE OUVERT')
    }

    return [...alarms]
  }
}
