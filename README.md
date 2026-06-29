# Frigoriste Manager - MVP v1

Simulateur metier educatif en React + TypeScript, oriente intervention frigorifique professionnelle.

Ce projet n est pas un site vitrine: la base est construite comme un moteur de simulation local, extensible, avec pannes dynamiques et mesures techniques.

## Stack

- React 19
- TypeScript
- Vite
- PixiJS (rendu 2D scene intervention)
- Zustand (etat global + progression)
- React Router (navigation mission / niveaux)
- Framer Motion (animations UI)
- SVG interactif (schemas electrique + frigorifique)
- Donnees locales JSON (aucun backend)

## MVP implemente

- 6 niveaux avec deblocage progressif
- 6 installations fictives:
  - FreshLine POS-900
  - FreshLine NEG-900
  - CryoRoom C+
  - CryoRoom C-
  - PolarRack HFC-P
  - PolarRack HFC-N
- Moteur de simulation (tick toutes les 500 ms)
- Pannes dynamiques non scriptes (effets sur HP/BP, temperature, courant, alarmes)
- Outils interactifs:
  - Manifold
  - Thermometre
  - Multimetre
  - Pince amperemetrique
  - Detecteur de fuite
- Schema frigorifique vivant
- Schema electrique vivant
- Interaction composants (ouvrir/fermer, lancer/arreter)
- Validation mission avec conditions de stabilite

## Structure technique

- src/types/game.ts
  - modeles metier: installation, composant, panne, runtime, mesures
- src/engine/simulation.ts
  - creation runtime
  - tick simulation
  - agregation effets pannes
  - calcul grandeurs frigorifiques et electriques
  - generation lectures outils
- src/store/gameStore.ts
  - etat global
  - progression niveaux
  - actions gameplay (deplacement, mesures, panne, reparation)
- src/screens/HomeScreen.tsx
  - menu principal + niveaux verrouilles/deverrouilles
- src/screens/LevelScreen.tsx
  - cockpit intervention + HUD + schemas + outils
- src/ui/GameViewport.tsx
  - rendu scene intervention via PixiJS
- src/ui/RefrigerationSchematic.tsx
  - schema frigorifique anime
- src/ui/ElectricalSchematic.tsx
  - schema electrique reactif
- src/ui/ToolPanel.tsx
  - usage outils, injection panne, reparation
- public/data/installations.json
  - definitions installations + composants + pannes

## Boucle de mission (MVP)

1. Arrivee site
2. Localisation panne
3. Mesures
4. Diagnostic
5. Reparation
6. Test final
7. Validation intervention

## Scripts

- Dev: npm run dev
- Build: npm run build
- Lint: npm run lint
- Preview: npm run preview

## Copilot guidance

- Prompt kit: docs/COPILOT_SIMULATOR_PROMPTS.md
- Workflow: docs/COPILOT_WORKFLOW.md

## Etat actuel et extensions prevues

La base est prete pour evoluer vers:

- CO2 transcritique
- NH3
- cascade
- supervision multi-installations
- historique alarmes
- maintenance preventive
- diagnostics avances

## Note technique

Le viewport est rendu en PixiJS natif (Application) pour garantir une integration stable avec la version actuelle de la stack.
