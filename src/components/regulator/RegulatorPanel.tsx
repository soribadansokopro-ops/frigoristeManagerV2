import { useState } from 'react'
import { motion } from 'framer-motion'
import type { InstallationDefinition, InstallationRuntime } from '../../types/game'
import type { RegulatorOutputId } from '../../types/regulator'
import { useRegulatorDiagnostics } from '../../hooks/useRegulatorDiagnostics'
import { InformationPanel } from './InformationPanel'
import { ParametersCard } from './ParametersCard'
import { QuickActionsCard } from './QuickActionsCard'
import { RegulatorScreen } from './RegulatorScreen'
import { StatusCard } from './StatusCard'
import { TestOutputs } from './TestOutputs'
import { MultimeterCard } from './MultimeterCard'

interface RegulatorPanelProps {
  installation: InstallationDefinition
  runtime: InstallationRuntime
}

export function RegulatorPanel({ installation, runtime }: RegulatorPanelProps) {
  const [hoveredOutputId, setHoveredOutputId] = useState<RegulatorOutputId | null>(null)
  const diagnostics = useRegulatorDiagnostics({ installation, runtime })

  return (
    <section className="grid gap-4 xl:grid-cols-[20%_1fr_20%]">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}>
        <InformationPanel
          infoItems={diagnostics.infoItems}
          errors={diagnostics.errors}
          legendItems={diagnostics.legendItems}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="grid gap-4">
        <RegulatorScreen
          connections={diagnostics.connections}
          outputs={diagnostics.outputs}
          terminals={diagnostics.terminals}
          selectedTerminalA={diagnostics.selectedTerminalA}
          selectedTerminalB={diagnostics.selectedTerminalB}
          hoveredConnectionId={diagnostics.hoveredConnectionId}
          hoveredOutputId={hoveredOutputId}
          onHoverConnection={diagnostics.setHoveredConnectionId}
          onSelectTerminal={diagnostics.selectTerminal}
        />

        <TestOutputs
          outputs={diagnostics.outputs}
          onTestOutput={diagnostics.testOutput}
          onHoverOutput={setHoveredOutputId}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="grid gap-4">
        <StatusCard
          statusText={diagnostics.statusText}
          statusTone={diagnostics.statusTone}
          currentTemperature={runtime.thermo.boxTemp}
        />
        <ParametersCard parameters={diagnostics.parameters} />
        <QuickActionsCard
          onSetpointAdjust={diagnostics.adjustSetpoint}
          onForceDefrost={diagnostics.forceDefrost}
          onTestOutputs={diagnostics.testAllOutputs}
          onResetAlarms={diagnostics.resetAlarms}
        />
        <MultimeterCard
          terminals={diagnostics.terminals}
          selectedTerminalA={diagnostics.selectedTerminalA}
          selectedTerminalB={diagnostics.selectedTerminalB}
          measuredVoltage={diagnostics.measuredVoltage}
          onSelectTerminal={diagnostics.selectTerminal}
          onClear={diagnostics.clearTerminalSelection}
        />
      </motion.div>
    </section>
  )
}
