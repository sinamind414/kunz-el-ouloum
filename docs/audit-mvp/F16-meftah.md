# F16 — Meftah et les consignes du BAC

## Contrat et périmètre

Audit du 30/10/2026, référence `9bccc8b`, code produit inchangé ; lot 03
documentaire encore non commité. Chromium local, invité, bureau et sondage
mobile. Aucun correctif. Besoin : comprendre le geste demandé par une consigne,
consulter un exemple BAC après tentative, puis trouver l'entraînement associé.

## Traçabilité

| Élément | Source | Observation |
|---|---|---|
| Entrée principale | `App.tsx`, onglet `methodology` | Monte `MethodologyCompilerView`, qui ouvre Meftah par défaut |
| Lecture | `MeftahView.tsx`, `data/meftahManhajia.ts` | 3 niveaux méthode, 3 exercices BAC 2025 / 10 questions |
| Identité et carte | `data/miftahSpec.ts`, `MiftahCard.tsx` | Marque et fiche ; distinctes du parcours de consultation |
| Recherche | `normalizeArabic`, filtres de `MeftahView` | Recherche dans titres, sections et contenus des niveaux |
| Exemples BAC | `BacQuestionCard`, état `devoile` | Modèle masqué jusqu'à déclaration d'une tentative papier |
| Liens d'entraînement | Prop `onOpenVerb` | Parent ouvre l'index des verbes, sans exploiter l'identifiant transmis |
| Tests | `MeftahView.test.tsx`, tests méthodologiques voisins | Exécutés dans les 487 tests ciblés du lot |

La documentation `docs/PROTOCOLE_PREUVE.md` définit une évaluation d'efficacité
sur copies indépendantes ; ce protocole n'est pas exécuté par cet audit.
Réussir une navigation ne prouve pas un transfert des gestes vers le BAC.

## Scénarios et résultats

Relevés `F16-*` de [browser-results.json](preuves/lot04/browser-results.json),
captures 00, 03–07 et 30–31.

| Scénario | Observé |
|---|---|
| Entrée invité | Meftah ouvert, trois niveaux et application BAC visibles |
| Niveau de base | Sections présentes et consultables |
| Recherche sans correspondance puis effacement | Filtre le contenu, puis restaure la vue |
| BAC 2025, exercice 1, question 2 | Modèle absent avant clic de révélation |
| « J'ai essayé sur papier » | Éléments du modèle révélés ; l'app ne mesure pas la tentative papier |
| Entraînement du verbe associé | Ouvre l'index général des verbes |
| Retour accueil puis Méthode | Meftah revient à son écran de choix ; aucune progression pédagogique promise |
| Mobile 390×844 | Accueil et niveau de base inspectés ; pas d'APK réel |

## L04-01 — mineur, contexte du lien perdu

Depuis BAC 2025 / exercice 1 / question 2, ouvrir « تدرب على الفعل المناسب ».
La question transmet `linkedVerbId: 'explain'`, mais le parent utilise seulement
`() => setActiveTab('verbs_ref')`. L'écran obtenu présente les **12 verbes**,
sans sélection ou ciblage du verbe attendu. Capture 07.

Attendu pour ce lien contextuel : amener au verbe correspondant. Impact borné :
l'index reste utilisable, mais l'élève doit retrouver lui-même le bon geste.
Ce n'est ni une erreur de calcul ni une porte entièrement morte.

## Verdict et proposition MVP

**Consultation et révélation validées sur l'échantillon ; navigation contextuelle
partielle.** Conserver Meftah comme entrée unique de la méthode, simplifier les
renvois vers les outils associés et cibler réellement le verbe demandé.

Valeur supposée importante pour interpréter les consignes ; usage réel inconnu.
Maintenir une seule terminologie de méthode et distinguer les fiches imprimées
de la consultation interactive. Aucun périmètre définitif décidé.

Limites : exactitude exhaustive des dix modèles BAC non expertisée ; pas de
tentative papier humaine observée, de dictée, de profil enseignant, d'APK,
de démarrage hors ligne à froid ou de mesure d'efficacité pédagogique.
