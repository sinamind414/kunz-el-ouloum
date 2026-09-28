// OkachaView.tsx — « الحصيلة المعرفية » : récapitulatifs par unité.
//
// Contenu unités : src/data/hosila.ts (نصّ OFFICIEL du livre scolaire,
// GÉNÉRÉ par scripts/build_hosila.ts — verrou hosila.lock.test.ts).
// Repli (unité non couverte) : src/data/okachaEnriched.ts (OCR عكاشة).
// Méthodo : src/data/guideManhajia.ts — الدليل العام للمنهجية
//   (GÉNÉRÉ par scripts/build_guide_manhajia.ts — verrou
//    guideManhajia.lock.test.ts). L'ancien corpus OCR « عكاشة »
//   (OKACHA_METHODO_SECTIONS) n'est plus affiché : audit F3
//   (docs/AUDIT_ARABE_HOSILA_2026-09-24.md) — il reste verrouillé par
//   okachaEnriched.lock.test.ts / lessonIcons.test.ts, il n'est juste plus
//   rendu ici.
// Qualité affichage (lot A, 2026-09-24) : src/data/okachaQuality.ts masque les
//   déchets scan (score ≥ seuil) — verrou okachaQuality.lock.test.ts. Le filtre
//   est appliqué aux unités OCR ; le guide est déjà propre (aucun déchet).
//
// Phase A (cette vue) :
//  1. rendu STRUCTURÉ (hiérarchie + puces + notes + tableaux, 15-17 px) ;
//  2. recherche arabe normalisée (normAr) sur tout le corpus (unités + guide) ;
//  3. mode حفظ : masquer les points → révéler → auto-évaluation (again/hard/
//     good/easy) branchée sur le SM-2/XP existant (handleRateCard, App.tsx) ;
//  4. progression par unité en localStorage (okachaProgress.ts) + accès QCM livre ;
//  5. design system : D1 bleu / D2 ambre / D3 violet / guide émeraude,
//     icônes par domaine, taille de lecture, impression.

import { useEffect, useMemo, useState } from 'react';
import {
  BookMarked, Search, X, Compass, FlaskConical, Leaf, Globe2,
  Eye, EyeOff, CheckCircle2, Printer, BookOpen, RotateCcw, Check, Star, Lightbulb, ChevronLeft,
} from 'lucide-react';
import {
  OKACHA_UNITES_ENRICHIES,
  normAr,
} from '../data/okachaEnriched';
import { GUIDE_SECTIONS, GUIDE_TITRE } from '../data/guideManhajia';
import { assainirTexte, estDechetOCR } from '../data/okachaQuality';
import Icone from './Icone';
import { HOSILA_STATS, unitesAffichees } from '../data/hosila';
import { numeroUniteHosila } from '../data/hosilaUnitNumbers';
import { okachaUniteIcone } from '../data/lessonIcons';
import {
  loadOkachaProgress,
  toggleUniteLue,
  marquerSectionLue,
  noterPoint,
  notationsUnite,
  totalNotations,
  XP_PAR_NOTE,
  type NoteHafiz,
  type OkachaProgress,
} from '../data/okachaProgress';

interface Props {
  onBack: () => void;
  /** Branché sur handleRateCard (App.tsx) par LessonsView — XP + flashcardStats. */
  onRate?: (cardId: string, rating: NoteHafiz) => void;
  /** Ouvre le QCM du livre (اختبار الكتاب). */
  onOpenQcm?: () => void;
  /**
   * Domaine ouvert au montage (1 | 2 | 3 | 'm').
   * Entrée depuis les leçons passives : chaque domaine a SA propre
   * الحصيلة المعرفية — on n'ouvre plus la rubrique « au hasard » en domaine 1.
   */
  domaineInitial?: 1 | 2 | 3 | 'm';
}

const NOM_DOMAINE: Record<number, string> = {
  1: 'المجال 1 — التخصص الوظيفي للبروتينات',
  2: 'المجال 2 — التحولات الطاقوية',
  3: 'المجال 3 — التكتونية العامة',
};

/** Design system par domaine (icônes miroir de LessonsView : D1/D2/D3). */
const THEME = {
  1: { icone: FlaskConical, actif: 'bg-[#1d4ed8] text-white', dormand: 'bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 hover:bg-blue-100', bar: 'bg-blue-600', bord: 'border-blue-200 dark:border-blue-900/60', grad: 'from-blue-500/10 dark:from-blue-950/40', num: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300' },
  2: { icone: Leaf, actif: 'bg-[#b45309] text-white', dormand: 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100', bar: 'bg-amber-600', bord: 'border-amber-200 dark:border-amber-900/60', grad: 'from-amber-500/10 dark:from-amber-950/40', num: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' },
  3: { icone: Globe2, actif: 'bg-violet-700 text-white', dormand: 'bg-violet-50 dark:bg-violet-950/30 text-violet-800 dark:text-violet-300 hover:bg-violet-100', bar: 'bg-violet-600', bord: 'border-violet-200 dark:border-violet-900/60', grad: 'from-violet-500/10 dark:from-violet-950/40', num: 'bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300' },
  m: { icone: Compass, actif: 'bg-[#006d37] text-white', dormand: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100', bar: 'bg-emerald-600', bord: 'border-emerald-200 dark:border-emerald-900/60', grad: 'from-emerald-500/10 dark:from-emerald-950/40', num: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' },
} as const;

type ThemeCle = keyof typeof THEME;

const echapper = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Surlignage de la requête brute dans le texte (le FILTRE utilise normAr). */
function Surligne({ texte, q }: { texte: string; q: string }) {
  const brut = q.trim();
  if (!brut) return <>{texte}</>;
  const parts = texte.split(new RegExp(`(${echapper(brut)})`, 'g'));
  return (
    <>
      {parts.map((p, i) =>
        p === brut ? (
          <mark key={i} className="bg-yellow-300/80 dark:bg-yellow-500/40 text-inherit rounded px-0.5">{p}</mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

/**
 * Bloc rendu à l'écran : soit un bloc des unités (BlocOkacha, OCR عكاشة /
 * نصّ hosila), soit un bloc du الدليل العام للمنهجية (BlocGuide, qui ajoute
 * `tableau`, la profondeur de titre et l'ancre cliquable).
 */
interface BlocAffiche {
  kind: 'titre' | 'point' | 'puce' | 'note' | 'texte' | 'tableau';
  num?: string;
  texte: string;
  niveau?: number;
  entetes?: string[];
  lignes?: string[][];
  cible?: string;
}

/** Ligne de résultats de recherche (unité OU section du guide méthodologie). */
interface LigneResultat {
  cleParent: string; // unité (« d1u4 ») ou section (« m:s3 »)
  libelleParent: string;
  domaine: ThemeCle;
  b: BlocAffiche;
  idx: number;
}

/** Un bloc sémantique rendu dans sa hiérarchie (titre > point > puce > note > texte > tableau). */
function BlocView({
  b, cle, domaine, cache, revele, onReveler, onNoter, onAller, notes, taille, q,
}: {
  b: BlocAffiche;
  cle: string;
  domaine: ThemeCle;
  cache: boolean;        // mode حفظ actif ET point masqué
  revele: boolean;
  onReveler: () => void;
  onNoter: (n: NoteHafiz) => void;
  /** Ancre cliquable (sommaire du guide) → ouvre la section de destination. */
  onAller?: (sectionId: string) => void;
  notes?: { again: number; hard: number; good: number; easy: number };
  taille: string;        // classes de corps de texte
  q: string;
}) {
  const th = THEME[domaine];
  const noteDeja = notes ? notes.again + notes.hard + notes.good + notes.easy > 0 : false;

  if (b.kind === 'tableau') {
    const entetes = b.entetes ?? [];
    const lignes = b.lignes ?? [];
    return (
      <div className="my-3 overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
        <table dir="ltr" className="w-full border-collapse text-left" data-testid={`tableau-${cle}`}>
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/70">
              {entetes.map((h, i) => (
                <th
                  key={i}
                  className="px-2.5 py-2 text-[12px] font-black text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 align-top"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((r, ri) => (
              <tr key={ri} className="odd:bg-white even:bg-gray-50 dark:odd:bg-[#161c18] dark:even:bg-gray-900/40">
                {entetes.map((_, ci) => (
                  <td
                    key={ci}
                    className="px-2.5 py-1.5 text-[12px] font-bold text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 align-top"
                  >
                    <Surligne texte={r[ci] ?? ''} q={q} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (b.kind === 'titre') {
    const profond = b.niveau === 3;
    return (
      <div className={`mt-5 mb-2 first:mt-0 flex items-center gap-2 ${profond ? 'pr-3' : ''}`}>
        <span className={`w-1.5 ${profond ? 'h-4 opacity-70' : 'h-5'} rounded-full ${th.bar}`} />
        <span
          className={`${taille} ${profond ? 'font-extrabold text-gray-700 dark:text-gray-200' : 'font-black text-gray-900 dark:text-gray-50'}`}
        >
          <Surligne texte={b.texte} q={q} />
        </span>
      </div>
    );
  }

  if (b.kind === 'note') {
    return (
      <div className="my-2.5 rounded-2xl border border-yellow-300 dark:border-yellow-700/60 bg-yellow-50 dark:bg-yellow-950/30 px-3 py-2 flex gap-2">
        <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-yellow-600 dark:text-yellow-400" />
        <span className={`${taille} font-bold text-yellow-900 dark:text-yellow-200 leading-relaxed`}>
          <Surligne texte={b.texte} q={q} />
        </span>
      </div>
    );
  }

  if (b.kind === 'point') {
    return (
      <div className="my-2">
        <div className="flex items-start gap-2">
          {b.num && (
            <span className={`shrink-0 min-w-[1.6rem] h-6 px-1.5 rounded-lg ${th.num} text-xs font-black flex items-center justify-center mt-0.5`}>
              {b.num}
            </span>
          )}
          {cache ? (
            <button
              onClick={onReveler}
              data-testid={`reveal-${cle}`}
              className={`flex-1 text-right rounded-xl border-2 border-dashed ${th.bord} bg-gray-50 dark:bg-gray-900/60 px-3 py-1.5 text-xs font-black text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
            >
              👁 مخفي — اضغط للكشف
            </button>
          ) : b.cible && onAller ? (
            <button
              type="button"
              onClick={() => onAller(b.cible!)}
              data-testid={`aller-${b.cible}`}
              className={`flex-1 text-right ${taille} font-bold text-emerald-700 dark:text-emerald-300 hover:underline leading-[1.95]`}
            >
              <Surligne texte={b.texte} q={q} />
            </button>
          ) : (
            <span className={`flex-1 ${taille} font-bold text-gray-800 dark:text-gray-100 leading-[1.95]`}>
              <Surligne texte={b.texte} q={q} />
            </span>
          )}
        </div>
        {revele && (
          <div className="flex items-center gap-1.5 mt-1.5 pr-1 flex-wrap" data-testid={`eval-${cle}`}>
            <button
              onClick={() => onNoter('again')}
              title={`+${XP_PAR_NOTE.again} نقطة`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-[11px] font-black text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>أعيد</span>
              <span className="text-gray-400">+{XP_PAR_NOTE.again}</span>
            </button>
            <button
              onClick={() => onNoter('hard')}
              title={`+${XP_PAR_NOTE.hard} نقطة`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-[11px] font-black text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <span>🟡</span>
              <span>صعبة</span>
              <span className="text-gray-400">+{XP_PAR_NOTE.hard}</span>
            </button>
            <button
              onClick={() => onNoter('good')}
              title={`+${XP_PAR_NOTE.good} نقطة`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-[11px] font-black text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <Check className="w-3 h-3" />
              <span>جيدة</span>
              <span className="text-gray-400">+{XP_PAR_NOTE.good}</span>
            </button>
            <button
              onClick={() => onNoter('easy')}
              title={`+${XP_PAR_NOTE.easy} نقطة`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-[11px] font-black text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <Star className="w-3 h-3" />
              <span>سهلة</span>
              <span className="text-gray-400">+{XP_PAR_NOTE.easy}</span>
            </button>
            {noteDeja && <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">✓ تقييم محفوظ</span>}
          </div>
        )}
      </div>
    );
  }

  if (b.kind === 'puce') {
    const contenu = (
      <>
        <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${th.bar} mt-2.5`} />
        <span className={`flex-1 ${taille} font-bold text-gray-700 dark:text-gray-200 leading-[1.9]`}>
          <Surligne texte={b.texte} q={q} />
        </span>
      </>
    );
    if (b.cible && onAller) {
      return (
        <button
          type="button"
          onClick={() => onAller(b.cible!)}
          data-testid={`aller-${b.cible}`}
          className="flex w-full items-start gap-2 my-1.5 pr-1 text-right hover:opacity-80"
        >
          {contenu}
        </button>
      );
    }
    return <div className="flex items-start gap-2 my-1.5 pr-1">{contenu}</div>;
  }

  return (
    <p className={`my-2 ${taille} font-bold text-gray-700 dark:text-gray-200 leading-[1.95]`}>
      <Surligne texte={b.texte} q={q} />
    </p>
  );
}

export default function OkachaView({ onBack, onRate, onOpenQcm, domaineInitial }: Props) {
  const [onglet, setOnglet] = useState<1 | 2 | 3 | 'm'>(domaineInitial ?? 1);
  /** Unité ouverte : `null` = écran d'icônes des unités du domaine. */
  const [ouverte, setOuverte] = useState<string | null>(null);
  const [sectionM, setSectionM] = useState<string | null>(GUIDE_SECTIONS[0]?.id ?? null);
  const [q, setQ] = useState('');
  const [modeHafiz, setModeHafiz] = useState(false);
  const [grand, setGrand] = useState(false);
  const [revelves, setRevelves] = useState<Set<string>>(new Set());
  const [prog, setProg] = useState<OkachaProgress>(() => loadOkachaProgress());

  // Quitter le mode حفظ → tout re-masqué à la prochaine activation.
  useEffect(() => {
    if (!modeHafiz) setRevelves(new Set());
  }, [modeHafiz]);

  /** Contenu affiché : الحصيلة الرسمية (hosila) prioritaire, repli عكاشة si absent. */
  const corpusUnites = useMemo(() => unitesAffichees(OKACHA_UNITES_ENRICHIES), []);
  // Tri sur le numéro OFFICIEL de l'unité (1..11) : en domaine 3 les ids
  // « d3u1/d3u2 » ne sont pas dans l'ordre du livre, l'affichage doit l'être.
  const unites = useMemo(
    () =>
      corpusUnites
        .filter((u) => u.domaine === (onglet as number))
        .sort((a, b) => (numeroUniteHosila(a.id) ?? 0) - (numeroUniteHosila(b.id) ?? 0)),
    [corpusUnites, onglet],
  );
  const taille = grand ? 'text-[17px]' : 'text-[15px]';
  /** Unité du livre actuellement ouverte (null = écran d'icônes). */
  const uniteCourante = ouverte ? corpusUnites.find((u) => u.id === ouverte) ?? null : null;

  // Index de recherche normalisé (unités + الدليل العام للمنهجية).
  // Lot A : les déchets OCR (score ≥ seuil) des unités n'entrent pas dans
  // l'index ; le guide est nativement propre, aucun filtre n'y est appliqué.
  const index = useMemo(() => {
    const rows: { norm: string; r: LigneResultat }[] = [];
    for (const u of corpusUnites) {
      u.blocs.forEach((b, idx) => {
        if (estDechetOCR(b.texte)) return;
        const bAff = { ...b, texte: assainirTexte(b.texte) };
        rows.push({ norm: normAr(bAff.texte), r: { cleParent: u.id, libelleParent: u.uniteAr, domaine: u.domaine as ThemeCle, b: bAff, idx } });
      });
    }
    for (const s of GUIDE_SECTIONS) {
      s.blocs.forEach((b, idx) => {
        rows.push({ norm: normAr(b.texte), r: { cleParent: `m:${s.id}`, libelleParent: s.titre, domaine: 'm' as const, b, idx } });
      });
    }
    return rows;
  }, [corpusUnites]);

  /** Ids du guide — sert à ne compter comme « lu » que les sections réelles. */
  const idsGuide = useMemo(() => new Set(GUIDE_SECTIONS.map((s) => s.id)), []);
  const sectionsLues = prog.sectionsLues.filter((id) => idsGuide.has(id));

  const qNorm = normAr(q.trim());
  const resultats: LigneResultat[] | null =
    qNorm.length >= 2 ? index.filter((x) => x.norm.includes(qNorm)).slice(0, 80).map((x) => x.r) : null;

  const lues = prog.lus.length;
  const pct = Math.round((lues / corpusUnites.length) * 100);

  const ouvrirResultat = (r: LigneResultat) => {
    if (r.cleParent.startsWith('m:')) {
      setOnglet('m');
      setSectionM(r.cleParent.slice(2));
    } else {
      const u = corpusUnites.find((x) => x.id === r.cleParent);
      if (u) { setOnglet(u.domaine); setOuverte(u.id); }
    }
    setQ('');
  };

  const noter = (cle: string, n: NoteHafiz) => {
    const [parent, idxStr] = cle.split('#');
    setProg((p) => noterPoint(p, parent, Number(idxStr), n));
    onRate?.(cle, n);
  };

  /** Ancre du sommaire du guide : ouvre la section et fait défiler jusqu'à elle. */
  const allerSection = (id: string) => {
    setSectionM(id);
    setProg((p) => marquerSectionLue(p, id));
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-testid="methodo-section-${id}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  // Contexte affiché — AUCUN onglet cliquable : la حصيلة d'un domaine est
  // choisie depuis l'écran des domaines (chaque domaine a la sienne), et le
  // الدليل العام للمنهجية a lui aussi quitté cette barre pour cet écran.
  const thContexte = THEME[onglet];
  const IconeContexte = thContexte.icone;

  return (
    <div dir="rtl" className="space-y-4">
      {/* ── En-tête + barre d'outils (imprimable sans les boutons) ── */}
      <div className="flex items-center gap-3 flex-wrap print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
        >
          <span>→</span>
          <span>عودة</span>
        </button>
        <h2 className="text-xl font-black flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-[#1d4ed8]" />
          الحصيلة المعرفية — كل ما يجب حفظه
        </h2>
        <div className="mr-auto flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setModeHafiz((v) => !v)}
            data-testid="toggle-hafiz"
            title="اخفِ النقاط واكشفها لتقييم حفظك"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${modeHafiz ? 'bg-[#006d37] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
          >
            {modeHafiz ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            وضع الحفظ
          </button>
          <button
            onClick={() => setGrand((v) => !v)}
            title="حجم الخط للقراءة"
            className="px-3 py-1.5 rounded-xl text-xs font-black bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
          >
            {grand ? 'أ—صغير' : 'أ—كبير'}
          </button>
          <button
            onClick={() => window.print()}
            title="طباعة الملخص"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
          >
            <Printer className="w-3.5 h-3.5" />
            طباعة
          </button>
          {onOpenQcm && (
            <button
              onClick={onOpenQcm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-[#b45309] text-white hover:bg-amber-700"
            >
              <BookOpen className="w-3.5 h-3.5" />
              اختبار الكتاب
            </button>
          )}
        </div>
      </div>

      {/* ── Recherche arabe normalisée ── */}
      <div className="relative print:hidden">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث في كل الملخصات والدليل العام… (مثال: الاستنساخ، المورثة، التفسير)"
          data-testid="okacha-search"
          className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161c18] pr-9 pl-9 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        {q && (
          <button onClick={() => setQ('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="مسح البحث">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Bandeau notice + progression ── */}
      <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs font-bold text-blue-900 dark:text-blue-200 leading-relaxed print:break-inside-avoid">
        الحصيلة المعرفية الرسمية من الكتاب المدرسي ({HOSILA_STATS.unites} وحدات)
        + الدليل العام للمنهجية ({GUIDE_SECTIONS.length} أقسام)
        — اقرأ، فعّل « وضع الحفظ » لتختبر نفسك، ثم اختبر في « اختبار الكتاب ».
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-700 dark:text-blue-300">
            📚 {HOSILA_STATS.points} نقطة · {HOSILA_STATS.unites} وحدات · {index.length} سجلاً قابلاً للبحث
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
            ✅ {lues}/{corpusUnites.length} وحدات محفوظة
            {totalNotations(prog) > 0 && <> · 🗳 {totalNotations(prog)} تقييم</>}
          </span>
          <span className="flex-1 min-w-[80px] h-2 rounded-full bg-blue-100 dark:bg-blue-950 overflow-hidden" role="progressbar" aria-valuenow={pct}>
            <span className="block h-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
          </span>
        </div>
      </div>

      {/* ── Contexte (statique, non cliquable) — plus d'onglets ── */}
      <div className="flex gap-2 flex-wrap print:hidden">
        <span
          data-testid="okacha-contexte"
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black ${thContexte.actif}`}
        >
          <IconeContexte className="w-3.5 h-3.5" />
          {onglet === 'm' ? 'الدليل العام للمنهجية' : NOM_DOMAINE[onglet]}
        </span>
      </div>

      {/* ── Résultats de recherche (remplace la liste) ── */}
      {resultats && (
        <section className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] overflow-hidden" data-testid="okacha-results">
          <header className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-xs font-black text-gray-500 dark:text-gray-400">
            🔎 {resultats.length}{resultats.length >= 80 ? '+' : ''} نتيجة لـ « {q.trim()} »
          </header>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[60vh] overflow-y-auto">
            {resultats.length === 0 && (
              <p className="px-4 py-6 text-sm font-bold text-gray-400 text-center">لا نتائج — جرّب كلمة أخرى</p>
            )}
            {resultats.map((r, i) => (
              <button
                key={`${r.cleParent}#${r.idx}-${i}`}
                onClick={() => ouvrirResultat(r)}
                className="w-full text-right px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <span className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-1">
                  📖 {r.libelleParent}
                </span>
                <span className={`${taille} font-bold text-gray-800 dark:text-gray-100 leading-relaxed`}>
                  <Surligne
                    texte={r.b.kind === 'tableau' ? `${r.b.texte.slice(0, 220)}${r.b.texte.length > 220 ? '…' : ''}` : r.b.texte}
                    q={q}
                  />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── الدليل العام للمنهجية (sections générées depuis le guide Markdown) ── */}
      {!resultats && onglet === 'm' && (
        <div className="space-y-3">
          {/* Titre du document + sommaire cliquable + badge « n/N sections lues » */}
          <div className="flex items-center gap-2 flex-wrap" data-testid="guide-titre">
            <Icone cle="Compass" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-50">{GUIDE_TITRE}</h3>
          </div>
          <nav
            className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 print:hidden"
            data-testid="methodo-sommaire"
            aria-label="Sommaire du guide de méthodologie"
          >
            <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 ml-1">
              📑 {sectionsLues.length}/{GUIDE_SECTIONS.length} أقسام مقروءة
            </span>
            {GUIDE_SECTIONS.map((s, i) => {
              const lue = sectionsLues.includes(s.id);
              const active = sectionM === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSectionM(s.id);
                    setProg((p) => marquerSectionLue(p, s.id));
                  }}
                  data-testid={`sommaire-${s.id}`}
                  title={s.titre}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black transition-colors ${
                    active
                      ? 'bg-emerald-600 text-white'
                      : lue
                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200'
                        : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span>{lue ? '✓' : i + 1}</span>
                  <span className="max-w-[7.5rem] truncate">{s.titre.split('—')[0].trim()}</span>
                </button>
              );
            })}
          </nav>

          {GUIDE_SECTIONS.map((s) => {
            const ouverteS = sectionM === s.id;
            return (
              <section key={s.id} className={`rounded-3xl border ${THEME.m.bord} bg-white dark:bg-[#161c18] overflow-hidden`}>
                <button
                  onClick={() => {
                    if (ouverteS) {
                      setSectionM(null);
                    } else {
                      setSectionM(s.id);
                      setProg((p) => marquerSectionLue(p, s.id));
                    }
                  }}
                  data-testid={`methodo-section-${s.id}`}
                  className={`w-full flex items-center justify-between px-4 py-3 text-right bg-gradient-to-l ${THEME.m.grad} hover:opacity-90`}
                >
                  <span className="flex items-center gap-2 text-sm font-black text-gray-800 dark:text-gray-100">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-600 text-white shrink-0">
                      <Icone cle={s.icone} className="w-4 h-4" />
                    </span>
                    {s.titre}
                  </span>
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                    {ouverteS
                      ? '▲ إخفاء'
                      : `▼ ${s.blocs.length} مدخلاً`}
                  </span>
                </button>
                {ouverteS && (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-800">
                    {s.sous && s.sous.length > 0 && (
                      <div
                        className="flex flex-wrap gap-1.5 mb-3 py-2 border-b border-dashed border-emerald-200 dark:border-emerald-900/50 print:hidden"
                        data-testid={`methodo-sous-${s.id}`}
                      >
                        {s.sous.map((ss) => (
                          <button
                            key={ss.id}
                            onClick={() => {
                              document
                                .querySelector(`[data-bloc-anchor="${s.id}:${ss.from}"]`)
                                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            data-testid={`sous-${ss.id}`}
                            className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-[10px] font-black text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100"
                          >
                            {ss.titre}
                          </button>
                        ))}
                      </div>
                    )}
                    {s.blocs.map((b, idx) => {
                      const cle = `m:${s.id}#${idx}`;
                      const estAncrage = s.sous?.some((ss) => ss.from === idx);
                      return (
                        <div
                          key={idx}
                          data-bloc-anchor={estAncrage ? `${s.id}:${idx}` : undefined}
                        >
                        <BlocView
                          b={b}
                          cle={cle}
                          domaine="m"
                          cache={modeHafiz && b.kind === 'point' && !b.cible && !revelves.has(cle)}
                          revele={revelves.has(cle)}
                          onReveler={() => setRevelves((prev) => new Set(prev).add(cle))}
                          onNoter={(n) => noter(cle, n)}
                          onAller={allerSection}
                          notes={prog.evals[cle]}
                          taille={taille}
                          q={q}
                        />
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* ── Unités du domaine : ICÔNES (une icône = une unité du livre) ── */}
      {!resultats && onglet !== 'm' && ouverte === null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="okacha-unites-icones">
          {unites.map((u) => {
            const th = THEME[u.domaine as ThemeCle];
            const lue = prog.lus.includes(u.id);
            const nbNot = notationsUnite(prog, u.id);
            return (
              <button
                key={u.id}
                onClick={() => setOuverte(u.id)}
                data-testid={`okacha-unite-${u.id}`}
                className={`group p-5 rounded-3xl border-2 ${th.bord} bg-white dark:bg-[#161c18] hover:shadow-lg transition-all text-right flex items-start gap-4`}
              >
                <span className={`shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-2xl ${th.actif} shadow-md group-hover:scale-105 transition-transform`}>
                  <Icone cle={okachaUniteIcone(u.id, u.domaine)} className="w-7 h-7" />
                </span>
                <span className="flex-1 min-w-0 space-y-1">
                  <span className="flex items-start gap-2">
                    <span
                      data-testid={`unite-numero-${u.id}`}
                      className={`inline-flex items-center justify-center h-6 px-2 rounded-lg ${th.num} text-[11px] font-black shrink-0`}
                    >
                      وحدة {numeroUniteHosila(u.id)}
                    </span>
                    <span className="text-sm font-black text-gray-800 dark:text-gray-100">{u.uniteAr}</span>
                    {lue && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                  </span>
                  <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500">📖 {u.sourceRange}</span>
                  <span className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${th.num} text-[10px] font-black`}>
                      {u.nbPoints} نقطة
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-black text-gray-500 dark:text-gray-400">
                      {u.blocs.length} بطاقة
                    </span>
                    {nbNot > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                        🗳 {nbNot}
                      </span>
                    )}
                  </span>
                </span>
                <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-all shrink-0 mt-4" />
              </button>
            );
          })}
        </div>
      )}
      {/* ── Contenu de l'unité ouverte + BANDE d'unités (icône après icône) ── */}
      {!resultats && onglet !== 'm' && uniteCourante && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setOuverte(null)}
              data-testid="okacha-retour-unites"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
            >
              <span>→</span>
              <span>عودة إلى وحدات المجال</span>
            </button>
            <span className="flex items-center gap-2 text-sm font-black text-gray-800 dark:text-gray-100">
              <Icone cle={okachaUniteIcone(uniteCourante.id, uniteCourante.domaine)} className="w-4 h-4" />
              {uniteCourante.uniteAr}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap" data-testid="bande-unites-okacha">
            {unites.map((v) => (
              <button
                key={v.id}
                onClick={() => setOuverte(v.id)}
                title={v.uniteAr}
                data-testid={`bande-unite-okacha-${v.id}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition-colors ${
                  v.id === uniteCourante.id
                    ? THEME[v.domaine as ThemeCle].actif
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                <Icone cle={okachaUniteIcone(v.id, v.domaine)} className="w-3.5 h-3.5" />
                وحدة {numeroUniteHosila(v.id)}
              </button>
            ))}
          </div>

          <section className={`rounded-3xl border ${THEME[uniteCourante.domaine as ThemeCle].bord} bg-white dark:bg-[#161c18] overflow-hidden`}>
            <header className={`flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-l ${THEME[uniteCourante.domaine as ThemeCle].grad}`}>
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500">📖 {uniteCourante.sourceRange}</span>
              <button
                onClick={() => setProg((p) => toggleUniteLue(p, uniteCourante.id))}
                data-testid={`lu-${uniteCourante.id}`}
                title={prog.lus.includes(uniteCourante.id) ? 'محفوظة — اضغط للتراجع' : 'علّم الوحدة كمحفوظة'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition-colors ${
                  prog.lus.includes(uniteCourante.id)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/70 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-emerald-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {prog.lus.includes(uniteCourante.id) ? 'محفوظة' : 'علّم كمحفوظة'}
              </button>
            </header>
            <div className="px-4 pb-4 pt-2">
              <div className="flex items-center justify-between mb-2 text-[10px] font-black text-gray-400 dark:text-gray-500 print:hidden">
                <span>
                  {notationsUnite(prog, uniteCourante.id) > 0
                    ? `🗳 تقييماتك في هذه الوحدة : ${notationsUnite(prog, uniteCourante.id)}`
                    : modeHafiz ? 'اخفِ · اكشف · قيّم أداء حفظك' : 'فعّل « وضع الحفظ » للاختبار الذاتي'}
                </span>
                {modeHafiz && (
                  <button onClick={() => setRevelves(new Set())} className="inline-flex items-center gap-1 hover:text-gray-600">
                    <RotateCcw className="w-3 h-3" /> إعادة الإخفاء
                  </button>
                )}
              </div>
              {uniteCourante.blocs.map((b, idx) => {
                // Lot A : déchets OCR masqués — idx d'origine conservé (cles SM-2).
                if (estDechetOCR(b.texte)) return null;
                const cle = `${uniteCourante.id}#${idx}`;
                return (
                  <BlocView
                    key={idx}
                    b={{ ...b, texte: assainirTexte(b.texte) }}
                    cle={cle}
                    domaine={uniteCourante.domaine as ThemeCle}
                    cache={modeHafiz && b.kind === 'point' && !revelves.has(cle)}
                    revele={revelves.has(cle)}
                    onReveler={() => setRevelves((prev) => new Set(prev).add(cle))}
                    onNoter={(n) => noter(cle, n)}
                    notes={prog.evals[cle]}
                    taille={taille}
                    q={q}
                  />
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
