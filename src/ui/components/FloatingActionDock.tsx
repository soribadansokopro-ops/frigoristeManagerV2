import { DsButton, DsTooltip } from '../../design-system'

type DockAction = {
  id: string
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  hint?: string
}

interface FloatingActionDockProps {
  title: string
  actions: DockAction[]
}

export function FloatingActionDock({ title, actions }: FloatingActionDockProps) {
  return (
    <aside className="floating-action-dock" aria-label={title}>
      <strong>{title}</strong>
      <div className="floating-action-dock-grid">
        {actions.map((action) => (
          <DsTooltip key={action.id} content={action.hint ?? action.label}>
            <DsButton
              variant={action.variant ?? 'ghost'}
              onClick={action.onClick}
            >
              {action.label}
            </DsButton>
          </DsTooltip>
        ))}
      </div>
    </aside>
  )
}
