# F19 — Correction ouverte, diagnostics et réserve humaine

## Contrat et périmètre protégé

Audit du 30/10/2026, référence `9bccc8b`, Chromium invité et tests ciblés.
Aucun changement de moteur, données, signatures ou coefficients. Aucune copie
élève de calibrage n'a été utilisée pour établir une précision indépendante.

Il faut distinguer trois résultats : **ICM de forme**, **diagnostic de concepts**
et **points sur attendus officiels**. Aucun des deux premiers ne constitue une
note de BAC. Les items sans reconnaissance automatique restent humains.

## Traçabilité

| Mécanisme | Source | Portée |
|---|---|---|
| Production et portes | `MethodologyCompilerView.tsx`, `methodologyScorer.ts`, `phase2.ts` | Structure, source et mouvement de consigne ; entrée en file si forme validée |
| Diagnostic lexical | `correcteurV1.ts` | Couverture de mots-clés et retour pédagogique, distincts de la note |
| Entités et pistes | `data/dictionaries/dictionnaireCorrecteur.ts` | Entités vérifiées et pistes ambiguës distinguées |
| Barème diagnostique | `baremeCorrecteur.ts` | Rapport d'items, explicitement auxiliaire |
| Note sur attendus | `attendusBac2025.ts`, `calibrationBac2025.ts` | Six groupes officiels 2025, maxima 5/7/8 ; réserve manuelle séparée |
| Transparence | `CorrecteurPanel.tsx`, `SectionObligatoire.tsx` | Avertissements, détails et intervalle si réserve humaine |
| File locale | `utils/correctionQueue.ts` | Statuts `pending`, `approved`, `corrections` |
| Tests | Correcteur, panneau, attendus, plafonds, intégrité, lettres et Phase 2 | Exécutés ; ne mesurent pas la précision sur copies indépendantes |

Les constantes historiques `a`/`b` présentes dans le mapping de calibration
ne doivent pas être assimilées à un fit actif : le chemin de note examiné passe
par les attendus. Elles n'ont pas été utilisées ou modifiées pour cet audit.

## Scénarios et preuves

Captures 17–21 ; relevés `F19-*` dans
[browser-results.json](preuves/lot04/browser-results.json) et
[supplement-results.json](preuves/lot04/supplement-results.json).

| Cas | Résultat observé |
|---|---|
| Production `WRONG` en guidé | Retour de forme et historique ; pas d'entrée dans la file validée |
| Modèle technique de l'exercice, portes cohérentes | Résultat de forme, archivage et entrée en file |
| Panneau scientifique | Concepts et sélecteurs accessibles sur la production enregistrée |
| Groupe officiel S1-Ex3 | Réserve manuelle et avertissement visibles ; pas de note finale automatique définitive |
| Réponse vide aux six groupes, appel des moteurs dans Chromium | Points automatiques=0 pour chacun ; réserve humaine conservée lorsqu'applicable |
| Termes attendus concaténés, entrée synthétique | Plafonds non-prose observés sur cinq groupes ; S1-Ex1 atteint 5/5 : ne pas généraliser un garde-fou uniforme |
| Invité → « المضمون سليم » | Statut local `approved`, conservé après rechargement |

Les appels directs aux moteurs sont des contre-épreuves bornées, pas six
copies corrigées par une personne. Une signature présente ne prouve pas à elle
seule que le raisonnement est juste. Le résultat S1-Ex1 ci-dessus doit être lu
dans le contexte de ses tâches, pas comme une mesure globale de qualité.

## L04-06 — majeur de workflow, validation humaine non établie

Sans token ni profil enseignant, produire une réponse de forme acceptée,
ouvrir la file « المصححة », puis cliquer « المضمون سليم » : l'élève invité
approuve lui-même sa production. `markCorrection` écrit simplement le statut
dans le stockage local. Le texte de l'écran annonce pourtant que l'enseignant
garantit le fond. Captures 19 et 21.

Attendu : distinguer auto-évaluation et correction effectivement reçue d'un
enseignant. Observé : un statut de contenu correct peut être donné localement
par l'élève. **Ce n'est pas une preuve de contournement d'une API enseignant**,
ni un audit complet du suivi F49 ; c'est une ambiguïté concrète de provenance.

## Verdict et proposition MVP

**Partielle : chaîne de correction et réserve manuelle accessibles, provenance
de l'approbation humaine non garantie dans ce parcours.** Conserver l'aide
formative avec des limites explicites. Séparer une auto-évaluation locale d'un
retour enseignant attesté avant d'en faire un argument produit.

La conformité de chaque point et la précision de notation ne sont pas certifiées.
Les 40 copies de calibration ne sont pas un jeu indépendant ; toute performance
publiée sur elles resterait un plancher. Aucun crédit fondé sur similarité
sémantique seule n'est introduit, aucun item manuel converti en mots-clés.
Pas d'essai de classe authentifié, de copies inédites ou de CI distante exécutés.
