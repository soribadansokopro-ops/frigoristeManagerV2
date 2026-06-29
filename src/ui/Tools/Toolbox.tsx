import type { ToolType } from '../../types/game'
import { toolIconByType } from '../../config/toolAssets'

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
        <button
          key={tool}
          type="button"
          onClick={() => onSelect(tool)}
          className={selectedTool === tool ? 'selected' : ''}
        >
          <img src={toolIconByType[tool]} alt="" aria-hidden="true" />
          {tool}
        </button>
      ))}
    </div>
  )
}
