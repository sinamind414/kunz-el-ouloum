# F03 — Leçons interactives

Audit : 2026-10-30, `67afd92`. Invité, Chromium bureau et viewport mobile.
Contrat : commencer une mission, répondre aux blocs, reprendre le travail et
passer à la leçon suivante avec un état propre.

## Traçabilité

- [Composant actif](../../src/components/ActiveLessonView.tsx:75).
- [Appel depuis le catalogue](../../src/components/LessonsView.tsx:212).
- [Machine de session](../../src/lib/lesson/tunnelStateMachine.ts).
- [Stockage de session](../../src/lib/lesson/sessionSnapshotService.ts).
- `src/data/activeLessons.ts` : données protégées, non modifiées.
- Dépendances : F06, F19, F20, F40 et F47.

## Scénarios et résultats

Leçon sondée : `d1-u1-l1-expression-genique`, six blocs. Les champs ont été
remplis par des fixtures techniques construites à partir des attendus du corpus,
sans injection de progression et sans appel direct au reducer.
Cela vérifie le câblage de la traversée, pas la qualité du raisonnement scientifique
ni la robustesse de la correction à des réponses réelles.

| Scénario | Résultat |
|---|---|
| Mission, démarrage, choix et passage au bloc suivant | Fonctionne |
| Soumission vide sur le bloc documentaire | Erreur visible, bloc non validé |
| Réponses techniques sur les six blocs | Passage à l'autoévaluation puis à la fin |
| Rechargement du document après un bloc validé | Position et validation retrouvées en rouvrant la leçon |
| Retour à la liste puis réouverture | Avancement perdu : L01-01 |
| Leçon suivante après réussite | Succès de l'ancienne session réutilisé : L01-02 |
| Affichage mobile 390×844 au début de la leçon | Mission et contrôles rendus ; capture examinée, pas de certification d'accessibilité |

Preuves : scénarios `F03-*` du [journal](preuves/lot01/browser-results.json),
[contrôle de reload](preuves/lot01/supplement-results.json),
[vue mobile](preuves/lot01/16-mobile-active.png).

## L01-01 — Perte de reprise par navigation

**Majeure, confiance élevée.**

1. Ouvrir la leçon et démarrer.
2. Valider le premier choix : snapshot `currentBlockIndex: 1`, premier bloc validé.
3. Cliquer « retour à la liste des leçons actives ».
4. Rouvrir la même leçon : retour à l'écran de mission, zéro bloc validé.

Le stockage contient un snapshot avant le retour et n'en contient plus après.
Captures [avant](preuves/lot01/07-active-before-back.png) et
[après](preuves/lot01/08-active-after-back.png).

Cause directe : l'effet de nettoyage à
[ActiveLessonView.tsx:119](../../src/components/ActiveLessonView.tsx:119)
appelle `clearLessonSnapshot(lessonKey)` à la sortie du composant. La reprise
après rechargement fonctionne dans le contrôle complémentaire ; le défaut
est donc distinct d'une incapacité générale à écrire dans le stockage.

## L01-02 — La nouvelle leçon hérite d'un succès précédent

**Majeure, confiance élevée.** Terminer les six blocs, choisir « bien maîtrisé »,
puis cliquer « leçon suivante ». La transcription à quatre blocs s'affiche avec
**6/4**, la barre dépassant sa zone et le message « transcription terminée »,
sans répondre à cette nouvelle leçon.

Preuve : `F03-next-lesson-state`, [capture explicite](preuves/lot01/10-active-next.png).

Cause étayée : le parent remplace `lessonKey` sur la même instance React, sans
`key` de remontage ; le `useReducer` initialise la session au montage et aucun
effet ne réinitialise session/réponses lorsque la clé change. La sauvegarde
réécrit alors l'état sous la clé de la nouvelle leçon. Ce défaut produit une
fausse fin de leçon et peut contaminer sa session sauvegardée.

## Couverture et limites

Les tests de données actives, machine, stockage et effets passent dans le lot.
Le test de navigation `LessonsViewActiveNav.test.tsx` remplace cependant le
viewer actif par un mock : il ne vérifie pas la conservation de son état React.
Des tests unitaires verts ne contredisent donc pas les deux reproductions.

Non vérifiés : toutes les leçons et tous les types de blocs, qualité des
feedbacks sur de vraies réponses, brouillons de texte, compte serveur, APK et
reprise après fermeture du processus Android. Aucun résultat d'efficacité du
correcteur n'est déduit des fixtures.

## Verdict et MVP

**Partielle.** La traversée existe, mais reprise et transition ne sont pas fiables.
Proposition : **simplifier et fiabiliser avant de conserver au MVP** ; à défaut,
différer ce mode tout en gardant les cours HTML évalués séparément.
Cette alternative reste une proposition, pas une décision de suppression.

Nouvelle vérification nécessaire : retour/reprise sans perte, transition 0/N
vers la nouvelle leçon, absence de fausse réussite et isolation des snapshots.
