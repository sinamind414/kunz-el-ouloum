# docs/sources — Sources officielles du correcteur (étiquettes L1..L6)

Corpus de référence de la banque de mots-clés (`src/correcteurV1.ts`) et du
garde-fou de traçabilité (`src/correcteurV1.test.ts`).

## Contenu et statut de commit

| Étiquette | Fichier | Statut | Raison |
|---|---|---|---|
| L1 | `الكتاب_المصحح_v1.0.md` | local uniquement → extrait dans `tronque/` | livre — droits d'auteur |
| L2 | `504601676-كتاب-العلوم-للطالبة-اكرام-بوزار.txt` | local uniquement → extrait dans `tronque/` | livre — droits d'auteur |
| L3 | `LIVRE MANHADJIYA.md` | local uniquement → extrait dans `tronque/` | livre — droits d'auteur |
| L4 | `PROGRAMME NATIONAL SCIENCE VIE BAC - Copie.txt` | local uniquement → extrait dans `tronque/` | livre — droits d'auteur |
| L5 | `التدرج-السنوي-للتعلمات-2017.txt` | **commité** | document officiel (programme) |
| L6 | `دليل-الأستاذ-2017.txt` | **commité** | document officiel (guide) |

Le `.gitignore` de ce dossier bloque tout commit accidentel des livres L1–L4.

## Extraits tronqués (`tronque/`) — traçabilité en CI

But : prouver en CI que chaque mot-clé issu de L1–L4 existe bien dans sa source,
sans committer le livre. Génération, sur la machine possédant les livres :

```bash
npm run sources:tronquer
git add docs/sources/tronque/
git commit -m "test(correcteur): extraits tronqués L1–L4 — traçabilité CI"
```

L'extracteur (`scripts/tronquer-sources.ts`) :
1. normalise chaque source **exactement comme le test** (`fixSubscripts` + `normalizeAr`) ;
2. localise chaque mot-clé des unités déclarant la source (tolérance « الـ » incluse) ;
3. conserve ±80 caractères de contexte par occurrence ;
4. fusionne les fenêtres chevauchantes, puis écrit `tronque/<même nom de fichier>`.

Le test lit `docs/sources/<fichier>` (livre complet local) s'il existe, sinon
`docs/sources/tronque/<fichier>` (extrait commité).

## Comportement du gate de traçabilité (granulaire PAR UNITÉ, audit 2026-09-16)

Une unité n'est vérifiée que si **toutes** ses sources déclarées sont disponibles
(la preuve d'un mot-clé peut vivre dans n'importe laquelle de ses sources) :

| Fixtures disponibles | Effet |
|---|---|
| aucune | bloc traçabilité skippé |
| ≥ 1 (ex. L5/L6 en CI) | bloc **actif** ; les unités dont TOUTES les sources déclarées sont présentes sont intégralement vérifiées ; les autres attendent leurs extraits (comptées, non bloquantes) |
| les 6 | garantie stricte : 100 % des unités vérifiées, aucune hors périmètre |

Comme les 11 unités déclarent `['L1','L2','L5','L6']`, **commiter les extraits
`tronque/` de L1 + L2 active la vérification intégrale des 11 unités en CI**.

⚠️ Un extrait tronqué n'est pas le livre : il ne prouve que les mots-clés qu'il
contient. Dès qu'un livre complet est disponible localement, relancer
`npm run sources:tronquer` pour enrichir l'extrait puis committer.
