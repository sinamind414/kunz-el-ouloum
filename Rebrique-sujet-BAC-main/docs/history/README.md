# `docs/history/` — archives du dépôt

Contenu déplacé ici le 2026-09-18 pour désencombrer la racine du dépôt. **Rien n'est
supprimé** : chaque élément reste consultable et l'historique Git est intact (`git log --follow`
retrouve les chemins d'origine).

Ces fichiers sont **inertes** : aucun n'est importé par le code, aucun n'est servi par
`server.mjs` (`docs/` n'est pas dans `PUBLIC_DIRECTORIES`), et `docs/history/_v1_backup/**`
reste exclu du lint par `eslint.config.js`.

| Élément | Rôle d'origine | Statut |
| --- | --- | --- |
| `ANALYSE_LIGNE_PAR_LIGNE.md` | Analyse ligne par ligne du 2026-09-17 | ⚠️ **Numéros de lignes périmés** — ne pas raisonner sur ce document sans re-grepper le code |
| `CONTINUATION.md` | Journal de continuation de l'audit du 2026-09-17 | Cité en commentaire par `tests/bug-fixes-2026-09-17.test.mjs:30,34` |
| `_v1_backup/` | Ancien site monolithique (`README.md` + `index.html`) | Conservé au cas où ; jamais servi |
| `patches/` | 3 `.patch` + `INDEX.md`, `README.md`, `apply-patches.sh` | **Déjà appliqués sur `main`** selon `patches/INDEX.md` |
| `01a07c55-65b0-7317-af13-bd3460834d72.patch` | Correctif appliqué (360 Ko) | Déjà appliqué |

## Avertissement sur `ANALYSE_LIGNE_PAR_LIGNE.md`

Ce document cite des numéros de lignes qui ne correspondent plus au code. Exemple mesuré : il
décrit en « L.101-117 », « L.389 », « L.394-402 » un défaut de `js/ui.js` dont les emplacements
réels étaient, au moment de l'archivage, `toast()` en ligne 100, l'affectation `timers.onChange`
en 349 et la création de la zone en 366-373.

Sa conclusion sur ce point était en outre **partiellement fausse** : le chemin qu'il décrit
(`timers.onChange` déclenché pendant `init()`) n'était pas atteignable, car `init()` s'exécute
sans `await` jusqu'à la création de la zone et aucun `startGlobal`/`startStrategy`/`_tick` ne se
déclenche dans cette fenêtre. Le mode d'échec réel — perte silencieuse de toute notification
émise **avant** `init()` — a été corrigé par `ensureToastZone()` dans `js/ui.js`, verrouillé par
`tests/toast-zone.test.mjs`.

## `patches/apply-patches.sh`

Le script est conservé pour traçabilité. Il n'est branché sur **aucun** script npm. Si vous le
relancez, sachez que ses chemins internes pointent désormais vers `docs/history/patches/`.
