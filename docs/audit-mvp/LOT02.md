# Lot 02 — F06 à F10

Audit du 2026-10-30, code `67afd92`, documents locaux non commités.
Aucun code produit ni fichier protégé modifié ; aucun correctif ni retrait décidé.

| Fonction | Verdict sur le périmètre testé | Proposition MVP |
|---|---|---|
| [F06 — Reprise](F06-reprise-progression.md) | Partielle : validations restaurées au reload, brouillon perdu ; défaut de retour du lot 1 confirmé | Fiabiliser une reprise simple |
| [F07 — Synthèses et capsules](F07-syntheses-capsules.md) | Parcours représentatifs validés ; notation Hosila distincte d'un rappel SM-2 | Conserver et clarifier |
| [F08 — Cartes mentales](F08-cartes-mentales.md) | Partielle : graphe et quiz accessibles, conflit de zoom et absence de sélection clavier | Simplifier ou différer |
| [F09 — Animations et simulateur](F09-animations-simulateur.md) | Partielle : interactions présentes, approximation présentée comme égalité exacte | Fiabiliser les retours pédagogiques |
| [F10 — QCM](F10-qcm.md) | Séance complète et reprise d'erreur validées sur l'unité testée | Conserver comme entraînement central |

## Vérifications réalisées

- Chromium 156.0.8078.4, Playwright Python, contexte invité jetable, serveur local
  de développement ; bureau 1280×900 et viewport tactile 390×844.
- **42 observations principales et 25 captures**, complétées par un contrôle de
  notation et un diagnostic du chrono sur le composant isolé.
- **23 fichiers Vitest / 262 tests réussis**, puis `npm run lint` réussi.
- Zéro exception JavaScript de page et zéro erreur de scénario dans le relevé final.
- QCM réel U2 : 57 questions, dont 46 QCM et 11 textes à trous ; une erreur
  volontaire, résultat **56/57**, **1 120 XP**, un événement local et une seule note.
- Reprise de la seule erreur puis réussite : pas de deuxième note ni de double XP.

Les réponses de test sont tirées des attendus : elles vérifient le câblage, pas
la validité indépendante du contenu pédagogique. Les minutes créditées au QCM
sont une estimation, pas une mesure du temps réellement passé.

## Nouveaux constats

| Référence | Gravité | Constat et preuve détaillée |
|---|---|---|
| L02-01 | Modérée | Brouillon d'une leçon active perdu au reload, même quand les blocs validés sont restaurés — F06 |
| L02-02 | Modérée | Un clic sur un nœud de carte ouvre aussi le zoom global, qui masque les contrôles — F08 |
| L02-03 | Modérée | Nœuds SVG sans focalisation ni activation clavier identifiées — F08 |
| L02-04 | Majeure pédagogique | Glutamate : le simulateur valide l'immobilité et affiche « 3,0 = 3,2 » — F09 |
| L02-05 | Mineure | Animation du potentiel d'action étiquetée unité 2 au lieu de l'unité officielle 5 — F09 |

Le retour absent du paywall des cartes mentales étend **L01-04**, sans créer un
doublon. La perte de snapshot au retour confirme **L01-01**.

Deux précisions ne sont pas comptées comme défauts nouveaux : la notation Hosila
ne programme pas de carte SM-2 dans le sondage ; le chrono du QCM atteint zéro
sans clôture automatique dans le diagnostic du composant isolé. Le contrat produit
et la documentation doivent employer les termes exacts.

## Limites et suite

Pas de validation globale du produit, de l'APK, du démarrage PWA à froid hors
ligne, des profils payants, de la synchronisation authentifiée ou de toute la
justesse scientifique. Suite entière, Jest, build et CI distante non relancés.

Sources reproductibles : [preuves et commandes](preuves/lot02/README.md).
Suivi central : [journal des audits](JOURNAL.md). Prochain lot : **F11–F15**.
