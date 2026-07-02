import type { ToolType } from '../../types/game'
import { toolIconByType } from '../../config/toolAssets'
import { DsButton } from '../../design-system'

export function Toolbox({
  selectedTool,
  onSelect,
}: {
  selectedTool: ToolType
  onSelect: (tool: ToolType) => void
}) {
  const tools: ToolType[] = [
    'MANIFOLD',
    'THERMOMETER',
    'MULTIMETER',
    'CLAMP_METER',
    'LEAK_DETECTOR',
  ]

  return (
    <div className="toolbox-inline">
      {tools.map((tool) => (
        <DsButton key={tool} variant={selectedTool === tool ? 'primary' : 'ghost'} onClick={() => onSelect(tool)}>
          <img src={toolIconByType[tool]} alt="" aria-hidden="true" />
          {tool}
        </DsButton>
      ))}
    </div>
  )
}
