import { Link } from 'react-router-dom'

const modules = [
  {
    title: 'Sequence de diagnostic',
    points: [
      'Observer symptomes visuels et alarmes.',
      'Mesurer HP/BP puis temperatures cle.',
      'Confirmer par schema electrique et intensites.',
      'Reparer puis valider stabilite.',
    ],
  },
  {
    title: 'Lecture rapide des indicateurs',
    points: [
      'HP haute + courant haut: verifier condenseur.',
      'BP basse + surchauffe haute: verifier alimentation liquide.',
      'Debit air faible: verifier ventilateurs/evaporateur.',
      'Commande instable: suivre la chaine electrique.',
    ],
  },
  {
    title: 'Bonnes pratiques',
    points: [
      'Toujours partir des mesures de base.',
      'Eviter les remplacements sans preuve de mesure.',
      'Valider la temperature enceinte en fin de mission.',
    ],
  },
]

export function TrainingScreen() {
  return (
    <main className="info-page-shell">
      <section className="info-page-panel">
        <header className="info-page-header">
          <h1>Formation</h1>
          <p>Guide court pour progresser plus vite en depannage frigorifique.</p>
        </header>

        <div className="info-page-actions">
          <Link to="/">Retour accueil</Link>
          <Link to="/missions">Ouvrir les missions</Link>
        </div>

        <div className="training-grid">
          {modules.map((module) => (
            <article key={module.title} className="training-card">
              <h2>{module.title}</h2>
              <ul>
                {module.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
