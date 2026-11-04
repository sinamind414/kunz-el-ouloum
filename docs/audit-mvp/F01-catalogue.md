# F01 — Catalogue et conformité des cours

Audit : 2026-10-30, `67afd92`. Profil invité ; web de développement, Chromium.
Contrat : trouver les unités officielles et leurs cours dans un catalogue cohérent.

## Traçabilité

- [Programme encodé](../../src/data/curriculumOfficial.ts).
- [Domaines et sélection des modes](../../src/data/lessonModes.ts).
- [Séquences par unité](../../src/data/unitLessonSequences.ts).
- [Catalogue visible](../../src/components/LessonsView.tsx).
- Références générales : [architecture](../agents/ARCHITECTURE.md),
  [sources](../agents/SOURCES.md).
- Dépendances : F02, F03, F04 et F40. Une unité dans le catalogue n'est pas
  nécessairement ouverte en mode invité.

## Preuves et résultats

Le scénario `F01-catalogue-ui` du [journal navigateur](preuves/lot01/browser-results.json)
visite les trois domaines par leurs boutons, relève les onze unités 1–11, puis
ouvre une unité gratuite. Le [catalogue extrait](preuves/lot01/catalogue.json)
est issu des exports réellement chargés par Vite, sans modification des données.

| Vérification | Résultat |
|---|---|
| Trois domaines et onze unités proposés | Observé dans l'interface |
| Programme encodé de onze unités | Observé dans les exports |
| Composition du parcours | 74 entrées de leçons + 11 bilans, soit 85 tâches |
| Répartition des leçons du parcours | 47 entrées HTML et 27 entrées actives |
| Définitions dans `ACTIVE_LESSONS` | 29, dont deux variantes à clé HTML non listées dans le menu actif |
| Unité 8 sans entrée active | Observé ; des leçons HTML existent, ce n'est pas à lui seul un contenu manquant |
| Accès invité normal à une leçon active U6 | Paywall affiché, scénario `F01-paid-normal-gate` |
| Variante U6 trouvée par recherche | Incohérence reproduite, détaillée en F04, L01-03 |

Les deux variantes non listées comme actives sont `lecon_transcription` et
`phase11_chapitres_21_22`. Elles sont présentes dans les définitions actives,
mais `hasHtmlFile()` les classe comme HTML dans le parcours. Il ne faut donc
pas additionner les 29 définitions aux 47 entrées HTML pour annoncer le volume
du parcours : les catégories se recouvrent.

Les tests exécutés incluent `curriculumIntegrity`, `lessonListIntegration`,
`lessonRenderParcours`, `parcoursPath`, les getters et le découpage HTML :
voir la liste exacte dans les [preuves](preuves/lot01/README.md).

## Écarts et limites

**Fait documentaire :** le glossaire indique encore 20 leçons actives. Le
comptage courant ci-dessus emploie une convention explicite ; une mise à jour
documentaire a été ajoutée au glossaire sans modifier les données.

**Non vérifié :** conformité de chaque phrase, schéma et objectif au programme
officiel, droits sur chaque source, couverture de chaque compétence, parcours
complet sur les onze unités et comptes payants. Les tests de structure ne
remplacent pas cette revue pédagogique.

## Verdict

**Structure validée sur le périmètre décrit ; conformité pédagogique exhaustive
non vérifiée.** Confiance élevée sur les comptages et les portes visitées.

Proposition MVP : **conserver** le catalogue ; clarifier l'identité et le mode de
chaque leçon, partager le diagnostic d'accès L01-03 avec F04. La fréquence réelle
d'utilisation n'est pas mesurée. Décision de périmètre : proposée, non arrêtée.
