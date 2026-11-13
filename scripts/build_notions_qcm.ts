// scripts/build_notions_qcm.ts
//
// GÉNÉRATEUR de `src/data/notionsQcm.ts` — la table des NOTIONS des 550 QCM.
//
// D'OÙ VIENT LA NOTION (rien n'est inventé)
// Chaque QCM du corpus porte un `diagramUrl` qui désigne la figure qu'il
// interroge (550/550). Le fichier SVG de cette figure porte son TITRE
// OFFICIEL en arabe dans son attribut `aria-label` (ex. schema_02_transcription
// → « النسخ - من ADN إلى ARNm »). La NOTION du QCM est donc le titre de la
// figure : un contenu déjà relu, déjà affiché à l'élève, déjà figé par un
// test de verrou sur les schémas.
//
// POURQUOI UN GÉNÉRATEUR
// 110 fichiers SVG portent ces titres ; les recopier à la main serait une
// source de dérive (le jour où un schéma est renommé, la table mentirait).
// Le générateur les lit tous et réécrit la table ; le verrou
// `src/data/notionsQcm.lock.test.ts` compare chaque entrée à l'`aria-label`
// du SVG et échoue si elles divergent.
//
// Sortie : src/data/notionsQcm.ts (GÉNÉRÉ — ne pas éditer à la main).
//
// Exécution : npx tsx scripts/build_notions_qcm.ts [--check]

import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CORPUS = [
  'src/quizCorpus/qcm0-d1a.ts',
  'src/quizCorpus/qcm1-d2a.ts',
  'src/quizCorpus/qcm2-d3.ts',
  'src/quizCorpus/qcm3-d1b.ts',
  'src/quizCorpus/qcm4-d2b.ts',
  'src/quizCorpus/qcm5-d1c.ts',
];
const SCHEMAS = 'public/assets/images/schemas';
const SORTIE = 'src/data/notionsQcm.ts';

/** Base du nom de schéma : « schema_02_transcription.svg » → « schema_02_transcription ». */
function cleSchemas(diagramUrl: string): string {
  return diagramUrl.split('/').pop()!.replace(/\.svg$/, '');
}

/** Titre arabe d'un schéma, lu dans son aria-label. */
function titreSchema(chemin: string): string | null {
  const svg = readFileSync(chemin, 'utf8');
  const m = svg.match(/aria-label="([^"]+)"/);
  if (!m) return null;
  return m[1].replace(/\s+/g, ' ').trim();
}

/**
 * NOTION courte : le titre de la figure avant son complément.
 * Séparateurs reconnus : « - », « — », « : » (ex. « ARNt : نقل الأحماض الأمينية »
 * → « ARNt » ; « النسخ - من ADN إلى ARNm » → « النسخ »).
 * Le complément est le sous-titre de la figure, pas la notion.
 */
function notionCourte(titre: string): string {
  const coupe = titre.split(/\s+[-–—]\s+|:\s+/)[0];
  const n = coupe.replace(/\s+/g, ' ').trim();
  return n.length >= 2 ? n : titre.replace(/\s+/g, ' ').trim();
}

function listerSchemas(dossier: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dossier, { withFileTypes: true })) {
    const p = resolve(dossier, e.name);
    if (e.isDirectory()) out.push(...listerSchemas(p));
    else if (e.name.endsWith('.svg')) out.push(p);
  }
  return out;
}

function main(): void {
  const checkOnly = process.argv.includes('--check');

  // 1) tous les diagramUrl du corpus
  const urls = new Set<string>();
  for (const f of CORPUS) {
    const c = readFileSync(resolve(ROOT, f), 'utf8');
    for (const m of c.matchAll(/"diagramUrl":\s*"([^"]+)"/g)) urls.add(m[1]);
  }
  if (urls.size === 0) throw new Error('aucun diagramUrl trouvé dans le corpus');

  // 2) titre arabe de chaque schéma référencé
  const tousSchemas = listerSchemas(resolve(ROOT, SCHEMAS));
  const parCle = new Map<string, { notion: string; titre: string; chemin: string }>();
  const sansTitre: string[] = [];
  for (const url of urls) {
    const cle = cleSchemas(url);
    if (parCle.has(cle)) continue;
    const chemin = tousSchemas.find((p) => p.replace(/\\/g, '/').endsWith('/' + cle + '.svg'));
    if (!chemin) {
      sansTitre.push(`${cle} (fichier introuvable)`);
      continue;
    }
    const titre = titreSchema(chemin);
    if (!titre) {
      sansTitre.push(`${cle} (pas d'aria-label)`);
      continue;
    }
    parCle.set(cle, { notion: notionCourte(titre), titre, chemin });
  }

  // 3) notions distinctes, par ordre alphabétique (table lisible et stable)
  const notions = [...new Set([...parCle.values()].map((v) => v.notion))].sort((a, b) =>
    a.localeCompare(b, 'ar'),
  );

  // 4) écriture
  const lignes: string[] = [];
  lignes.push('// src/data/notionsQcm.ts — GÉNÉRÉ, NE PAS ÉDITER À LA MAIN.');
  lignes.push('// Générateur : scripts/build_notions_qcm.ts (npx tsx scripts/build_notions_qcm.ts)');
  lignes.push('// Verrou : src/data/notionsQcm.lock.test.ts (compare chaque entrée à');
  lignes.push('// l\'aria-label du SVG — la table ne peut pas diverger des schémas).');
  lignes.push('//');
  lignes.push('// NOTION d\'un QCM = le TITRE ARABE de la figure qu\'il interroge');
  lignes.push('// (550/550 QCM ont une figure). Rien n\'est inventé : ce sont les');
  lignes.push('// libellés déjà relus et affichés à l\'élève dans les leçons.');
  lignes.push('//');
  lignes.push('// Usage : le label est estampé sur chaque question au moment de la');
  lignes.push('// composition du corpus (src/quizCorpus/index.ts), comme `difficulte`.');
  lignes.push('');
  lignes.push('/** Notion courte (avant le « - ») d\'un schéma, par nom de fichier. */');
  lignes.push('export const NOTION_PAR_SCHEMA: Record<string, string> = {');
  for (const [cle, v] of [...parCle.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lignes.push(`  ${JSON.stringify(cle)}: ${JSON.stringify(v.notion)},`);
  }
  lignes.push('};');
  lignes.push('');
  lignes.push('/** Toutes les notions distinctes du corpus (ordre stable). */');
  lignes.push('export const NOTIONS_QCM: string[] = [');
  for (const n of notions) lignes.push(`  ${JSON.stringify(n)},`);
  lignes.push('];');
  lignes.push('');
  lignes.push('/**');
  lignes.push(' * Notion d\'un QCM, déduite de sa figure. Renvoie \'\' si la figure est');
  lignes.push(' * inconnue (une QCM sans notion ne doit jamais casser le rendu).');
  lignes.push(' */');
  lignes.push('export function notionDeSchema(diagramUrl: string | undefined): string {');
  lignes.push('  if (!diagramUrl) return \'\';');
  lignes.push('  const cle = diagramUrl.split(\'/\').pop()!.replace(/\\.svg$/, \'\');');
  lignes.push('  return NOTION_PAR_SCHEMA[cle] ?? \'\';');
  lignes.push('}');
  lignes.push('');

  const contenu = lignes.join('\n');
  const cheminSortie = resolve(ROOT, SORTIE);
  let existant = '';
  try {
    existant = readFileSync(cheminSortie, 'utf8');
  } catch {
    existant = '';
  }
  if (checkOnly) {
    if (existant !== contenu) {
      console.error(`${SORTIE} obsolète — lancer : npx tsx scripts/build_notions_qcm.ts`);
      process.exit(1);
    }
    console.log(`${SORTIE} à jour (${parCle.size} schémas, ${notions.length} notions).`);
    return;
  }
  if (existant !== contenu) {
    writeFileSync(cheminSortie, contenu, 'utf8');
    console.log(`${SORTIE} écrit (${parCle.size} schémas, ${notions.length} notions).`);
  } else {
    console.log(`${SORTIE} inchangé.`);
  }
  if (sansTitre.length) {
    console.warn(`⚠ ${sansTitre.length} schéma(s) sans titre exploitable : ${sansTitre.slice(0, 5).join(', ')}`);
  }
  const taille = statSync(cheminSortie).size;
  console.log(`taille : ${(taille / 1024).toFixed(1)} Ko`);
}

main();
