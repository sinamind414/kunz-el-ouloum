/* ============================================================
   Couche texte d'une page PDF, avec coordonnées
   ------------------------------------------------------------
   La couche texte des scans ministériels est souvent inversée ou
   bruitée ; mais les libellés de figures y sont parfois intacts et
   leur position (x, y) dit sans ambiguïté à quel élément dessiné ils
   correspondent. Cet outil imprime chaque fragment avec sa position,
   ce qui permet de reconstituer un schéma sans se fier à l'ordre de
   lecture du PDF.

   Deux usages :
     node scripts/dump-pdf-text.mjs <pdf> <page> [--raw]
       liste brute des fragments (x, y, texte) ;
     node scripts/dump-pdf-text.mjs <pdf> <page> --lines
       reconstruit les lignes en arabe (RTL) à partir de ces positions.

   Pourquoi `--lines` : certains scans composent une partie du texte avec
   une police non embarquée (« Arial ») que pdf.js ne sait pas substituer ;
   ces mots ne sont pas dessinés dans le rendu PNG mais restent présents
   dans la couche texte. Regrouper les fragments par ligne puis les trier
   de droite à gauche restitue la phrase, tandis que l'image donne le
   contexte. Les chiffres de cette couche restent peu fiables
   (« 8102 » pour 2018) : la pagination se lit toujours sur l'image.
   ============================================================ */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");

const file = process.argv[2];
const pageNumber = Number(process.argv[3] || 1);
const raw = process.argv.includes("--raw");
if (!file) {
  console.error("usage: node scripts/dump-pdf-text.mjs <pdf> <page> [--raw|--lines]");
  process.exit(2);
}

const doc = await pdfjs.getDocument({ data: new Uint8Array(readFileSync(file)) }).promise;
const page = await doc.getPage(pageNumber);
const content = await page.getTextContent();
console.log(`${file} — page ${pageNumber}/${doc.numPages} — ${content.items.length} fragments`);

if (process.argv.includes("--lines")) {
  // Regroupe par ligne (tolérance verticale) puis ordonne de droite à gauche.
  const fragments = content.items
    .filter((item) => typeof item.str === "string" && item.str.trim())
    .map((item) => {
      const [, , , , x, y] = item.transform;
      return {
        x,
        y,
        text: item.str.replace(/[\u0000-\u001f\u202a-\u202e]/g, "").trim()
      };
    })
    .filter((fragment) => fragment.text);

  const lines = [];
  for (const fragment of fragments.sort((a, b) => b.y - a.y)) {
    const line = lines.find((candidate) => Math.abs(candidate.y - fragment.y) <= 4);
    if (line) {
      line.parts.push(fragment);
    } else {
      lines.push({ y: fragment.y, parts: [fragment] });
    }
  }
  for (const line of lines) {
    const text = line.parts
      .sort((a, b) => b.x - a.x)
      .map((part) => part.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) console.log(`${line.y.toFixed(0).padStart(5)}  ${text}`);
  }
  process.exit(0);
}

for (const item of content.items) {
  if (typeof item.str !== "string" || !item.str.trim()) continue;
  const [a, , , d, x, y] = item.transform;
  if (raw) {
    console.log(`${x.toFixed(0)}\t${y.toFixed(0)}\t${item.str}`);
  } else {
    // Lecture : hauteur de ligne déduite de la matrice, texte débarrassé des
    // caractères de contrôle que les scans laissent dans la couche texte.
    const text = item.str.replace(/[\u0000-\u001f\u202a-\u202e]/g, "").trim();
    if (text)
      console.log(
        `x=${x.toFixed(0).padStart(5)} y=${y.toFixed(0).padStart(5)} h=${Math.abs(d).toFixed(0)}  ${text}`
      );
  }
}
process.exit(0);
