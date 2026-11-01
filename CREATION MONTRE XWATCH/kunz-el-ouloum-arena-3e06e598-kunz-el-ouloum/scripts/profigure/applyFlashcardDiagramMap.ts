// scripts/profigure/applyFlashcardDiagramMap.ts — Phase 5 : appariement ciblé des
// flashcards sur les figures ProFigure DÉDIÉES (celles que le corpus n'utilisait pas).
//
// Principe non négociable (AGENTS.md) : aucun contenu inventé. Chaque entrée associe
// un CONCEPT réel du corpus (chaîne entre «» de questionText, telle qu'elle existe
// dans les données) à une figure dont c'est le sujet explicite, contrôlé par aria-label.
// Toute entrée non résolue est signalée, jamais devinée.
//
// Usage :
//   npx tsx scripts/profigure/applyFlashcardDiagramMap.ts           → dry-run (rapport)
//   npx tsx scripts/profigure/applyFlashcardDiagramMap.ts --apply   → écrit
//   npx tsx scripts/profigure/applyFlashcardDiagramMap.ts --check   → exit 1 si non appliqué

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { SVT_FLASHCARDS } from '../../src/data/index';

const RACINE = process.cwd();
const PREFIXE = '/assets/images/schemas/';

/** concept exact du corpus → figure dédiée (sujet de la figure = son aria-label). */
const MAP: { concept: string; figure: string }[] = [
  // Neurosciences : les cartes des PROPRIÉTÉS du potentiel d'action étaient posées sur
  // schema_08_synapse (synapse neuro-musculaire), qui nomme déjà Ca²⁺, vésicules, AChR,
  // AChE, PPSE → ces cartes-là restent dessus (aucun gain à les déplacer : régression).
  // Seules les cartes du potentiel d'action vont sur la figure du potentiel d'action.
  { concept: 'كمون العمل', figure: 'domaine1_regulations/schema_83_potentiel_action_modern_ar.svg' },
  { concept: 'عتبة التنبيه', figure: 'domaine1_regulations/schema_83_potentiel_action_modern_ar.svg' },
  { concept: 'الكل أو لا شيء', figure: 'domaine1_regulations/schema_83_potentiel_action_modern_ar.svg' },
  { concept: 'زوال الاستقطاب', figure: 'domaine1_regulations/schema_83_potentiel_action_modern_ar.svg' },
  { concept: 'إعادة الاستقطاب', figure: 'domaine1_regulations/schema_83_potentiel_action_modern_ar.svg' },
  { concept: 'فرط الاستقطاب', figure: 'domaine1_regulations/schema_83_potentiel_action_modern_ar.svg' },
  { concept: 'فترة الجموح', figure: 'domaine1_regulations/schema_83_potentiel_action_modern_ar.svg' },
  // Expression génétique : cartes posées sur la figure générique « structure des protéines »
  { concept: 'نضج ARNm', figure: 'domaine1_proteines/schema_20_splicing_exons_introns_modern.svg' },
  { concept: 'الإكسون', figure: 'domaine1_proteines/schema_20_splicing_exons_introns_modern.svg' },
  { concept: 'الإنترون', figure: 'domaine1_proteines/schema_20_splicing_exons_introns_modern.svg' },
  { concept: 'البولي ريبوزوم', figure: 'domaine1_proteines/schema_24_polysome_translation_modern.svg' },
  { concept: 'الشفرة الوراثية', figure: 'domaine1_proteines/schema_23_genetic_code_table_modern.svg' },
  { concept: 'الشفرة المترادفة', figure: 'domaine1_proteines/schema_23_genetic_code_table_modern.svg' },
  { concept: 'جهاز غولجي', figure: 'domaine1_proteines/schema_24_secretory_pathway_pancreas_modern_ar.svg' },
  { concept: 'الشبكة الإندوبلازمية الخشنة', figure: 'domaine1_proteines/schema_24_secretory_pathway_pancreas_modern_ar.svg' },
  // Immunologie : les 3 cartes trônaient sur « 4 niveaux de structure des protéines »
  // → figure dédiée à la structure du site de fixation (Fab/Fc + محدد مستضدي).
  { concept: 'الجسم المضاد', figure: 'domaine1_proteines/schema_65_antibody_structure_hl_modern.svg' },
  { concept: 'الباراتوب', figure: 'domaine1_proteines/schema_65_antibody_structure_hl_modern.svg' },
  { concept: 'الحاتمة', figure: 'domaine1_proteines/schema_65_antibody_structure_hl_modern.svg' },
  { concept: 'الذاكرة المناعية', figure: 'domaine1_proteines/schema_76_memory_cell_fate_modern.svg' },
  { concept: 'الذاكرة T', figure: 'domaine1_proteines/schema_76_memory_cell_fate_modern.svg' },
  // Enzymologie : 45 cartes sur l'unique figure d'enzyme générique
  { concept: 'المثبط التنافسي', figure: 'domaine1_enzymes/schema_87_enzyme_inhibition_curves_ar.svg' },
  { concept: 'المثبط غير التنافسي', figure: 'domaine1_enzymes/schema_87_enzyme_inhibition_curves_ar.svg' },
  { concept: 'Km', figure: 'domaine1_enzymes/schema_87_enzyme_inhibition_curves_ar.svg' },
  { concept: 'Vmax', figure: 'domaine1_enzymes/schema_87_enzyme_inhibition_curves_ar.svg' },
  { concept: 'الإشباع الإنزيمي', figure: 'domaine1_enzymes/schema_87_enzyme_inhibition_curves_ar.svg' },
  { concept: 'منحنى pH', figure: 'domaine1_enzymes/schema_88_enzyme_six_curves_workshop_ar.svg' },
  // Énergétique
  { concept: 'شدة الإضاءة', figure: 'domaine2_energie/schema_86_photosynthese_intensite_lumiere_modern_ar.svg' },
  { concept: 'التحلل الضوئي للماء', figure: 'domaine2_energie/schema_89_hill_ruben_experiment_modern_ar.svg' },
  { concept: 'O2 المطروح', figure: 'domaine2_energie/schema_89_hill_ruben_experiment_modern_ar.svg' },
  { concept: 'حلقة كالفن', figure: 'domaine2_energie/schema_91_calvin_2d_chromatography_modern_ar.svg' },
  { concept: 'الكيميواسموز', figure: 'domaine2_energie/schema_92_racker_bacteriorhodopsin_modern_ar.svg' },
  // Géologie
  { concept: 'مستوى واداتي-بينيوف', figure: 'domaine3_tectonique/schema_93_benioff_plan_modern_ar.svg' },
  { concept: 'التصادم القاري', figure: 'domaine3_tectonique/schema_88_collision_continentale_modern_ar.svg' },
  { concept: 'تثخن القشرة', figure: 'domaine3_tectonique/schema_94_migmatite_crustal_thickening_modern_ar.svg' },
];

// Source unique : la carte flashcard dérive de la question QCM (id `fc_q_<idQ>`,
// diagramUrl hérité). Re-pointer la question suffit → carte + QCM restent cohérents.
const FICHIERS = ['src/quizCorpus.ts'];
const MODE = process.argv.includes('--apply')
  ? 'apply'
  : process.argv.includes('--check')
    ? 'check'
    : process.argv.includes('--export')
      ? 'export'
      : 'dry';

/** --export : fige la table dans scripts/profigure/flashcardDiagramMap.json (lu par le test). */
if (MODE === 'export') {
  const json = {
    genere_par: 'scripts/profigure/applyFlashcardDiagramMap.ts --export',
    phase: 'Phase 5 — cartes re-pointées sur les figures ProFigure dédiées (jamais utilisées avant)',
    methode:
      "Concept = chaîne réelle entre «» dans questionText (jamais inventée). Figure retenue seulement si son aria-label / ses libellés SVG nomment le concept, ou si le concept est le phénomène même que la figure représente (potentiel d'action, inhibition enzymatique). Aucune carte n'a été déplacée depuis une figure déjà spécifique (schema_08_synapse nomme Ca²⁺, vésicules, AChR, AChE, PPSE ; schema_07_enzyme le site actif) : ce serait une régression.",
    prefixe: '/assets/images/schemas/',
    entries: MAP,
  };
  writeFileSync(
    resolve(RACINE, 'scripts/profigure/flashcardDiagramMap.json'),
    JSON.stringify(json, null, 2) + '\n',
    'utf8',
  );
  console.log('exporté : scripts/profigure/flashcardDiagramMap.json (' + MAP.length + ' entrées)');
  process.exit(0);
}
const RE_DIAGRAM = /(diagramUrl["']?\s*:\s*)(["'])([^"']*)(["'])/;
const RE_ID = /(?:^|[{,\s])["']?id["']?\s*:\s*(?:"([^"]+)"|'([^']*)'|(\d+))/;

type LigneEntree = { fichier: string; ligne: number; id: string; url: string };

/** Concepts réels du corpus (entre «») → id de questions QCM porteuses. */
const conceptVersCartes = new Map<string, string[]>();
for (const carte of SVT_FLASHCARDS) {
  const concept = carte.question.match(/«([^»]+)»/)?.[1];
  const idQuestion = /^fc_q_(\d+)$/.exec(String(carte.id))?.[1];
  if (!concept || !idQuestion) continue;
  if (!conceptVersCartes.has(concept)) conceptVersCartes.set(concept, []);
  conceptVersCartes.get(concept)!.push(idQuestion);
}

/** Toutes les lignes diagramUrl des fichiers data, avec l'id courant. */
function entrees(): LigneEntree[] {
  const out: LigneEntree[] = [];
  for (const f of FICHIERS) {
    const abs = resolve(RACINE, f);
    if (!existsSync(abs)) continue;
    let courant = '';
    readFileSync(abs, 'utf8')
      .split(/\r?\n/)
      .forEach((txt, i) => {
        const id = txt.match(RE_ID);
        if (id) courant = id[1] ?? id[2] ?? id[3] ?? courant;
        const url = txt.match(RE_DIAGRAM)?.[3];
        if (url) out.push({ fichier: f, ligne: i + 1, id: courant, url });
      });
  }
  return out;
}

function ariaLabel(abs: string): string {
  const racine = readFileSync(abs, 'utf8').match(/<svg\b[^>]*>/)?.[0] ?? '';
  return (racine.match(/aria-label="([^"]+)"/)?.[1] ?? '(aucun)').trim();
}

const toutes = entrees();
const rapport: string[] = [];
const ecritures: LigneEntree[] = [];
const cibles = new Map<string, string>();
let orphelins = 0;
let dejaConformes = 0;

for (const { concept, figure } of MAP) {
  const abs = resolve(RACINE, 'public', PREFIXE.replace(/^\//, ''), figure.replace(/\//g, '/'));
  const url = PREFIXE + figure;
  cibles.set(figure, ariaLabel(abs));
  rapport.push(`• «${concept}» → ${figure}`);
  rapport.push(`    aria-label figure : ${ariaLabel(abs)}`);
  const ids = conceptVersCartes.get(concept) ?? [];
  if (!ids.length) {
    rapport.push('    ✗ concept introuvable dans les données (non résolu)');
    orphelins++;
    continue;
  }
  rapport.push(`    cartes : ${ids.join(', ')}`);
  for (const id of ids) {
    const l = toutes.find((e) => e.id === id && e.url.startsWith('/assets/'));
    if (!l) {
      rapport.push(`    ✗ ligne diagramUrl introuvable pour ${id}`);
      orphelins++;
      continue;
    }
    if (l.url === url) {
      dejaConformes++;
      rapport.push(`    = ${id} déjà conforme`);
      continue;
    }
    ecritures.push({ ...l, url });
    rapport.push(`    → ${id} (${l.fichier}:${l.ligne}) ${l.url.replace(PREFIXE, '')} ⇒ ${figure}`);
  }
  rapport.push('');
}

rapport.push(`Figures dédiées ciblées : ${cibles.size} | réécritures : ${ecritures.length}`);
rapport.push(`Déjà conformes : ${dejaConformes} | entrées non résolues : ${orphelins}`);
writeFileSync(resolve(RACINE, 'tmp_p5_plan.txt'), rapport.join('\n') + '\n', 'utf8');
console.log(`mode=${MODE} figures=${cibles.size} réécritures=${ecritures.length} conformes=${dejaConformes} nonRésolues=${orphelins}`);
console.log('rapport → tmp_p5_plan.txt');

if (MODE === 'check') process.exit(ecritures.length === 0 && orphelins === 0 ? 0 : 1);

if (MODE === 'apply') {
  const parFichier = new Map<string, LigneEntree[]>();
  for (const e of ecritures) {
    if (!parFichier.has(e.fichier)) parFichier.set(e.fichier, []);
    parFichier.get(e.fichier)!.push(e);
  }
  for (const [f, edits] of parFichier) {
    const abs = resolve(RACINE, f);
    const lignes = readFileSync(abs, 'utf8').split(/\r?\n/);
    for (const e of edits) {
      const t = lignes[e.ligne - 1];
      if (!RE_DIAGRAM.test(t)) throw new Error(`ligne inattendue ${f}:${e.ligne}`);
      lignes[e.ligne - 1] = t.replace(RE_DIAGRAM, (_m, p1, q2, _url, q4) => `${p1}${q2}${e.url}${q4}`);
    }
    writeFileSync(abs, lignes.join('\n'), 'utf8');
    console.log(`écrit ${f} : ${edits.length} diagramUrl`);
  }
}

