# F06 — Progression, suspension et reprise des leçons

Audit du 2026-10-30, code `67afd92`. Invité, Chromium bureau sur serveur de
développement. Contrat : retrouver sa tâche commencée et son avancement après
interruption, en distinguant position, blocs validés et texte en cours de saisie.

## Traçabilité

- [Progression du parcours](../../src/lib/parcours/parcoursProgress.ts).
- [Prochaine tâche](../../src/lib/parcours/nbaEngine.ts).
- [Snapshots](../../src/lib/lesson/sessionSnapshotService.ts).
- [Session interactive](../../src/components/ActiveLessonView.tsx:75).
- Dépendances : F02, F03, F05, F22 et F45. Le stockage local du parcours et le
  snapshot de session sont deux états distincts.

## Scénarios et preuves

| Scénario | Résultat observé |
|---|---|
| Ouvrir la première leçon depuis le parcours | `current` enregistré dans `kunz_parcours_v1` |
| Revenir à l'accueil | La carte prioritaire propose la reprise de cette leçon |
| Cliquer cette reprise | Bon viewer HTML `lesson-phase1_chapitres_1_2` ouvert |
| Leçon active, deux blocs validés, puis reload du document | Bloc d'index 2 et les deux validations retrouvés |
| Réponse en cours avant ce reload | Texte perdu : L02-01 |
| Retour de la leçon active à sa liste | Snapshot supprimé ; réouverture à zéro : L01-01 confirmé |

Scénarios `F06-*` dans le [journal navigateur](preuves/lot02/browser-results.json).
Captures [avant reload](preuves/lot02/07-draft-before-reload.png) et
[après reload](preuves/lot02/08-draft-after-reload.png).
Les tests de stockage, machine, effets de session et progression du parcours
ont été exécutés dans les 262 tests du lot.

## L02-01 — Le brouillon n'est pas restauré

**Gravité modérée ; fait reproduit, confiance élevée.** Dans la première leçon
active, franchir les deux choix initiaux puis saisir `AUDIT-DRAFT-2026-10-30`
dans la première réponse documentaire. Recharger, franchir l'accueil et rouvrir
la même leçon. Le bloc et les validations sont restaurés, mais le champ est vide.

Cause : le snapshot persiste index, validations, issue et feedback, mais aucun
contenu des réponses ; `answers` reste un état React initialisé à `{}`.
L'élève reprend donc une étape, pas l'intégralité du travail de cette étape.
La qualification de gêne est une appréciation UX ; aucune durée de travail
perdue chez un élève réel n'a été mesurée.

Les deux défauts du premier lot restent pertinents :
[L01-01 et L01-02](F03-lecons-actives.md), perte du snapshot au retour et succès
hérité par la leçon suivante. Ils ne sont pas comptés comme de nouvelles découvertes.

## Limites et verdict

**Partielle.** La reprise de tâche et la restauration des validations fonctionnent
sur l'échantillon. La reprise de session interactive ne conserve pas tous les
éléments attendus d'un travail interrompu et reste affectée par les défauts F03.

Un état interne `SESSION_SUSPENDED` existe, mais aucun bouton de pause explicite
n'a été identifié dans ce parcours. La position de défilement HTML, fermeture
forcée Android, stockage saturé, migrations et restauration de sauvegarde ne sont
pas validés par ces essais. La persistance déclarative de F05 ne prouve pas la
persistance d'un brouillon.

Proposition MVP : **conserver une reprise simple et fiable**, avec un contrat
explicite sur ce qui est sauvegardé. La correction de L01-01/L01-02 est nécessaire
si le mode actif est retenu ; la conservation du brouillon est à arbitrer
explicitement plutôt que la promettre implicitement. Décision proposée.
