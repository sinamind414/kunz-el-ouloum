// bookIndex.ts — CONSOMMATEUR de data/bookContent.index.json (voir
// scripts/build_chapter_index.ts + src/data/bookIndex.lock.test.ts).
// Deux services :
//   1) sourceLivre(titreLecon)  : leçon (titre affiché) → chapitres du livre
//      officiel + plage de lignes OCR. Appariement AUTOMATIQUE (égalité exacte,
//      composition contiguë, contenance, recouvrement de jetons) + 3 ancres
//      DOCUMENTÉES (raison explicite, jamais de ligne placée à la main : les
//      plages viennent toujours de l'index). Retourne null quand il n'y a
//      AUCUNE preuve — une leçon expérimentale ou de synthèse sans chapitre
//      TDM dédié n'est jamais « rattachée » artificiellement.
//   2) chapitresDeUnite(uniteId) : uniteId 1-11 (correcteurV1, séquence
//      officielle) → chapitres de l'index. ATTENTION : l'index stocke les
//      unités en (domain, unité LOCALE au domaine) — D2 = unités 1-3, D3 =
//      unités 1-3 — alors que uniteId est global (1-11). D'où la conversion.

import indexJson from '../../data/bookContent.index.json';

export interface ChapitreIndex {
  domain: number;
  unit: number;
  chapter: number;
  titreAr: string;
  ligneDebut: number;
  ligneFin: number;
  mode: string;
  evidence: string;
  tiges?: string[];
  ambigu?: boolean;
}

export interface BookIndex {
  schema_version: string;
  source: { fichier: string; octets: number; sha256: string; lignes_ocr: number };
  methode: string;
  tdm_du_livre: { fin: number };
  stats: Record<string, number>;
  preamble: { debut: number; fin: number };
  chapitres: ChapitreIndex[];
}

export const INDEX = indexJson as BookIndex;
export const CHAPITRES: ChapitreIndex[] = INDEX.chapitres;

/** Chapitre par numéro global 1..55 (position aplatie, PAS le n par unité). */
export function chapitreGlobal(n: number): ChapitreIndex {
  const c = CHAPITRES[n - 1];
  if (!c || c.chapter !== n) throw new Error(`chapitre global ${n} absent de l'index`);
  return c;
}

/** uniteId global 1-11 → clé (domain:unitéLocale) telle que stockée dans l'index. */
export function cleUnite(uniteId: number): string {
  if (uniteId <= 5) return `1:${uniteId}`;
  if (uniteId <= 8) return `2:${uniteId - 5}`;
  return `3:${uniteId - 8}`;
}

/** Chapitres du livre d'une unité (uniteId global 1-11, ordre de la grille). */
export function chapitresDeUnite(uniteId: number): ChapitreIndex[] {
  const cle = cleUnite(uniteId);
  return CHAPITRES.filter((c) => `${c.domain}:${c.unit}` === cle);
}

// ── normalisation (recette verrouillée : bookIndex.lock.test.ts) ─────────────
export function norm(s: string): string {
  return s
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[إأآٱا]/g, 'ا')
    .replace(/ء/g, '')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\u0600-\u06FF a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Nettoie un titre de leçon : préfixes « الفصل/الدرس N : », parenthèses, séparateurs. */
function nettoieTitre(t: string): string {
  return norm(
    t
      .replace(/\s*\([^)]*\)\s*/g, ' ')
      .replace(/(الفصل|الدرس)\s*[0-9٠-٩]+\s*[:：]/g, ' ')
      .replace(/[—–\-●▪/•]/g, ' ')
      .replace(/⚠️|💡|🎯|📖|🔍|🧬|🌍|⚡/gu, ' ')
  );
}

const TITRES_NORM = CHAPITRES.map((c) => norm(c.titreAr));

function jetons(s: string): Set<string> {
  return new Set(s.split(' ').filter((x) => x.length >= 3));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

export type ModeSource = 'auto-exact' | 'auto-compose' | 'auto-contenance' | 'auto-jetons' | 'ancre-documentee';

export interface SourceLivre {
  chapitres: ChapitreIndex[];
  mode: ModeSource;
}

/**
 * Ancres DOCUMENTÉES : leçons du programme sans titre OCR appariable, rattachées
 * par CONTENU (raison explicite). Les plages de lignes restent celles de l'index —
 * aucune ligne n'est fixée ici. Toute entrée est verrouillée par
 * src/data/bookIndex.lock.test.ts.
 */
const ANCRES_LECON: Record<string, { chapitres: number[]; raison: string }> = {
  // Leçon « الشفرة الوراثية وتنشيط الأحماض الأمينية » : contenu enseigné par les
  // chapitres الترجمة (C4) et مراحل الترجمة (C5) — aucune en-tête OCR dédiée.
  phase1_chapitres_1_2_2: {
    chapitres: [4, 5],
    raison: 'contenu = الترجمة (C4) + مراحل الترجمة (C5) : شفرة وراثية وتنشيط أحماض أمينية y sont enseignés',
  },
  // Leçon « آلية انتقال الإلكترونات والفسفرة الضوئية » : c'est la phase lumineuse
  // = C33 (المرحلة الكيموضوئية) — la leçon reformule, le titre OCR ne se recoupe pas.
  phase11_chapitres_21_22_2: {
    chapitres: [33],
    raison: 'contenu = la phase lumineuse : تفاعلات المرحلة الكيموضوئية (C33), كالفن présent dans l OCR (C33-C34)',
  },
  // Leçon « تفاعلات المرحلة الكيميوحيوية (حلقة كالفن) » : variante lexicale
  // (كيميوحيوية vs كيموحيوية C34) + كالفن prouvé dans l OCR du chapitre.
  phase12_chapitres_23_24: {
    chapitres: [34],
    raison: 'variante lexicale كيميوحيوية/كيموحيوية ; حلقة كالفن prouvée dans l OCR de C34',
  },
};

/**
 * Leçon → chapitres du livre officiel. `cleLecon` sert uniquement aux ancres
 * documentées ; l'appariement automatique utilise le titre affiché.
 * Retourne null sans preuve (jamais de rattachement artificiel).
 */
export function sourceLivre(cleLecon: string, titreAffiche: string): SourceLivre | null {
  const ancre = ANCRES_LECON[cleLecon];
  if (ancre) {
    return {
      mode: 'ancre-documentee',
      chapitres: ancre.chapitres.map(chapitreGlobal),
    };
  }
  const t = nettoieTitre(titreAffiche);
  if (t.length < 4) return null;

  // 1) égalité exacte (unique)
  const exacts = TITRES_NORM.map((n, i) => ({ n, i })).filter((x) => x.n === t);
  if (exacts.length === 1) return { mode: 'auto-exact', chapitres: [CHAPITRES[exacts[0].i]] };
  if (exacts.length > 1) return null; // ambigu — refusé

  // 2) composition contiguë : leçon = chapitre i … chapitre j (début/fin)
  for (let i = 0; i < CHAPITRES.length; i++) {
    for (let w = 2; w <= 3 && i + w - 1 < CHAPITRES.length; w++) {
      const j = i + w - 1;
      if (t.startsWith(TITRES_NORM[i]) && t.endsWith(TITRES_NORM[j])) {
        return { mode: 'auto-compose', chapitres: CHAPITRES.slice(i, j + 1) };
      }
    }
  }

  // 3) contenance univoque (titres ≥ 8 car., chapitres de révision exclus)
  const contenus = TITRES_NORM.map((n, i) => ({ n, i })).filter(
    (x) =>
      x.n.length >= 8 &&
      x.n !== norm('تذكير بالمكتسبات') &&
      (t.includes(x.n) || x.n.includes(t))
  );
  if (contenus.length === 1) return { mode: 'auto-contenance', chapitres: [CHAPITRES[contenus[0].i]] };
  if (contenus.length > 1) return null;

  // 4) recouvrement de jetons (Jaccard ≥ 0.6 avec écart franc sur le 2e)
  const jt = jetons(t);
  const scores = TITRES_NORM.map((n, i) => ({ s: jaccard(jt, jetons(n)), i })).sort((a, b) => b.s - a.s);
  if (scores[0]?.s >= 0.6 && scores[0].s - (scores[1]?.s ?? 0) >= 0.15) {
    return { mode: 'auto-jetons', chapitres: [CHAPITRES[scores[0].i]] };
  }
  return null;
}

/** Badge lisible : « الفصل 19 (l.1797–1849) » — pour l'affichage viewer. */
export function badgeSource(s: SourceLivre): string {
  const nums = s.chapitres.map((c) => c.chapter);
  const debut = Math.min(...s.chapitres.map((c) => c.ligneDebut));
  const fin = Math.max(...s.chapitres.map((c) => c.ligneFin));
  const ops = nums.length === 1 ? `${nums[0]}` : `${nums[0]}–${nums[nums.length - 1]}`;
  return `الفصل ${ops} · أسطر ${debut}–${fin}`;
}

/** true si au moins un chapitre de la source est ambigu (en-tête OCR reconstruit). */
export function sourceAmbigue(s: SourceLivre): boolean {
  return s.chapitres.some((c) => c.ambigu);
}
