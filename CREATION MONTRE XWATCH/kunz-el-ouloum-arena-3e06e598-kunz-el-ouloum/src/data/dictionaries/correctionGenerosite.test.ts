// correctionGenerosite.test.ts — verrous de la « générosité » du correcteur.
//
// DÉFAUT RECHERCHÉ (2026-10-12) : un item AUTANT valorisé se paie d'un seul mot.
// C'est ce qui faisait 8/8 à une salade de mots-clés, et ce qui sur-note encore
// les copies moyennes (29 copies sur 40 en sur-note sur S1-Ex3, mesuré).
//
// CE QUI EST PROUVÉ, ET DONC VERROUILLÉ ICI :
//   1. l'item S1-Ex3 « النورادرينالين / NE » (corr-2025-19) — corrigé et mesuré :
//      la forme courte « ne » manquait (40/40 échecs → 2/40) et la relation
//      chiffrée du corrigé (nmol) est exigée. Gain net : plafond artificiel levé
//      (6,36 → 7,00 sur les meilleures copies), κ global 0,96 → 0,97.
//   2. deux items ≥ 1,0 pt sans co-exigence ont été « corrigés » puis REVENUS EN
//      ARRIÈRE, parce que la mesure a empiré (MAE Ex3 0,99 → 1,37) : mes groupes
//      contenaient des verbes courants (« يرتبط ») et le sigle « ne » (présent
//      dans 38/40 copies), donc ils ÉLARGISSAIENT la détection au lieu de la
//      restreindre. Ils sont listés en dette explicite ci-dessous : on ne les
//      touche plus sans corpus et sans mesure avant/après.
//
// LEÇON GÉNÉRALE verrouillée par ce fichier : ajouter une composante n'est pas
// neutre. Un groupe qui contient un mot courant ou un sigle très fréquent rend
// l'item PLUS facile à prendre, pas moins.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { attendusDeGroupe, type AttenduItem } from './attendusBac2025';
import { analyserSignaux } from './integriteCopie';
import { noterExerciceCalibre, noterCopieCalibree } from './calibrationBac2025';

// ─── Corpus d'élève : pourquoi il se cherche, et pourquoi la CI reste verte ───
// `eleve_18.txt` est une copie d'élève anonymisée, servie d'étalon de mesure
// (docs/PROTOCOLE_PREUVE.md, docs/copies/README.md). Elle n'est PAS versionnée :
// ce dépôt est public et le corpus porte le travail de tiers. Les deux tests qui
// la lisaient par chemin relatif tombaient donc en ENOENT sur toute machine
// propre — la CI était rouge par construction (constat H1, audit du 2026-10-14).
//
// Le correctif ne consiste PAS à supprimer les tests : une preuve qui disparaît
// est pire qu'une preuve rouge. Il consiste à rendre l'exigence explicite :
//   · le corpus est cherché dans KUNZ_CORPUS_ELEVE_18, puis aux emplacements
//     historiques (racine du dépôt, cwd) ;
//   · présent → les tests de corpus s'exécutent, comme avant ;
//   · absent → ils sont rapportés « ignorés » (jamais « verts en silence ») et
//     un verrou sur copie SYNTHÉTIQUE prend le relais pour qu'aucune règle ne
//     se perde en CI.
function chargerCorpusEleve(): { texte: string; origine: string } | null {
  const pistes = [
    process.env.KUNZ_CORPUS_ELEVE_18,
    resolve(__dirname, '../../../eleve_18.txt'),
    resolve(process.cwd(), 'eleve_18.txt'),
  ].filter((x): x is string => Boolean(x));

  for (const piste of pistes) {
    try {
      const brut = readFileSync(piste, 'utf-8');
      const i = brut.toLowerCase().indexOf('score attendu');
      // Le corrigé type est collé après la copie : on ne garde que la réponse.
      return { texte: i > 0 ? brut.slice(0, i) : brut, origine: piste };
    } catch {
      // chemin suivant
    }
  }
  return null;
}

const CORPUS_ELEVE = chargerCorpusEleve();
const CORPUS_PRESENT = CORPUS_ELEVE !== null;

const GROUPES: [1 | 2, 1 | 2 | 3][] = [
  [1, 1],
  [1, 2],
  [1, 3],
  [2, 1],
  [2, 2],
  [2, 3],
];

function tous(): { cle: string; item: AttenduItem }[] {
  const out: { cle: string; item: AttenduItem }[] = [];
  for (const [s, e] of GROUPES) {
    for (const it of attendusDeGroupe(s, e).items) out.push({ cle: `S${s}-Ex${e}/${it.id}`, item: it });
  }
  return out;
}

const AUTO = tous().filter(
  (x) => x.item.points > 0 && (x.item.formes.length > 0 || (x.item.composantes?.length ?? 0) > 0),
);

/** Items ≥ 1,0 pt sans aucune co-exigence — la dette connue. */
const DETTE = AUTO.filter(
  (x) => x.item.points >= 1 && (x.item.composantes?.length ?? 0) < 2,
).map((x) => x.cle);

describe('correcteur — item corrigé et prouvé (2026-10-12)', () => {
  const ne = AUTO.find((x) => x.item.formes.includes('ne'));

  it('l item « النورادرينالين / NE » existe et porte le sigle court', () => {
    expect(ne, 'item NE introuvable').toBeTruthy();
    expect(ne!.item.formes).toContain('ne');
  });

  it('il exige la relation CHIFFRÉE du corrigé, pas la simple mention', () => {
    expect(ne!.item.composantes).toBeTruthy();
    expect(ne!.item.composantes!.length).toBeGreaterThanOrEqual(2);
    expect(ne!.item.composantes![0]).toContain('ne');
    expect(ne!.item.composantes![1]).toContain('nmol');
  });

  it('aucune de ses composantes ne contient de forme « fourre-tout »', () => {
    // La raison du revert des items 18 et 21 : un groupe trop large rend l'item
    // PLUS facile. On vérifie que le correctif, lui, reste sélectif.
    for (const g of ne!.item.composantes!) {
      for (const f of g) {
        expect(['يرتبط', 'ado', 'go', 'gi', 'k'], `forme trop large : ${f}`).not.toContain(f);
      }
    }
  });
});

describe('correcteur — abandon déclaré (signal, PAS une pénalité)', () => {
  // 2026-10-12 : 6 copies sur 40 déclarent abandonner une partie. Le moteur ne
  // crédite déjà rien pour les items absents, donc pénaliser ici serait double
  // peine — et la mesure le confirmera. Le signal demande un regard humain.
  it('« لم أتم » est détecté comme abandon déclaré', () => {
    const s = analyserSignaux('الجزء الأول: يتكون من بروتينين. الجزء الثالث: (لم أتم)');
    expect(s.abandonDeclare).toBe(true);
    expect(s.marqueurAbandon).toBeTruthy();
  });

  it('une réponse complète ne déclenche aucun signal', () => {
    const s = analyserSignaux(
      'ارتباط Ado بمستقبله A1R يقلل من إفراز NE. الاعتدال في الكمية وتجنب الشاي مساء.',
    );
    expect(s.abandonDeclare).toBe(false);
    expect(s.marqueurAbandon).toBeNull();
  });

  it('les variantes sont reconnues (« لا أعرف », « دون إجابة »)', () => {
    expect(analyserSignaux('لا أعرف الجواب').abandonDeclare).toBe(true);
    expect(analyserSignaux('بقيت دون إجابة').abandonDeclare).toBe(true);
  });

  it('un mot qui CONTIENT le marqueur ne déclenche pas le signal', () => {
    // « لم يتم » ≠ « لم أتم » : la frontière de mot évite les faux positifs.
    expect(analyserSignaux('لم يتم بعد ربط المستقبل').abandonDeclare).toBe(false);
  });

  // Exige la copie d'élève réelle : rapporté « ignoré » si elle est absente,
  // jamais vert par accident (cf. le chargeur en tête de fichier).
  it.skipIf(!CORPUS_PRESENT)('le signal ne change PAS la note auto (vérifié sur le corpus)', () => {
    const reponse = CORPUS_ELEVE!.texte;
    const note = noterExerciceCalibre(reponse, 1, 3);
    expect(note.abandonDeclare).toBe(true);
    expect(note.motifReserveHumaine).toContain('تحقّق');
    // La note reste strictement la note auto : aucun plafond ajouté.
    expect(note.plafonds).toEqual([]);
  });

  it('le signal est propagé à l interface, visible par le correcteur', () => {
    // Le signal ne sert à rien s'il reste dans le moteur : l'écran de correction
    // doit l'afficher.
    const src = readFileSync(resolve(__dirname, '../../components/SectionObligatoire.tsx'), 'utf-8');
    expect(src).toContain('note.abandonDeclare');
    expect(src).toContain('note.motifReserveHumaine');
  });

  it.skipIf(!CORPUS_PRESENT)('le signal survit à l agrégation des 3 exercices (copie complète)', () => {
    // `Bac2025ExamView` note via `noterCopieCalibee` puis rend SectionObligatoire
    // par exercice : si l'agrégation recomposait les objets, le signal se perdait.
    const reponse = CORPUS_ELEVE!.texte;
    // Même texte sur les 3 exercices : le signal doit apparaître sur chacun.
    const copie = noterCopieCalibree([reponse, reponse, reponse], 1);
    const avecSignal = copie.exercices.filter((e: { abandonDeclare: boolean }) => e.abandonDeclare);
    expect(avecSignal.length).toBe(3);
    expect((avecSignal[0] as { motifReserveHumaine: string }).motifReserveHumaine).toContain('تحقّق');
  });
});

// ─── Verrou de CI : les mêmes invariants, sans dépendre du corpus ─────────────
// Ces tests ne remplacent pas la mesure sur les 40 copies (elle seule donne r,
// MAE et biais) : ils garantissent que la RÈGLE « l'abandon déclaré est un
// signal, pas une pénalité » reste vérifiée sur une machine sans corpus.
describe('correcteur — signaux de copie, verrou permanent (copie synthétique)', () => {
  /**
   * Réponse rédigée normale — témoin. Deux phrases pleines : le détecteur
   * `estProse` (integriteCopie.ts) exige DEUX phrases d'au moins 4 mots pour
   * reconnaître de la prose sans marqueur de relation ; un témoin d'une seule
   * phrase déclencherait le plafond `non_prose` (0,3) et fausserait la
   * comparaison, qui doit isoler l'effet du SEUL signal d'abandon.
   */
  const PROSE =
    'البروتين يتكون من أحماض أمينية مرتبطة بروابط ببتيدية. ويحدد تتابع هذه الأحماض بنية البروتين ووظيفته.';
  /** LA MÊME réponse, plus la déclaration d'abandon à la fin. */
  const PROSE_ABANDON = `${PROSE} لا أعرف بقية الجواب.`;

  it('la déclaration d abandon ne PÉNALISE pas : note et plafonds identiques au témoin', () => {
    // C'est la règle exacte du corpus, mesurable sans lui : ne comparer que le
    // texte AVEC et SANS la déclaration isole l'effet du signal. (Une copie
    // entièrement vide, elle, déclenche un plafond « non_prose » qui n'a rien à
    // voir : c'est pourquoi le témoin est une prose, et non du vide.)
    const avec = noterExerciceCalibre(PROSE_ABANDON, 1, 3);
    const sans = noterExerciceCalibre(PROSE, 1, 3);

    expect(avec.abandonDeclare).toBe(true);
    expect(sans.abandonDeclare).toBe(false);
    expect(avec.motifReserveHumaine).toContain('تحقّق');
    expect(avec.plafonds).toEqual(sans.plafonds);
    expect(avec.noteFinale).toBe(sans.noteFinale);
  });

  it('le signal survit à l agrégation des 3 exercices', () => {
    const copie = noterCopieCalibree([PROSE_ABANDON, PROSE_ABANDON, PROSE_ABANDON], 1);
    const avecSignal = copie.exercices.filter((e: { abandonDeclare: boolean }) => e.abandonDeclare);
    expect(avecSignal.length).toBe(3);
    expect((avecSignal[0] as { motifReserveHumaine: string }).motifReserveHumaine).toContain('تحقّق');
  });
});

describe('correcteur — dette énumérée (à ne PAS « corriger » sans mesure)', () => {
  it('la dette est explicitement listée et ne grandit pas en cachette', () => {
    // Ajouter un item à cette liste est un Acte conscient : il faut le justifier.
    // La liste figée ici empêche qu'un item dégrade silencieusement.
    expect(DETTE).toEqual([
      'S1-Ex2/corr-2025-5',   // 1,5 pt — 'البيرنويد' / 'غشاء بروتيني يحيط' : variantes d'OCR du MÊME organite, légitime
      'S1-Ex3/corr-2025-18',  // 1,0 pt — 'فرضيه' / 'يرتبط mtb' : le seul mot « فرضيه » prend l'item
      'S1-Ex3/corr-2025-21',  // 1,0 pt — 'قنوات' / 'الحويصلات' : « قنوات » seul prend l'item
      'S2-Ex1/bac2025_S2/S2-Ex1/Q2/etape2', // 1,0 pt — termes techniques (atp/adp/nad/nadh), plausible
      'S2-Ex2/corr-2025-37',  // 1,0 pt — 'يمنح' / 'الدواء' : mots courants, suspect
      'S2-Ex3/corr-2025-44',  // 1,0 pt — 'غير امن' : expression courante, très suspect
      'S2-Ex3/corr-2025-49',  // 1,0 pt — plausible
      'S2-Ex3/corr-2025-51',  // 1,0 pt — 'الخطوات' / 'المراحل' : mots courants, très suspect
    ]);
  });

  it('un item ≥ 1,0 pt à composantes en exige au moins DEUX groupes', () => {
    // Celle-ci, en revanche, est une vraie règle : un seul groupe = un « ou »
    // élargi, ce qui ne crée aucune co-exigence.
    const faibles = AUTO.filter(
      (x) => x.item.points >= 1 && x.item.composantes != null && x.item.composantes.length < 2,
    );
    expect(faibles.map((x) => `${x.cle} (${x.item.composantes!.length} groupe)`)).toEqual([]);
  });

  it('chaque composante contient au moins une forme', () => {
    for (const x of AUTO) {
      for (const g of x.item.composantes ?? []) {
        expect(g.length, `${x.cle} a un groupe vide`).toBeGreaterThan(0);
      }
    }
  });
});
