// guideManhajia.lock.test.ts — verrou du « الدليل العام للمنهجية »
// (guide fusionné de méthodologie SVT BAC 3AS).
//
// Fichier GÉNÉRÉ par scripts/build_guide_manhajia.ts à partir de
// GUIDE_FUSION_SYNTHESE_METHODE_SVT_BAC_3AS.md (racine). Regénérer :
//   npx tsx scripts/build_guide_manhajia.ts
//
// Ce verrou fige ce qui casse l'application si le parser dérive :
//   • structure (11 sections, ids et ordre, icônes licites, unicité) ;
//   • intégrité des tableaux (entêtes, pas de séparateur Markdown résiduel) ;
//   • propreté typographique (zéro résidu Markdown, zéro déchet de scan) ;
//   • navigation (ancres du sommaire et sous-sections toutes résolvables) ;
//   • fraîcheur (GUIDE_STATS reflète réellement les données).
import { describe, expect, it } from 'vitest';
import { GUIDE_SECTIONS, GUIDE_TITRE, GUIDE_STATS, type BlocGuide } from './guideManhajia';
import { ICONES_AUTORISEES } from './lessonIcons';

const ids = GUIDE_SECTIONS.map((s) => s.id);
const toutesLesSections = ids;
const tousBlocs: { s: string; i: number; b: BlocGuide }[] = GUIDE_SECTIONS.flatMap((s) =>
  s.blocs.map((b, i) => ({ s: s.id, i, b })),
);
const nb = (kind: BlocGuide['kind']) => tousBlocs.filter((x) => x.b.kind === kind).length;
const licite = (c: string): boolean => (ICONES_AUTORISEES as readonly string[]).includes(c);

describe('guideManhajia — structure', () => {
  it('titre du document présent et non vide', () => {
    expect(GUIDE_TITRE.length).toBeGreaterThan(10);
    expect(GUIDE_TITRE).toContain('الدليل المتكامل');
    expect(GUIDE_TITRE).toContain('علوم الطبيعة والحياة');
    // Titre du guide : entièrement en arabe (aucun résidu latin).
    expect(/[A-Za-z]/.test(GUIDE_TITRE)).toBe(false);
  });

  it('11 sections, ids exacts et ordre du document source', () => {
    expect(ids).toEqual([
      'sommaire',
      's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9',
      'annexe',
    ]);
  });

  it('chaque section a un libellé, une icône licite et au moins un bloc', () => {
    for (const s of GUIDE_SECTIONS) {
      expect(s.titre.trim().length, s.id).toBeGreaterThan(3);
      expect(licite(s.icone), `${s.id} → icône non résoluble « ${s.icone} »`).toBe(true);
      expect(s.blocs.length, s.id).toBeGreaterThan(0);
    }
  });

  it('ids de sections et de sous-sections uniques', () => {
    expect(new Set(ids).size).toBe(ids.length);
    const sous = GUIDE_SECTIONS.flatMap((s) => (s.sous ?? []).map((x) => x.id));
    expect(new Set(sous).size).toBe(sous.length);
    expect(new Set([...ids, ...sous]).size).toBe(ids.length + sous.length);
  });

  it('GUIDE_STATS reflète fidèlement les données', () => {
    expect(GUIDE_STATS.sections).toBe(GUIDE_SECTIONS.length);
    expect(GUIDE_STATS.blocs).toBe(tousBlocs.length);
    expect(GUIDE_STATS.tableaux).toBe(nb('tableau'));
    expect(GUIDE_STATS.entrees).toBe(nb('point') + nb('puce'));
    // Volume de contenu : détecte une troncature silencieuse du parser.
    const caracteres = tousBlocs.reduce((n, x) => n + x.b.texte.length, 0);
    expect(caracteres).toBeGreaterThan(22000);
  });
});

describe('guideManhajia — tableaux', () => {
  it('20 tableaux, tous avec entêtes et lignes cohérentes', () => {
    expect(nb('tableau')).toBe(20);
    for (const { s, i, b } of tousBlocs.filter((x) => x.b.kind === 'tableau')) {
      const loc = `${s}#${i}`;
      expect(b.entetes!.length, loc).toBeGreaterThanOrEqual(2);
      expect(b.lignes!.length, loc).toBeGreaterThan(0);
      for (const c of b.entetes!) expect(c.trim().length, loc).toBeGreaterThan(0);
      for (const l of b.lignes!) {
        expect(l.length, `${loc} — ligne trop longue`).toBeLessThanOrEqual(b.entetes!.length);
        expect(l.every((c) => c.trim().length > 0), `${loc} — cellule vide`).toBe(true);
      }
      // Aucun séparateur Markdown (`|---|`) résiduel dans le corps.
      for (const l of b.lignes!) {
        expect(l.some((c) => /^:?-{3,}:?$/.test(c)), `${loc} — séparateur résiduel`).toBe(false);
      }
    }
  });

  it('toutes les tables sources sont bien découpées (entêtes variés)', () => {
    const signature = new Set(
      tousBlocs
        .filter((x) => x.b.kind === 'tableau')
        .map((x) => x.b.entetes!.join('|')),
    );
    // 20 tables dont plusieurs réutilisent le même gabarit (« Piège | Solution »).
    expect(signature.size).toBeGreaterThanOrEqual(10);
  });
});

describe('guideManhajia — propreté typographique', () => {
  it('aucun résidu de Markdown (gras, code, lien, tableau brut)', () => {
    const textes = tousBlocs.map((x) => x.b.texte);
    for (const t of textes) {
      expect(t.includes('**'), `gras non rendu : ${t.slice(0, 60)}`).toBe(false);
      expect(t.includes('`'), `code non rendu : ${t.slice(0, 60)}`).toBe(false);
      expect(/\]\([^)]*\)/.test(t), `lien non rendu : ${t.slice(0, 60)}`).toBe(false);
      expect(t.includes('|---'), `tableau brut : ${t.slice(0, 60)}`).toBe(false);
    }
  });

  it('aucun déchet de scan (traits ____ , carrés ■)', () => {
    for (const t of tousBlocs.map((x) => x.b.texte)) {
      expect(/_{4,}/.test(t), t.slice(0, 60)).toBe(false);
      expect(t.includes('■'), t.slice(0, 60)).toBe(false);
    }
  });

  it('les listes à cocher sont bien préfixées d’une case ☐', () => {
    const cochables = tousBlocs.filter((x) => x.b.texte.startsWith('☐ '));
    // 17 puces à cocher (8.1 / 8.2 / 8.4) + 8 points à cocher (8.3).
    expect(cochables).toHaveLength(25);
    // Une case ne peut porter que puce ou point.
    for (const c of cochables) expect(['puce', 'point']).toContain(c.b.kind);
  });
});

describe('guideManhajia — navigation', () => {
  it('chaque ancre du sommaire vise une section existante', () => {
    const ancrages = tousBlocs.filter((x) => x.b.cible);
    // 9 entrées appariées aux sections 1 … 9 (pas de destination inventée).
    expect(ancrages.length).toBe(9);
    for (const a of ancrages) {
      expect(toutesLesSections, `${a.s}#${a.i} → ${a.b.cible}`).toContain(a.b.cible);
      expect(a.s, 'les ancres ne vivent que dans le sommaire').toBe('sommaire');
    }
  });

  it('chaque sous-section pointe sur un titre de niveau 2 valide', () => {
    let total = 0;
    for (const s of GUIDE_SECTIONS) {
      for (const ss of s.sous ?? []) {
        total += 1;
        expect(ss.titre.length).toBeGreaterThan(3);
        expect(ss.from).toBeGreaterThanOrEqual(0);
        expect(ss.from).toBeLessThan(s.blocs.length);
        const b = s.blocs[ss.from];
        expect(b.kind, `${s.id}/${ss.id}`).toBe('titre');
        expect(b.niveau, `${s.id}/${ss.id}`).toBe(2);
      }
    }
    expect(total).toBe(22);
  });

  it('chaque entrée du sommaire est cliquable', () => {
    const sommaire = GUIDE_SECTIONS.find((s) => s.id === 'sommaire')!;
    const entrees = sommaire.blocs.filter(
      (b) => b.kind === 'point' || b.kind === 'puce',
    );
    expect(entrees).toHaveLength(9);
    for (const p of entrees) expect(p.cible, p.texte).toBeTruthy();
  });
});
