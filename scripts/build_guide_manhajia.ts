/**
 * build_guide_manhajia.ts — GÉNÈRE `src/data/guideManhajia.ts` : le
 * « الدليل العام للمنهجية » (guide fusionné de méthodologie SVT BAC 3AS).
 *
 * Source unique : GUIDE_FUSION_SYNTHESE_METHODE_SVT_BAC_3AS.md (racine).
 * Le parser couvre exactement la syntaxe employée dans ce fichier :
 *   # / ## / ### / ####   → titre du document, sections, titres 2/3
 *   | a | b |  + |---|    → bloc `tableau` (entêtes + lignes)
 *   - texte / N. texte    → `puce` / `point`
 *   - [ ] texte           → `puce` préfixée d'une case ☐
 *   N. [ ] texte          → `point` préfixée d'une case ☐
 *   > citation            → `note` (encadré conseil)
 *   paragraphe            → `texte`
 *   --- / ligne vide      → séparateurs (ignorés)
 * Les entrées de la table des matières deviennent des entrées cliquables
 * (`cible` = id de section) : soit par lien Markdown `[x](#y)`, soit par appariement
 * du libellé au titre d'une section réellement présente (guide arabe sans liens).
 *
 * Usage : npx tsx scripts/build_guide_manhajia.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
export const CHEMIN_SOURCE = 'GUIDE_FUSION_SYNTHESE_METHODE_SVT_BAC_3AS.md';
export const CHEMIN_SORTIE = 'src/data/guideManhajia.ts';

export type KindGuide = 'titre' | 'point' | 'puce' | 'note' | 'texte' | 'tableau';

export interface BlocGuide {
  kind: KindGuide;
  /** Numéro d'une liste ordonnée (`point`). */
  num?: string;
  texte: string;
  /** Profondeur d'un titre : 2 = `###`, 3 = `####`. */
  niveau?: number;
  /** Bloc `tableau`. */
  entetes?: string[];
  lignes?: string[][];
  /** Ancre cliquable (table des matières) → id de section. */
  cible?: string;
}

export interface SousGuide {
  id: string;
  titre: string;
  /** Index du premier bloc (inclus) dans section.blocs. */
  from: number;
}

export interface SectionGuide {
  id: string;
  titre: string;
  icone: string;
  blocs: BlocGuide[];
  sous?: SousGuide[];
}

/** Icônes de sommaire — clés licites (ICONES_AUTORISEES, lessonIcons.ts). */
const ICONES: Record<string, string> = {
  sommaire: 'Grid3x3',
  s1: 'Lightbulb',
  s2: 'Target',
  s3: 'Compass',
  s4: 'FileText',
  s5: 'Gauge',
  s6: 'Boxes',
  s7: 'ShieldCheck',
  s8: 'Activity',
  s9: 'Brain',
  annexe: 'Microscope',
};

/* ── Nettoyage en ligne ─────────────────────────────────────────────────── */

/** Retire le gras/le code inline, aplatit les liens Markdown, normalise les espaces. */
function inline(s: string): string {
  let out = s.replace(/\*\*/g, '').replace(/`/g, '');
  out = out.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  if (out.length > 1 && out.startsWith('_') && out.endsWith('_')) out = out.slice(1, -1);
  return out.replace(/\s+/g, ' ').trim();
}

/** Cellules d'une ligne de tableau, nettoyées. */
function cells(ligne: string): string[] {
  const brut = ligne.trim().replace(/^\|/, '').replace(/\|$/, '');
  return brut.split('|').map((c) => inline(c));
}

const estSeparateurTable = (cellsLigne: string[]): boolean =>
  cellsLigne.length > 0 && cellsLigne.every((c) => c === '' || /^:?-{2,}:?$/.test(c));

/** Id de section : numéro du titre, sinon ancres connues, sinon slug ASCII. */
function idSection(titre: string): string {
  const num = /^(\d+)\./.exec(titre);
  if (num) return `s${num[1]}`;
  if (/^(TABLE DES MATI|فهرس)/i.test(titre)) return 'sommaire';
  if (/^(ANNEXE|ملحق)/i.test(titre)) return 'annexe';
  const slug = titre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  return slug || `section-${titre.length}`;
}

/** Destination d'un lien de table des matières : la section mère (`3.1` → `s3`). */
function cibleLien(libelle: string): string | undefined {
  const num = /^(\d+)\./.exec(libelle);
  return num ? `s${num[1]}` : undefined;
}

/** Libellé ramené à sa forme comparable : sans numérotation, espaces normalisés. */
const libelleCle = (t: string): string =>
  t.replace(/^\d+\.\s*/, '').replace(/\s+/g, ' ').trim();

/**
 * Ancre le sommaire sans lien Markdown explicite : chaque entrée est appariée à
 * la section dont le titre est identique (hors numéro). Ne crée donc aucune
 * destination — uniquement un lien vers un contenu réellement présent.
 */
function ancrerSommaire(sections: SectionGuide[]): void {
  const sommaire = sections.find((s) => s.id === 'sommaire');
  if (!sommaire) return;
  const parTitre = new Map<string, string>();
  for (const s of sections) {
    if (s.id === 'sommaire') continue;
    parTitre.set(libelleCle(s.titre), s.id);
  }
  for (const b of sommaire.blocs) {
    if (b.cible) continue;
    const cible = parTitre.get(libelleCle(b.texte));
    if (cible) b.cible = cible;
  }
}

/* ── Parser ─────────────────────────────────────────────────────────────── */

function parseGuide(md: string): { titre: string; sections: SectionGuide[] } {
  const lignes = md.split(/\r?\n/);
  const sections: SectionGuide[] = [];
  const preamble: BlocGuide[] = [];
  let titre = '';
  let cur: SectionGuide | null = null;
  let para: string[] = [];
  let sousCpt = 0;

  const flushPara = () => {
    if (!para.length) return;
    const texte = inline(para.join(' '));
    para = [];
    if (!texte) return;
    const cible = cur && cur.id === 'sommaire' ? cibleLien(texte) : undefined;
    const bloc: BlocGuide = { kind: 'texte', texte };
    if (cible) bloc.cible = cible;
    (cur ?? { blocs: preamble }).blocs.push(bloc);
  };

  let i = 0;
  while (i < lignes.length) {
    const t = lignes[i].trim();

    if (t === '') { flushPara(); i += 1; continue; }
    if (t === '---') { flushPara(); i += 1; continue; }

    if (t.startsWith('# ')) { titre = inline(t.slice(2)); i += 1; continue; }

    if (t.startsWith('## ')) {
      flushPara();
      const libelle = inline(t.slice(3));
      const id = idSection(libelle);
      cur = { id, titre: libelle, icone: ICONES[id] ?? 'FileText', blocs: [] };
      if (!sections.length && preamble.length) cur.blocs.push(...preamble.splice(0));
      sections.push(cur);
      sousCpt = 0;
      i += 1;
      continue;
    }

    if (!cur) { i += 1; continue; }

    if (t.startsWith('#### ')) {
      flushPara();
      cur.blocs.push({ kind: 'titre', niveau: 3, texte: inline(t.slice(5)) });
      i += 1; continue;
    }
    if (t.startsWith('### ')) {
      flushPara();
      const texte = inline(t.slice(4));
      cur.sous ??= [];
      cur.sous.push({ id: `${cur.id}-h${sousCpt}`, titre: texte, from: cur.blocs.length });
      sousCpt += 1;
      cur.blocs.push({ kind: 'titre', niveau: 2, texte });
      i += 1; continue;
    }

    // Tableau : lignes consécutives commençant par « | ».
    if (t.startsWith('|')) {
      flushPara();
      const rows: string[][] = [];
      while (i < lignes.length && lignes[i].trim().startsWith('|')) {
        rows.push(cells(lignes[i]));
        i += 1;
      }
      const entetes = rows[0] ?? [];
      const corps = (estSeparateurTable(rows[1] ?? []) ? rows.slice(2) : rows.slice(1))
        .filter((r) => !estSeparateurTable(r));
      const texte = [entetes, ...corps].flat().filter(Boolean).join(' · ');
      const bloc: BlocGuide = { kind: 'tableau', texte, entetes, lignes: corps };
      cur.blocs.push(bloc);
      continue;
    }

    // Citation.
    if (t.startsWith('>')) {
      flushPara();
      const texte = inline(t.slice(1));
      if (texte) cur.blocs.push({ kind: 'note', texte });
      i += 1; continue;
    }

    // Liste ordonnée / non ordonnée, éventuellement à cocher.
    const estListe = t.startsWith('- ') || /^\d+\.\s/.test(t);
    if (estListe) {
      flushPara();
      let rest = t;
      let num: string | undefined;
      if (rest.startsWith('- ')) {
        rest = rest.slice(2);
      } else {
        const m = /^(\d+)\.\s+/.exec(rest)!;
        num = m[1];
        rest = rest.slice(m[0].length);
      }
      let cochee = false;
      if (rest.startsWith('[ ] ') || rest.startsWith('[x] ') || rest.startsWith('[X] ')) {
        cochee = true;
        rest = rest.slice(4);
      }
      const libelle = inline(rest);
      if (!libelle) { i += 1; continue; }
      const prefixe = cochee ? '☐ ' : '';
      const lien = /\[([^\]]+)\]\([^)]*\)/.exec(rest);
      const cible = lien
        ? cibleLien(lien[1]) ?? (num ? `s${num}` : undefined)
        : undefined;
      const bloc: BlocGuide = num
        ? { kind: 'point', num, texte: prefixe + libelle }
        : { kind: 'puce', texte: prefixe + libelle };
      if (cible) bloc.cible = cible;
      cur.blocs.push(bloc);
      i += 1; continue;
    }

    // Paragraphe.
    para.push(t);
    i += 1;
  }
  flushPara();

  return { titre, sections };
}

/* ── Génération ─────────────────────────────────────────────────────────── */

function generer(): string {
  const md = readFileSync(join(racine, CHEMIN_SOURCE), 'utf8');
  const { titre, sections } = parseGuide(md);
  ancrerSommaire(sections);
  const blocs = sections.reduce((n, s) => n + s.blocs.length, 0);
  const tableaux = sections.reduce(
    (n, s) => n + s.blocs.filter((b) => b.kind === 'tableau').length, 0,
  );
  const entrees = sections.reduce(
    (n, s) => n + s.blocs.filter((b) => b.kind === 'point' || b.kind === 'puce').length, 0,
  );

  const enTete = `// guideManhajia.ts — GÉNÉRÉ par scripts/build_guide_manhajia.ts — NE PAS ÉDITER À LA MAIN.
// الدليل العام للمنهجية : guide fusionné de méthodologie SVT BAC 3AS.
// Source : ${CHEMIN_SOURCE} (racine du dépôt) — parser couvrant titres, listes,
// cases à cocher, citations et tableaux Markdown.
// Verrou : src/data/guideManhajia.lock.test.ts.

import type { IconeCle } from './lessonIcons';

export type KindGuide = 'titre' | 'point' | 'puce' | 'note' | 'texte' | 'tableau';

export interface BlocGuide {
  kind: KindGuide;
  /** Numéro d'une liste ordonnée (bloc « point »). */
  num?: string;
  texte: string;
  /** Profondeur d'un titre : 2 = « ### », 3 = « #### ». */
  niveau?: number;
  /** Bloc « tableau ». */
  entetes?: string[];
  lignes?: string[][];
  /** Ancre cliquable (table des matières) → id de section. */
  cible?: string;
}

export interface SousGuide {
  id: string;
  titre: string;
  /** Index du premier bloc (inclus) dans section.blocs. */
  from: number;
}

export interface SectionGuide {
  id: string;
  titre: string;
  icone: IconeCle;
  blocs: BlocGuide[];
  sous?: SousGuide[];
}

/** Titre du document (# de la source). */
export const GUIDE_TITRE = ${JSON.stringify(titre)};

export const GUIDE_SECTIONS: SectionGuide[] = ${JSON.stringify(sections, null, 2)};

export const GUIDE_STATS = {
  sections: ${sections.length},
  blocs: ${blocs},
  tableaux: ${tableaux},
  entrees: ${entrees},
};
`;

  writeFileSync(join(racine, CHEMIN_SORTIE), enTete, 'utf8');
  return `${CHEMIN_SORTIE} : ${sections.length} sections · ${blocs} blocs · ${tableaux} tableaux · ${entrees} entrées`;
}

console.log(generer());
