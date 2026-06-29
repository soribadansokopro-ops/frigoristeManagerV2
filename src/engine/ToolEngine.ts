import type {
  InstallationDefinition,
  InstallationRuntime,
  ToolReading,
  ToolType,
} from '../types/game'

export class ToolEngine {
  public read(
    tool: ToolType,
    definition: InstallationDefinition,
    runtime: InstallationRuntime,
  ): ToolReading {
    const now = new Date().toLocaleTimeString('fr-FR')

    if (tool === 'MANIFOLD') {
      return {
        tool,
        title: 'Lecture manifold',
        measuredAt: now,
        lines: [
          `HP: ${runtime.thermo.hp.toFixed(2)} bar`,
          `BP: ${runtime.thermo.bp.toFixed(2)} bar`,
        ],
      }
    }

    if (tool === 'THERMOMETER') {
      return {
        tool,
        title: 'Thermometre digital',
        measuredAt: now,
        lines: [
          `T enceinte: ${runtime.thermo.boxTemp.toFixed(2)} C`,
          `T evap: ${runtime.thermo.tEvap.toFixed(2)} C`,
          `Surchauffe: ${runtime.thermo.superheat.toFixed(2)} K`,
          `Sous-refroidissement: ${runtime.thermo.subcool.toFixed(2)} K`,
        ],
      }
    }

    if (tool === 'MULTIMETER') {
      const probeA = runtime.electrical.selectedProbeA ?? 'A non connectee'
      const probeB = runtime.electrical.selectedProbeB ?? 'B non connectee'
      const measured = runtime.electrical.measuredVoltage
      const status =
        measured === null
          ? 'Mesure incomplete'
          : measured > 210
            ? 'Tension nominale presente'
            : measured > 20
              ? 'Tension anormale partielle'
              : 'Absence de tension utile'

      return {
        tool,
        title: 'Multimetre',
        measuredAt: now,
        lines: [
          `Point A: ${probeA}`,
          `Point B: ${probeB}`,
          `U(A-B): ${measured === null ? '--' : `${measured.toFixed(1)} V`}`,
          `Diagnostic: ${status}`,
        ],
      }
    }

    if (tool === 'CLAMP_METER') {
      const compressor = definition.components.find((component) => component.kind === 'compressor')
      const current = compressor ? runtime.electrical.loadCurrentByComponent[compressor.id] ?? 0 : 0

      return {
        tool,
        title: 'Pince amperemetrique',
        measuredAt: now,
        lines: [
          `Intensite compresseur: ${current.toFixed(2)} A`,
          `Charge cible: ${definition.base.compressorCurrent.toFixed(2)} A`,
        ],
      }
    }

    const leaking = Object.entries(runtime.components)
      .filter(([, state]) => state.leaking)
      .map(([id]) => id)

    return {
      tool: 'LEAK_DETECTOR',
      title: 'Detecteur de fuite',
      measuredAt: now,
      lines: leaking.length ? leaking.map((id) => `Fuite detectee sur ${id}`) : ['Aucune fuite detectee'],
    }
  }
}
