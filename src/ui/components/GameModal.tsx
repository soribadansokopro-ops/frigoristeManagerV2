import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './GameModal.module.css'
import { DsWindow } from '../../design-system'

interface GameModalProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function GameModal({ title, subtitle, onClose, children, footer }: GameModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return createPortal(
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <DsWindow title={title} subtitle={subtitle} onClose={onClose} footer={footer}>
          <div className={styles.body}>{children}</div>
        </DsWindow>
      </div>
    </div>,
    document.body,
  )
}
