interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  tone?: 'neutral' | 'ok' | 'warn' | 'fault'
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function DsProgressBar({ value, max = 100, label, tone = 'neutral' }: ProgressBarProps) {
  const ratio = max <= 0 ? 0 : clamp(value / max, 0, 1)
  const percent = Math.round(ratio * 100)

  return (
    <div className={`ds-progress is-${tone}`}>
      {label && (
        <div className="ds-progress-header">
          <small>{label}</small>
          <strong>{percent}%</strong>
        </div>
      )}
      <div className="ds-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
        <span className="ds-progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
