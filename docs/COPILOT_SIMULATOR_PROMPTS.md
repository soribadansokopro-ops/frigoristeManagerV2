# Copilot Prompt Kit - Frigoriste Manager

Ce document contient des prompts prets a coller dans Copilot Chat (mode Agent) pour construire un simulateur de depannage frigorifique oriente raisonnement.

## Important

- Inspiration DIDAFRIO: oui pour la pedagogie et les idees.
- Copie DIDAFRIO: non (code, schemas, textes, graphismes).
- React affiche uniquement. Le moteur calcule tout.

## Prompt Maitre (a coller au debut)

```text
Tu es un Senior Software Architect specialise en moteurs de simulation industriels TypeScript.
Tu travailles sur Frigoriste Manager (React 19 + TypeScript + Zustand + SVG interactif).

Objectif:
Construire un simulateur de depannage frigorifique. Le joueur doit raisonner comme un frigoriste.
Le gameplay principal est: Mission -> Installation -> Schema frigo -> Schema elec -> Mesures -> Diagnostic -> Reparation.

Contraintes obligatoires:
1) React ne contient aucune logique metier. React affiche uniquement l etat du runtime.
2) Toute logique est dans src/engine et src/models.
3) Le schema est SVG interactif (pas image), avec composants cliquables et tuyaux dynamiques.
4) Les outils lisent le moteur (manifold, thermometre, multimetre, pince).
5) Les pannes modifient des composants. Les symptomes doivent etre calcules, pas scripts avec if(panne==x).
6) Code modulaire, testable, extensible (SOLID, composition, interfaces).
7) Aucun contenu copie de logiciels tiers.

Definition of Done globale:
- Etat runtime coherent entre frigo, elec, alarmes et outils.
- Chaque composant expose ses variables physiques utiles.
- Les mesures outillage correspondent aux etats calcules par le moteur.
- Le schema affiche des indices etats sans hardcode par mission.

Quand tu proposes des changements:
- Donne un plan en 4-8 etapes max.
- Modifie le code directement.
- Lance la build TypeScript.
- Corrige jusqu a compilation propre.
```

## Prompt Phase 1 - Domain Model composants et connexions

```text
Construis/renforce le modele de composants dans src/models.

Besoin:
- Chaque composant est une classe avec:
  - state interne (running, powered, health, etc.)
  - ports (frigo et/ou elec)
  - methode update(context)
- Ajouter un modele de connexions orientee ports:
  - fromComponentId, fromPort, toComponentId, toPort, medium
- Medium supportes: refrigerant, electrical, signal.

Livrables:
1) Interfaces/types pour ports, links, component snapshot.
2) Classes composants critiques:
   - Compressor, Condenser, ExpansionValve, FilterDrier, SightGlass, Evaporator, Fan, TemperatureProbe.
3) Une fonction de validation de topologie (ports manquants, boucle invalide).
4) Build qui passe.

Ne touche pas l UI pour cette phase.
```

## Prompt Phase 2 - RefrigerationEngine coherent simplifie

```text
Ameliore RefrigerationEngine pour un modele simplifie mais coherent.

Objectif:
- Pas de thermo complete, mais propagation causale realiste:
  - fan condenseur OFF -> HP monte progressivement
  - fuite charge -> HP/BP baissent, surchauffe monte
  - detendeur bloque -> BP baisse, evap sous alimente

Livrables:
1) Etat runtime frigo enrichi:
   - hp, bp, tCondSat, tEvapSat, tSuction, tDischarge,
   - superheat, subcool, massFlow, airFlowM3h,
   - condenserApproach, evapDeltaT
2) Tick stable numeriquement (clamps + smooth).
3) Fonction injectFaultAsComponentDelta(...) sans if(panne==id).
4) Build qui passe.

Reste compatible avec les ecrans React existants.
```

## Prompt Phase 3 - ElectricalEngine et schema electrique vivant

```text
Ameliore ElectricalEngine + schema electrique SVG.

Objectif:
- Graphe electrique source -> protections -> commande -> charge.
- Couleur des fils selon energisation (vert/gris/alerte).
- Mesures de tension calculables entre deux points.

Livrables:
1) Snapshot electrique enrichi:
   - nodes, edges, activeEdges, testPointVoltage, measuredVoltage.
2) Procedure de mesure guidee non bloquante.
3) Etats de composants affiches sur schema (fusible, regulateur, bobine, compresseur).
4) Build qui passe.
```

## Prompt Phase 4 - Tool Engine et mesures virtuelles

```text
Refactorise ToolEngine pour brancher les outils sur le moteur.

Outils:
- Manifold: HP/BP
- Thermometre: temperature sur point/tube
- Multimetre: tension entre deux points
- Pince: courant composant
- Detecteur fuite: indice fuite probabiliste local

Livrables:
1) API unique readTool(tool, target, runtime).
2) Validation de branchement (port/type cible).
3) Historique de mesures timestamped par mission.
4) Build qui passe.
```

## Prompt Phase 5 - UI schema vivant orientee depannage

```text
Ameliore l UI pour depannage: pas de map, focus schema vivant.

Livrables:
1) RefrigerationDiagram SVG:
   - composants cliquables
   - tuyaux animes selon etat (HP rouge, BP bleu, off gris, anomalie jaune)
   - badges etat composant (ALIM/RUN/FUITE)
2) ElectricalDiagram SVG:
   - fils energises dynamiques
   - points de test cliquables
3) Panels:
   - ProcessPanel (T aspiration/refoulement, debit air, condenseur)
   - MissionGuidePanel (indices sans spoiler)
4) Build + responsive.
```

## Prompt Phase 6 - Missions et diagnostic

```text
Refactorise MissionEngine/DiagnosisEngine pour workflow metier.

Workflow cible:
Mission -> Mesures -> Hypothese -> Verification -> Reparation -> Validation.

Livrables:
1) Mission JSON minimal:
   - installationId, initialDeltas, objectives, validationRules.
2) Diagnosis score:
   - penalite mesures inutiles
   - bonus enchainement logique
3) Explication post mission:
   - causes, symptomes observes, bonnes mesures.
4) Build qui passe.
```

## Prompt final - Hardening

```text
Fais un hardening global:
- nettoyer doublons
- typer strictement
- corriger warnings TS/ESLint
- ajouter tests unitaires critiques sur moteur
- documenter architecture dans README

Ne change pas le comportement metier attendu.
```

## Prompt court (quand tu veux juste avancer vite)

```text
Continue Frigoriste Manager en mode simulateur professionnel.
Ne fais aucune logique metier dans React.
Concentre toi sur moteur frigo/elec, schema SVG vivant, et outils de mesure relies au runtime.
Applique des changements incrementaux compilables et lance npm run build apres chaque bloc.
```
