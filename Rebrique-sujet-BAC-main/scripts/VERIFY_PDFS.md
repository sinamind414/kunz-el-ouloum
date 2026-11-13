# Vérification des PDF de l'archive BAC

## Statut (2026-08-31)

Les **9 PDF** dont le viewer dzexams affiche « 0 pages » ont été validés
mécaniquement (commit `0cc7e44`, PR #14) :

- HTTP 200
- en-tête `%PDF`
- fichier non vide

Les **18** entrées d'archive restantes 2013–2020 (2020 SE retirée,
désormais 4D) ont `contentVerified: true`.

La relecture **visuelle** page à page (sujet + تصحيح) des **9 PDF
dzexams** n'a **pas** été faite dans la sandbox : viewer « 0 pages » ;
`curl` / `wget` / `urllib` TLS échouent. **Ne pas marquer une
relecture visuelle dzexams qui n'a pas eu lieu.**

Miroirs eddirasa lus au `fetch_page` (OCR RTL, 2026-09-01) — **pas**
les octets dzexams :

| Source eddirasa                                                                                                         | Ce qui a été lu                                                                                                                                | Ce qui manque                                                      |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [2016 SE main, chunk 1](https://eddirasa.com/wp-content/uploads/2016/05/eddirasa-com-bac-sci-science-2016.pdf)          | pp. 7–10 : ATP (ADP/Pi, FAL, DCCD) ; GABA/Ach ; **BZD**                                                                                        | corrigé 2016 main (URL PDF non observé)                            |
| [2016 SE exceptional](https://eddirasa.com/wp-content/uploads/2016/06/bac-science-2016-se-2-1.pdf)                      | énoncé 11 p. (2 sujets) : Ag Z / thymus ; mito/DNP/cyanure ; ocytocine-vasopressine ; carboxypeptidase ; TTX/TEA/Patch-clamp ; Rubisco/APG-RDP | corrigé (`correction-bac-se-science-2016-2` = page HTML seulement) |
| [2018 Maths corrigé](https://eddirasa.com/wp-content/uploads/2018/07/eddirasa-com-correction-bac-math-science-2018.pdf) | 6 p. RTL : 7+13 / 6+14 ; VIH/LT4/IL-2 ; Ac/tétanos ; ribonucléase Phe→Tyr                                                                      | énoncé 2018 M                                                      |

Pas de 4D : énoncé **et** corrigé officiels pas tous les deux lisibles.
URLs 2018 SE papier et 2014 SE corrigé : `fetch_page` a déjà échoué —
non relancé. 2021 SE : pages HTML eddirasa sans URL PDF observé ;
aucun chemin inventé.

## Entrées concernées (viewer bloqué, PDF direct OK en session précédente)

| Année | Filière | Session     | Lien PDF                                                                                            | Accès mécanique | Relecture visuelle sandbox                            |
| ----- | ------- | ----------- | --------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------- |
| 2018  | SE      | main        | [PDF](https://www.dzexams.com/uploads/sujets/officiels/bac/2018/dzexams-bac-sciences-3509975.pdf)   | ✅              | non (dzexams) ; miroir eddirasa papier déjà en échec  |
| 2016  | SE      | exceptional | [PDF](https://www.dzexams.com/uploads/sujets/officiels/bac/2016-2/dzexams-bac-sciences-3814840.pdf) | ✅              | non (dzexams) ; énoncé eddirasa OCR RTL               |
| 2014  | SE      | main        | [PDF](https://www.dzexams.com/uploads/sujets/officiels/bac/2014/dzexams-bac-sciences-4380238.pdf)   | ✅              | non (dzexams) ; miroir corrigé eddirasa déjà en échec |
| 2019  | M       | main        | [PDF](https://www.dzexams.com/uploads/sujets/officiels/bac/2019/dzexams-bac-sciences-2280992.pdf)   | ✅              | non                                                   |
| 2018  | M       | main        | [PDF](https://www.dzexams.com/uploads/sujets/officiels/bac/2018/dzexams-bac-sciences-1967487.pdf)   | ✅              | non (dzexams) ; corrigé eddirasa OCR RTL              |
| 2017  | M       | main        | [PDF](https://www.dzexams.com/uploads/sujets/officiels/bac/2017/dzexams-bac-sciences-2275712.pdf)   | ✅              | non                                                   |
| 2015  | M       | main        | [PDF](https://www.dzexams.com/uploads/sujets/officiels/bac/2015/dzexams-bac-sciences-2723927.pdf)   | ✅              | non                                                   |
| 2014  | M       | main        | [PDF](https://www.dzexams.com/uploads/sujets/officiels/bac/2014/dzexams-bac-sciences-2369148.pdf)   | ✅              | non                                                   |
| 2013  | M       | main        | [PDF](https://www.dzexams.com/uploads/sujets/officiels/bac/2013/dzexams-bac-sciences-2770867.pdf)   | ✅              | non                                                   |

## 2021

| Année | Filière | Viewer sandbox | PDF observé                                                                                                                   | 4D                                            |
| ----- | ------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 2021  | SE      | 0 pages        | [lien](https://www.dzexams.com/uploads/sujets/officiels/bac/2021/dzexams-bac-sciences-2728849.pdf) (`contentVerified: false`) | non — pas de couche texte                     |
| 2021  | M       | 12 pages, OK   | pièces jointes visibles ; pas de `pdfUrl` inventé                                                                             | **oui** — `data/year-2021-m.js` (id `2021-m`) |

2020 SE : énoncé + corrigé officiels eddirasa encodés dans `data/year-2020-se.js`
(id `2020`). Miroir dzexams catalogué historiquement ; plus de carte d'archive SE.

## Relancer le script (en local)

```bash
node scripts/verify-archive-pdfs.mjs
```

Le script ne cible que les entrées encore `viewer: "blocked"` **et**
non vérifiées : 2021 SE + Maths 2022–2026 (`contentVerified: false` côté
octets dzexams). La relecture visuelle des 9 PDF dzexams « 0 pages »
n'a toujours pas eu lieu dans la sandbox.

## Maths 2022–2026 (4D eddirasa) et SE 2020/2026 (4D)

Pages dzexams ouvertes le 2026-08-31. Viewer Maths bloqué ; `pdfUrl` observé.
4D Maths 2022–2026 : énoncé + corrigé officiels eddirasa
(`data/year-2022-m.js` … `data/year-2026-m.js`).
SE 2026 : `data/year-2026-se.js`. SE 2020 : `data/year-2020-se.js`.

## Trous documentés

**2016 / Maths / session exceptionnelle** : une seule ligne 2016 sur l'index.
**تقني رياضي** : pas de catégorie SVT (index racine = se + m seulement).
Aucun URL inventé (`ARCHIVE.gaps`). Depuis le 2026-09-19, l'onglet n'est plus
une filière : il est devenu l'espace **باكالوريات أجنبية** (clé `foreign`),
volontairement vide — aucune source non algérienne n'a été vérifiée.
