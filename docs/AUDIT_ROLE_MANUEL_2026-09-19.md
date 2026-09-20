# AUDIT — « Rôle du manuel dans l'application » (texte collé vs dépôt réel)

**Date** : 2026-09-20 · **Objet** : vérifier, réclamation par réclamation, la description
du rôle du « manuel SVT corrigé » (`book_tdm_clean.md` / `svth_bac_3as.json`) fournie
par le propriétaire (texte d'origine LLM, style promotionnel).
**Méthode** : `git ls-files` + `find` + greps ciblés + lecture des fichiers cités.
**Verdict global** : 2 réclamations FAUSSES (dont une hallucination de fichier),
1 PARTIELLE, 1 VRAIE. Le texte décrit une architecture qui n'existe pas — mais
l'ancrage manuel RÉEL du projet est solide et documenté ci-dessous.

---

## Verdicts réclamation par réclamation

| # | Réclamation | Verdict | Preuve |
|---|---|---|---|
| 1 | « `book_tdm_clean.md` = le manuel SVT corrigé, Single Source of Truth » | **FAUX** | Le fichier fait **5 928 octets / 15 titres** : c'est la **Table Des Matières** bilingue (55 chapitres), pas le manuel. Le contenu réel = **25 leçons HTML** (`public/lessons/`). Le livre OCR complet (334 p., 325 879 car.) est cité comme source « MAN » dans `docs/AUDIT_LECONS_PASSIVES_VS_LIVRE.md` mais **n'est pas dans le dépôt** (`LIVRE SVT BAC .txt` absent de git). Une source de vérité de 6 Ko ne sourçait rien. |
| 2 | « Transformé en `svth_bac_3as.json` (pages, questions, expériences, résumés d'or, thèmes transversaux) » | **FAUX — fichier fantôme** | `svth_bac_3as.json` : **zéro hit** dans tout le dépôt (git, src, scripts, docs). Aucun pipeline manuel→JSON n'existe. Les « résumés d'or » n'existent que comme concept de rédaction, pas comme base de données. |
| 3 | « API Viewer affiche n'importe quelle page corrigée » | **PARTIEL** | Aucune API de pages dans `server.ts` (endpoints réels : auth, student sync, teacher dashboard, activity). Il existe un **viewer frontend** (`HtmlLessonViewer`, lecteur LOT-T) qui sert des **leçons statiques** par chapitre — pas « n'importe quelle page ». |
| 4 | « Le correcteur BAC compare la réponse au texte officiel corrigé du manuel » (exemple Calvin : « cherche la page, compare, feedback basé sur le manuel ») | **FAUX — et c'est le plus important** | Depuis la **P2 règle dure** (commit ccd103a, 2026-09-19) : **aucun** chemin de note ne touche le manuel. La note sort exclusivement du registre des **attendus du corrigé ministériel 2025** (`attendusBac2025.ts`) + plafonds d'intégrité + sanctions. Vérifié : ni `calibrationBac2025.ts`, ni `attendusBac2025.ts`, ni `sanctionsCorrecteur.ts`, ni `dictionnaireCorrecteur.ts` n'importent le manuel. « Comparer la réponse au texte du livre » serait une régression pédagogique — l'élève n'a pas à recopier le livre, il est noté sur des attendus officiels chiffrés. |
| 5 | « Ancrage au programme officiel + tests vérifient l'exactitude » | **VRAI** | `docs/AUDIT_LECONS_PASSIVES_VS_LIVRE.md` (2026-09-19) : thèmes et verbes des 25 leçons confrontés au livre (334 p.) et au programme 2017, verdict leçon par leçon (dont des ❌ `CULTURE_GENERALE` assumés), §5 corrections appliquées, §6 reste à faire. Plus `htmlLessonProgression.test.ts`, `lessonListIntegration.test.ts`, boussole 138/138, suite vitest 769/769. Terme erroné « البنیة الرباعیة » : **0 occurrence** dans les leçons (le correcte « الرابعية » est utilisé). |

## Ce que le manuel alimente RÉELLEMENT (architecture vérifiée)

1. **Cartographie** : `book_tdm_clean.md` (TDM, 55 chapitres) → titres des leçons
   alignés mot à mot (`src/lessonData.ts`, vérifié par l'audit leçons↔livre).
2. **Diagnostic (JAMAIS la note)** : le dictionnaire du correcteur
   (`dictionnaire_final.json`, 617 entités + 80 attendus) est un **build** dérivé
   des données du livre — il sert à la couche diagnostique (entités reconnues,
   mots-clés), affichée comme telle.
3. **Errata officiels en moteur** : `src/data/manuelErrata.ts` (consommé par
   `ValidationEngine.ts`) — un terme erroné du manuel imprimé n'est **jamais
   sanctionné** chez l'élève ; la forme correcte (دليل الأستاذ) est recommandée.
   Les corrections vivent dans le MOTEUR, pas dans un livre réécrit.
4. **Affichage** : 25 leçons HTML statiques (`public/lessons/`) servies au
   frontend (viewer), chunks paresseux vérifiés par smoke test.

## Pour rendre les réclamations vraies (roadmap honnête, non chiffrée)

1. **Ingestion du livre complet** par le canal fiable (texte collé, comme le
   دليل الأستاذ) → `docs/sources/` + extraits sourcés. Sans cela, aucune
   « source unique de vérité » n'est possible.
2. **Traçabilité manuel→attendus** : relier chaque item du registre à sa
   page/section du livre (le champ `source` des items existe déjà — le
   compléter avec des références de pages vérifiées).
3. **Supprimer ou réaliser** `svth_bac_3as.json` : aujourd'hui ce nom ne
   désigne rien — un README qui le citerait mentirait.

## Leçon d'audit

Le texte collé est l'exemple type d'une réclamation d'architecture **non
sourcée** : nom de fichier plausible (`svth_bac_3as.json`), concept séduisant
(« cerveau pédagogique »), exemple concret inventé (Calvin). Les trois sont
vérifiables en trois greps — et deux sur trois tombent. La vraie architecture
est MEILLEURE que la description : la note vient du corrigé ministériel
(vérifiable, chiffré, testé), pas d'une comparaison floue à un livre.
