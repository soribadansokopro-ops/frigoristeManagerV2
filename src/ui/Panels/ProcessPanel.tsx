import { useMemo, useState } from 'react'
import type { InstallationRuntime } from '../../types/game'

type ProcessTab = 'THERMO' | 'AIR' | 'COND' | 'SYSTEM'

interface ProcessPanelProps {
  runtime: InstallationRuntime
}

const tabLabel: Record<ProcessTab, string> = {
  THERMO: 'Thermo',
  AIR: 'Debit air',
  COND: 'Condenseur',
  SYSTEM: 'Etat global',
}

const statusFrom = (value: number, warnThreshold: number, alertThreshold: number, inverse = false) => {
  if (!inverse) {
    if (value >= alertThreshold) return 'Alerte'
    if (value >= warnThreshold) return 'Surveiller'
    return 'OK'
  }

  if (value <= alertThreshold) return 'Alerte'
  if (value <= warnThreshold) return 'Surveiller'
  return 'OK'
}

export function ProcessPanel({ runtime }: ProcessPanelProps) {
  const [activeTab, setActiveTab] = useState<ProcessTab>('THERMO')
  const tSuction = runtime.thermo.tSuction ?? runtime.thermo.tEvap + runtime.thermo.superheat
  const tDischarge = runtime.thermo.tDischarge ?? runtime.thermo.tCond + 30
  const airFlowM3h = runtime.thermo.airFlowM3h ?? runtime.thermo.flowRatio * 3000
  const condenserApproach = runtime.thermo.condenserApproach ?? 10
  const condenserDeltaT = runtime.thermo.condenserDeltaT ?? 12
  const evapDeltaT = runtime.thermo.evapDeltaT ?? 7

  const condenserState = useMemo(
    () => statusFrom(condenserApproach, 12, 17),
    [condenserApproach],
  )

  const airflowState = useMemo(
    () => statusFrom(airFlowM3h, 1900, 1400, true),
    [airFlowM3h],
  )

  return (
    <article className="schema-card process-panel">
      <header>
        <h3>Menu process</h3>
        <p>Mesures terrain pour aspiration, refoulement, air et condenseur.</p>
      </header>

      <nav className="process-tabs" aria-label="Sections process">
        {(Object.keys(tabLabel) as ProcessTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'active' : ''}
          >
            {tabLabel[tab]}
          </button>
        ))}
      </nav>

      {activeTab === 'THERMO' && (
        <div className="process-grid">
          <span>T aspiration: {tSuction.toFixed(1)} C</span>
          <span>T refoulement: {tDischarge.toFixed(1)} C</span>
          <span>T evap sat: {runtime.thermo.tEvap.toFixed(1)} C</span>
          <span>T cond sat: {runtime.thermo.tCond.toFixed(1)} C</span>
          <span>Surchauffe: {runtime.thermo.superheat.toFixed(1)} K</span>
          <span>Sous-refroid.: {runtime.thermo.subcool.toFixed(1)} K</span>
        </div>
      )}

      {activeTab === 'AIR' && (
        <div className="process-grid">
          <span>Debit air: {airFlowM3h.toFixed(0)} m3/h</span>
          <span>Delta evap air: {evapDeltaT.toFixed(1)} K</span>
          <span>Etat ventil.: {airflowState}</span>
          <span>Ratio debit frigo: {(runtime.thermo.flowRatio * 100).toFixed(0)}%</span>
        </div>
      )}

      {activeTab === 'COND' && (
        <div className="process-grid">
          <span>Approche condenseur: {condenserApproach.toFixed(1)} K</span>
          <span>Delta condenseur: {condenserDeltaT.toFixed(1)} K</span>
          <span>Courant compresseur: {runtime.thermo.compressorCurrent.toFixed(1)} A</span>
          <span>Etat condenseur: {condenserState}</span>
        </div>
      )}

      {activeTab === 'SYSTEM' && (
        <div className="process-grid">
          <span>Alim electrique: {runtime.thermo.electricalPower ? 'Presente' : 'Coupee'}</span>
          <span>Temp enceinte: {runtime.thermo.boxTemp.toFixed(1)} C</span>
          <span>HP/BP: {runtime.thermo.hp.toFixed(1)} / {runtime.thermo.bp.toFixed(1)} bar</span>
          <span>Alarmes: {runtime.alarms.length}</span>
        </div>
      )}
    </article>
  )
}
