import { useMemo } from 'react'
import type { InstallationDefinition, InstallationRuntime } from '../../types/game'

interface MissionGuidePanelProps {
  installation: InstallationDefinition
  runtime: InstallationRuntime
}

export function MissionGuidePanel({ installation, runtime }: MissionGuidePanelProps) {
  const condenserApproach = runtime.thermo.condenserApproach ?? 10
  const airFlowM3h = runtime.thermo.airFlowM3h ?? runtime.thermo.flowRatio * 3000

  const activeFaults = useMemo(
    () => installation.faults.filter((fault) => runtime.activeFaultIds.includes(fault.id)),
    [installation.faults, runtime.activeFaultIds],
  )

  const hints = useMemo(() => {
    const result: string[] = []

    if (runtime.thermo.boxTemp > runtime.regulator.setpoint + 2) {
      result.push('La temperature caisse derive: verifier d abord la circulation air et la commande froid.')
    }

    if (runtime.thermo.compressorCurrent < 1.2) {
      result.push('Compresseur quasi inactif: un controle electrique rapide peut faire gagner du temps.')
    }

    if (condenserApproach > 14) {
      result.push('Le condenseur semble charge thermiquement: inspecter ventilation et echange thermique.')
    }

    if (airFlowM3h < 1700) {
      result.push('Le debit d air parait bas: jeter un oeil cote evaporateur et ventilateurs.')
    }

    if (activeFaults.some((fault) => fault.effects.powerCutComponentIds.length > 0)) {
      result.push('Des indices orientent vers la chaine de commande electrique.')
    }

    if (activeFaults.some((fault) => fault.effects.leakComponentIds.length > 0)) {
      result.push('Un symptome peut venir d un probleme frigorifique localise sur le circuit.')
    }

    if (result.length === 0) {
      result.push('Commencer par les mesures de base HP/BP puis confirmer avec les temperatures.')
    }

    return result.slice(0, 3)
  }, [activeFaults, airFlowM3h, condenserApproach, runtime])

  return (
    <article className="schema-card mission-guide-card">
      <header>
        <h3>Guide terrain</h3>
        <p>Orientation generale sans reveler la panne exacte.</p>
      </header>
      <ul className="guide-list">
        {hints.map((hint) => (
          <li key={hint}>{hint}</li>
        ))}
      </ul>
    </article>
  )
}
