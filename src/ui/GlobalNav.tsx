import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: '[HOME] Missions' },
  { to: '/missions', label: '[INST] Installation' },
  { to: '/level/1/zone/schema-elec', label: '[ELEC] Schema electrique' },
  { to: '/level/1/zone/schema-frigo', label: '[FRIO] Schema frigorifique' },
  { to: '/level/1/zone/regulateur', label: '[REG] Regulateur' },
  { to: '/historique', label: '[DATA] Historique' },
  { to: '/parametres', label: '[CFG] Parametres' },
]

export function GlobalNav() {
  return (
    <header className="global-nav-shell">
      <nav className="global-nav" aria-label="Navigation principale">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `global-nav-link ${isActive ? 'is-active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
