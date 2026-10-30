# F02 — Lecture des leçons HTML

Audit : 2026-10-30, `67afd92`. Invité ; bureau et viewport mobile Chromium.
Contrat : ouvrir une leçon gratuite, lire et utiliser son contenu, accéder à la
suivante et revenir à la liste sans impasse.

## Traçabilité

- [Viewer](../../src/components/HtmlLessonViewer.tsx:149), fichier protégé non modifié.
- [Getters réseau](../../src/data/lessonHtmlGetters.ts).
- [Découpage des chapitres](../../src/data/lessonChapterSplit.ts).
- [Porte d'accès](../../src/components/LessonsView.tsx:227).
- Données : `public/lessons/`, protégées ; dépendances F01, F40, F43 et F47.

## Scénarios exécutés

| Scénario | Observé | Preuve |
|---|---|---|
| Cours → officiel → domaine 1 → unité 1 → premier chapitre | Iframe `lesson-phase1_chapitres_1_2`, contenu de 2 745 caractères dans cette capture, images présentes | `F02-html-quiz` et [capture](preuves/lot01/05-html.png) |
| Répondre au QCM interne (choix B) | Feedback change effectivement ; scripts actifs dans la sandbox | `F02-html-quiz`, [capture après réponse](preuves/lot01/06-html-quiz.png) |
| Leçon suivante | Iframe passe à `lesson-lecon_transcription` | `F02-html-next` |
| Retour à la liste | Grille des chapitres de l'unité retrouvée | `F02-html-return` |
| Abandon du téléchargement simulé par Playwright | Message « impossible de charger » et bouton retour présents | `F02-load-error`, [capture](preuves/lot01/20-html-load-error.png) |
| Viewport tactile 390×844 | Largeur externe 390/390 ; iframe 388/388, pas de débordement horizontal dans ce sondage | `mobile-html-overflow`, [capture](preuves/lot01/15-mobile-html.png) |

Les tests de getters, de liste, de découpage, de navigation et de rendu élève
ont été exécutés dans les 268 tests du lot. La sandbox observée vaut
`allow-scripts`, sans `allow-same-origin` ; ce constat n'est pas un audit sécurité.

## L01-04 — Retour absent depuis le paywall HTML

**Gravité modérée, reproduite.** En invité, chercher « التركيب الضوئي », ouvrir
le résultat HTML `phase12_chapitres_23_24_2` (U6). Le paywall s'affiche avec le
champ d'activation, mais aucun bouton local « retour » n'est présent.

Preuves : [résultats complémentaires](preuves/lot01/supplement-results.json),
[capture](preuves/lot01/22-html-search-paywall.png). La navigation principale
reste disponible : il ne s'agit pas d'un blocage complet de l'application.

Cause observée : la branche HTML de `LessonsView` instancie `EcranPaiement`
sans `onRetour`, contrairement à la branche active. La sortie de la leçon
ouverte normalement fonctionne ; le défaut se situe avant la lecture.

## Limites et verdict

Le parcours représentatif gratuit est **validé** sur ces scénarios. La fonction
reste **partielle au niveau du parcours d'accès**, à cause de L01-04.

Non vérifiés : lecture détaillée de chaque chapitre, justesse de chaque quiz,
zoom des figures (périmètre concurrent protégé), technologies d'assistance,
reprise de position de lecture, APK et PWA hors ligne en production. Le service
worker n'est pas actif en développement ; aucune conclusion globale hors ligne.

Proposition MVP : **conserver** la lecture officielle et fiabiliser ses sorties.
Ne pas assimiler lecture ou quiz local à une preuve de maîtrise synchronisée.
Décision de périmètre : proposée, non arrêtée.
