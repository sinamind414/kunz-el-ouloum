# Maquette — *Sulaymân, le Prophète-Roi*

Moteur de composition du livre au format poche 6 × 9 in, et PDF prêt à imprimer.

## Fichier livrable

| Fichier | Contenu |
|---|---|
| `LIVRE_Sulayman_v1.pdf` | Le livre complet, 144 pages, avec couverture, 4ᵉ de couverture, sommaire paginé et signets. |

Format 152,4 × 228,6 mm. Toutes les polices sont embarquées. Aucune image,
aucune représentation figurée : les ornements (filets, losanges, pastilles)
sont dessinés vectoriellement.

## Régénérer

```bash
python3 maquette/build_pdf.py
```

Dépendances : `fpdf2>=2.9`, `uharfbuzz`, `fonttools` (rendu arabe), `pymupdf`
(seulement pour les signets PDF et les épreuves). Installation :

```bash
pip install --break-system-packages fpdf2 uharfbuzz fonttools pymupdf
```

Le script lit les sources Markdown du dossier parent (`CHAPITRE_01…12_*.md`,
`ANNEXES.md`), compose **deux passes** (la première mesure les numéros de page,
la seconde les insère dans le sommaire), écrit le PDF, puis y ajoute les
signets et les métadonnées.

## Ordre de composition

Couverture · faux-titre · page de titre · mode de lecture (les quatre
étiquettes) · colophon · sommaire · Partie I *Le cadre* (ch. 1–3) · Partie II
*Le royaume* (ch. 4–7) · Partie III *La chute et la mort* (ch. 8–10) ·
Partie IV *Le tri* (ch. 11–12) · Annexes 1–5 · page finale · 4ᵉ de couverture.

## Conventions typographiques

- Corps : EB Garamond 10,6 pt, interligne 6,15 mm, justifié.
- Titres courants en Source Sans 3, 6,9 pt, interlettrage 0,28 mm ; **recto =
  titre du chapitre, verso = titre de la partie**.
- Chaque chapitre, partie et annexe ouvre en **recto** ; le verso laissé vide
  ne porte ni titre courant ni folio.
- Marges en miroir : intérieure 19 mm, extérieure 16 mm.
- Étiquettes 🟢 Q / 🟢 S / 🟡 R / 🔴 L rendues par une pastille de couleur et une
  ligne de référence, jamais par un emoji (les polices n'en contiennent pas et
  l'emoji est interdit à l'impression).
- Arabe vocalisé composé en Amiri avec `set_text_shaping(True)` et repli de
  police ; jamais mélangé à du français dans un même `multi_cell`.

## À compléter avant publication

Les zones entre crochets du PDF sont des emplacements à remplir :

- `[AUTEUR]` — page de titre, couverture, 4ᵉ de couverture, métadonnées ;
- `[ÉDITION]` — page de titre et colophon ;
- `ISBN` — colophon et 4ᵉ de couverture ;
- `[année]`, `[nom, fonction, institution]` du relecteur — colophon.

## Polices et licences

EB Garamond, Amiri et Source Sans 3 sont sous SIL Open Font License 1.1 ;
les textes de licence accompagnent les fichiers dans `assets/fonts/`
(`OFL-*.txt`). Les TTF de `assets/fonts/` sont des fusions des sous-ensembles
`latin` + `latin-ext` de Fontsource : le sous-ensemble `latin` seul ne contient
pas les diacritiques savants (ā ī ū ṣ ḥ ẓ) employés dans tout le livre.
