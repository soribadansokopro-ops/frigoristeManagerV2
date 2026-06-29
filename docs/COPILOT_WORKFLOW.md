# Comment faire coder Copilot sur ce projet

## 1) Regle de pilotage

Copilot doit travailler par phases courtes:

1. Comprendre la phase
2. Modifier le code
3. Compiler
4. Corriger erreurs
5. Resumer ce qui a change

Ne jamais demander un gros refactor total en un seul prompt.

## 2) Sequence recommandee

1. Domain model composants + ports
2. Refrigeration engine
3. Electrical engine
4. Tool engine
5. Schema SVG vivant
6. Mission + diagnostic
7. Tests + hardening

## 3) Message type a envoyer a Copilot (a chaque phase)

```text
Travaille uniquement sur la phase X.
Contraintes:
- React affiche uniquement, pas de logique metier.
- Moteur dans src/engine et src/models.
- Changements incrementaux compilables.
- Lance npm run build et corrige les erreurs.
- Donne un resume court des fichiers modifies.
```

## 4) Definition of Done par phase

Une phase est terminee seulement si:

- npm run build passe
- les nouveaux champs runtime sont visibles dans l UI
- aucune incoherence entre schemas, mesures et etat moteur

## 5) Checklist coherence simulateur

- Une panne est une modification de composant, pas un script scenario fixe.
- Les symptomes sont calcules (HP/BP/temp/courant/alarmes).
- Le manifold lit HP/BP runtime reel.
- Le thermometre lit le bon noeud/segment.
- Le multimetre lit la topologie electrique en cours.
- Le schema affiche visuellement ce que le moteur calcule.

## 6) Quand Copilot part dans la mauvaise direction

Si Copilot reintroduit de la logique metier dans React, envoie:

```text
Stop. Deplace toute logique metier hors React.
React doit recevoir un snapshot runtime deja calcule.
Refactorise vers engine + selectors store.
```

Si Copilot fait une UI jolie mais incoherente metier, envoie:

```text
Priorite metier. Verifie coherence causale des mesures:
changement composant -> propagation moteur -> mesures -> schema.
Ajoute assertions et garde-fous dans le moteur.
```

## 7) Notes DIDAFRIO

- Tu peux t inspirer des approches pedagogiques.
- Tu ne dois pas copier contenus proteges (assets, textes, schemas, code).
- Recree des schemas SVG originaux et des cas pedagogiques originaux.
