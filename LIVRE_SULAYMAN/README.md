# LIVRE_SULAYMAN — *Sulaymân, le Prophète-Roi*

Dossier de travail complet du livre : manuscrit, maquette et documents d'édition.

> **Ce que le Coran dit vraiment — et ce qu'on invente.**
> Collection « Les Prophètes, sources et légendes », tome 1.

---

## 1. Le livre

| | |
|---|---|
| **Titre** | Sulaymân, le Prophète-Roi |
| **Sous-titre** | Le Coran, la Sunna et les légendes |
| **Accroche** | Ce qui est révélé · ce qui est rapporté · ce qui est inventé |
| **Format** | 152,4 × 228,6 mm (6 × 9 in) |
| **Étendue** | 144 pages, environ 29 000 mots |
| **Structure** | 4 parties, 12 chapitres, 5 annexes |
| **Livrable** | [`maquette/LIVRE_Sulayman_v1.pdf`](maquette/LIVRE_Sulayman_v1.pdf) |
| **Prix visés** | Ebook 7,99 € · Papier 16 € |

Chaque affirmation du livre porte une étiquette : **Q** (verset coranique),
**S** (hadith authentifié), **R** (récit rapporté, non établi), **L** (légende,
sans base dans le Coran ni dans la Sunna authentique). Le livre ne tranche pas
les divergences d'exégèse : il les expose. Aucune représentation figurée.

---

## 2. Contenu du dossier

### Le manuscrit
| Fichier | Contenu |
|---|---|
| `PLAN_LIVRE_SULAYMAN.md` | Plan général : 17 livrables, 10 points critiques, cahier des charges. |
| `GRILLE_VERIFICATION_SOURCES.md` | Définition des quatre étiquettes, checklist des 45 versets, formulaire de vérification des hadiths. |
| `CHAPITRE_01_Pourquoi_ce_livre.md` | Pourquoi le sujet est saturé de légendes, et méthode du livre. |
| `CHAPITRE_02_Les_quatre_dons.md` | Les dons accordés à Sulaymân (2:102, 21:79, 27:15-16, 34:12). |
| `CHAPITRE_03_Le_jugement_et_les_deux_hommes.md` | Le jugement, Dâwûd et Sulaymân, 21:78-79. |
| `CHAPITRE_04_Les_armees_et_les_oiseaux.md` | Les armées, le langage des oiseaux, la fourmi (27:17-19). |
| `CHAPITRE_05_La_huppe_et_Saba.md` | La huppe, Saba, la lettre (27:20-28). |
| `CHAPITRE_06_La_lettre_et_le_conseil.md` | La consultation de la reine, le présent (27:29-35). |
| `CHAPITRE_07_Le_trone_et_le_savoir.md` | Le trône apporté, « science du Livre » (27:38-42). |
| `CHAPITRE_08_Le_palais_de_cristal.md` | Le palais de verre et la conversion (27:44). |
| `CHAPITRE_09_Les_jinn_le_mihrab_et_la_gratitude.md` | Les jinn, le mihrâb, la gratitude (34:12-13). |
| `CHAPITRE_10_Le_baton_et_la_mort.md` | Le bâton, le termite, la mort debout (34:14). |
| `CHAPITRE_11_La_magie_et_le_faux_proces.md` | 2:102 : *wa mā kafara Sulaymân*, le faux procès en magie. |
| `CHAPITRE_12_Les_legendes_une_par_une.md` | 14 légendes passées au crible. |
| `ANNEXES.md` | 5 annexes : tableau des versets, glossaire, bibliographie commentée, index des légendes, grille de lecture à détacher. |

### La maquette
| Fichier | Contenu |
|---|---|
| `maquette/LIVRE_Sulayman_v1.pdf` | **Le livre imprimable**, avec couverture, 4ᵉ de couverture, sommaire paginé et signets. |
| `maquette/build_pdf.py` | Moteur de composition (fpdf2) : composition en deux passes, styles de page, arabe vocalisé. |
| `maquette/README.md` | Spécifications typographiques et procédure de régénération. |
| `assets/fonts/` | EB Garamond, Source Sans 3, Amiri (SIL Open Font License, licence jointe). |

### L'édition et le marché
| Fichier | Contenu |
|---|---|
| `PAGE_DE_VENTE.md` | 4ᵉ de couverture, fiche produit longue, métadonnées, accroches réseaux. |
| `EXTRAIT_GRATUIT_7_CHOSES.md` | Extrait gratuit : les 7 choses que le Coran ne dit pas. |
| `ANALYSE_CONCURRENCE_MYISLAM.md` | Audit de la principale page concurrente en anglais et positionnement. |
| `AR/CHAPITRE_01_AR.md` | Version arabe du chapitre 1 (projet de tome séparé). |

---

## 3. Régénérer le PDF

```bash
pip install --break-system-packages fpdf2 uharfbuzz fonttools pymupdf
python3 LIVRE_SULAYMAN/maquette/build_pdf.py
```

Le script lit les chapitres et `ANNEXES.md` depuis ce dossier, compose une
première passe pour mesurer les numéros de page, une seconde pour les insérer
dans le sommaire, puis ajoute les signets et les métadonnées.

---

## 4. À compléter avant publication

- `[AUTEUR]` — page de titre, couverture, 4ᵉ de couverture, métadonnées PDF ;
- `[ÉDITION]` — page de titre et colophon ;
- `ISBN` — colophon et 4ᵉ de couverture ;
- `[année]` et `[nom, fonction, institution]` du relecteur — colophon ;
- version arabe complète, si le tome arabe est retenu ;
- vérification sur mushaf de la limite exacte du verset 34:14 (point laissé ouvert).
