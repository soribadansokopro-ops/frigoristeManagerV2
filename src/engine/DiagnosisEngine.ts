import type { InstallationDefinition, InstallationRuntime } from '../types/game'

export class DiagnosisEngine {
  public summarize(definition: InstallationDefinition, runtime: InstallationRuntime): string[] {
    const notes: string[] = []

    if (runtime.thermo.hp < definition.base.hp - 2) {
      notes.push('HP inferieure a la reference nominale')
    }
    if (runtime.thermo.bp > definition.base.bp + 0.8) {
      notes.push('BP anormalement haute par rapport au nominal')
    }
    if (runtime.thermo.boxTemp > definition.base.boxTemp + 2.5) {
      notes.push('Derive de temperature enceinte')
    }
    if (!runtime.thermo.electricalPower) {
      notes.push('Absence d alimentation sur le rail de commande')
    }

    return notes.length > 0 ? notes : ['Aucun symptome critique detecte']
  }
}
