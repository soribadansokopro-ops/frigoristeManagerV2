import type { InstallationDefinition, InstallationRuntime } from '../types/game'

interface RefrigerationSchematicProps {
  installation: InstallationDefinition
  runtime: InstallationRuntime
}

export function RefrigerationSchematic({ installation, runtime }: RefrigerationSchematicProps) {
  const hpColor = runtime.thermo.hp > installation.base.hp ? '#ff643d' : '#ff8855'
  const bpColor = runtime.thermo.bp < installation.base.bp ? '#35b7ff' : '#2d8ed8'

  return (
    <article className="schema-card">
      <header>
        <h3>Schema frigorifique vivant</h3>
        <p>HP / BP, temperatures, surchauffe, sous-refroidissement</p>
      </header>

      <svg viewBox="0 0 500 230" role="img" aria-label="Schema frigorifique dynamique">
        <rect x="20" y="30" width="90" height="70" rx="8" className="node" />
        <text x="30" y="62">Compresseur</text>

        <rect x="200" y="22" width="100" height="52" rx="8" className="node" />
        <text x="215" y="52">Condenseur</text>

        <rect x="350" y="35" width="120" height="65" rx="8" className="node" />
        <text x="365" y="68">Detendeur</text>

        <rect x="220" y="150" width="160" height="60" rx="8" className="node" />
        <text x="240" y="184">Evaporateur</text>

        <path
          d="M110 60 L200 48 L300 48"
          stroke={hpColor}
          strokeWidth="5"
          fill="none"
          className="flow-line high"
        />
        <path
          d="M300 48 L350 62 L350 100 L300 150"
          stroke={hpColor}
          strokeWidth="5"
          fill="none"
          className="flow-line high"
        />
        <path
          d="M220 180 L130 180 L70 100 L70 60"
          stroke={bpColor}
          strokeWidth="5"
          fill="none"
          className="flow-line low"
        />

        <text x="25" y="220" className="metric">HP: {runtime.thermo.hp.toFixed(2)} bar</text>
        <text x="150" y="220" className="metric">BP: {runtime.thermo.bp.toFixed(2)} bar</text>
        <text x="270" y="220" className="metric">Tevap: {runtime.thermo.tEvap.toFixed(1)} C</text>
        <text x="390" y="220" className="metric">Tcond: {runtime.thermo.tCond.toFixed(1)} C</text>
      </svg>

      <div className="schema-values">
        <span>Surchauffe: {runtime.thermo.superheat.toFixed(2)} K</span>
        <span>Sous-refroidissement: {runtime.thermo.subcool.toFixed(2)} K</span>
      </div>
    </article>
  )
}
