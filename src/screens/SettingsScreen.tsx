import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { readUiPreferences, writeUiPreferences } from '../utils/uiPreferences'

export function SettingsScreen() {
  const [focusMode, setFocusMode] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const current = readUiPreferences()
    setFocusMode(current.focusMode)
    setReducedMotion(current.reducedMotion)
  }, [])

  const apply = (nextFocusMode: boolean, nextReducedMotion: boolean) => {
    writeUiPreferences({
      focusMode: nextFocusMode,
      reducedMotion: nextReducedMotion,
    })
    setFocusMode(nextFocusMode)
    setReducedMotion(nextReducedMotion)
  }

  return (
    <main className="info-page-shell">
      <section className="info-page-panel">
        <header className="info-page-header">
          <h1>Parametres interface</h1>
          <p>Personnalise le rendu pour une lecture plus confortable.</p>
        </header>

        <div className="info-page-actions">
          <Link to="/">Retour accueil</Link>
          <Link to="/missions">Aller aux missions</Link>
        </div>

        <section className="settings-grid">
          <article className="settings-card">
            <h2>Mode lecture simple</h2>
            <p>Reduit les effets decoratifs et augmente la lisibilite des contenus.</p>
            <button
              type="button"
              onClick={() => apply(!focusMode, reducedMotion)}
            >
              {focusMode ? 'Desactiver' : 'Activer'}
            </button>
          </article>

          <article className="settings-card">
            <h2>Animations reduites</h2>
            <p>Diminue les animations pour un affichage plus stable.</p>
            <button
              type="button"
              onClick={() => apply(focusMode, !reducedMotion)}
            >
              {reducedMotion ? 'Desactiver' : 'Activer'}
            </button>
          </article>
        </section>
      </section>
    </main>
  )
}
