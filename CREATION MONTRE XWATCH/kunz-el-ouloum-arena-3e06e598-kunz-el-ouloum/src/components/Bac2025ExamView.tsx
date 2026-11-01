// Bac2025ExamView.tsx — LA BOUCLE ÉLÈVE DE BOUT EN BOUT (Pierre 2, R6).
//
// L'élève choisit un sujet officiel 2025, répond aux 3 exercices, soumet :
// la note = couverture des ATTENDUS OBLIGATOIRES × max, par exercice (5/7/8)
// puis total /20 — plafonnée par l'intégrité (salade/négations/perroquet).
// Aucun dénominateur caché : le registre est la seule source (attendusBac2025).
//
// B3 (audit « ligne par ligne », 2026-10-17) : le sujet 2025 était UNE ENTRÉE
// DE PLUS dans l'app sans chrono ni mention des documents. Ajouts :
//   1. chronomètre officiel 4 h 30 (270 min), persistant, lu sur l'horloge
//      (même logique que MockExamPanel : examSession/examTimer, on ne compte
//      plus le temps, on le LIT) — avec sa propre clé de stockage pour ne pas
//      écraser la session du simulateur de sujets blancs ;
//   2. avis honnête : les textes et documents officiels du sujet ne sont pas
//      inclus dans l'app — l'élève les lit sur le sujet imprimé (ONEC).
//   3. l'épreuve est déclarée à `declarerExamen` pendant toute la vue (le
//      guide se tait, comme pendant le simulateur).

import { useEffect, useState } from 'react';
import { ClipboardList, Clock, FileText, History, Pause, Play, RotateCcw, Send, ShieldCheck, Trash2 } from 'lucide-react';
import { listeGroupesBac2025, attendusDeGroupe } from '../data/dictionaries/attendusBac2025';
import { noterCopieCalibree } from '../data/dictionaries/calibrationBac2025';
import { demarrer, mettreEnPause, minutesEcoulees, remettreAZero, type ExamSession } from '../data/examSession';
import { formatDuree, phaseEpreuve } from '../data/examTimer';
import { DUREE_EPREUVE_MINUTES } from '../data/mockExam';
import { declarerExamen } from '../lib/examenEnCours';
import SectionObligatoire from './SectionObligatoire';
import Dictaphone from './Dictaphone';
import { logExamAttempt, getExamAttempts, getExamStats, clearExamLog, type ExamAttempt } from '../utils/examLog';
import { fmtDateLatn } from '../utils/latinDigits';

const GROUPES = listeGroupesBac2025();

// Session 2025 DISTINCTE de la session du simulateur (kunz.examSession) :
// les deux épreuves doivent pouvoir vivre sans s'écraser leur chronomètre.
const EXAM2025_KEY = 'kunz.exam2025Session';
const SESSION2025_VIDE: ExamSession = { numero: 1, cumulMinutes: 0, demarreeA: null };

function lireSession2025(): ExamSession {
  try {
    const brut = localStorage.getItem(EXAM2025_KEY);
    if (!brut) return SESSION2025_VIDE;
    const p = JSON.parse(brut) as Partial<ExamSession>;
    return {
      numero: 1,
      cumulMinutes:
        typeof p.cumulMinutes === 'number' && Number.isFinite(p.cumulMinutes) && p.cumulMinutes >= 0
          ? p.cumulMinutes
          : 0,
      demarreeA: typeof p.demarreeA === 'number' && Number.isFinite(p.demarreeA) && p.demarreeA > 0 ? p.demarreeA : null,
    };
  } catch {
    return SESSION2025_VIDE;
  }
}

function ecrireSession2025(session: ExamSession): void {
  try {
    localStorage.setItem(EXAM2025_KEY, JSON.stringify(session));
  } catch {
    /* stockage indisponible : le chrono reste utilisable, sans mémoire */
  }
}

const PHASE_LABEL_2025: Record<string, string> = {
  lecture: 'قراءة الموضوع',
  redaction: 'التحرير',
  relecture: 'المراجعة النهائية',
  termine: 'انتهى الوقت',
};

export default function Bac2025ExamView({ onClose }: { onClose: () => void }) {
  const [sujet, setSujet] = useState<1 | 2>(1);
  const [reponses, setReponses] = useState<Record<1 | 2 | 3, string>>({ 1: '', 2: '', 3: '' });
  const [soumis, setSoumis] = useState(false);
  const [copie, setCopie] = useState<ReturnType<typeof noterCopieCalibree> | null>(null);
  const [historiqueOuvert, setHistoriqueOuvert] = useState(false);
  const [historique, setHistorique] = useState<ExamAttempt[]>(() => getExamAttempts());

  // B3 : chronomètre persistant, lu sur l'horloge (jamais compté par les ticks).
  const [session, setSession] = useState<ExamSession>(() => lireSession2025());
  const [, forcerRendu] = useState(0);

  // Pendant la vraie épreuve, le guide (المرشد) se tait — au MONTAGE comme au
  // DÉMONTAGE de la vue (declarerExamen est idempotent).
  useEffect(() => {
    declarerExamen(true);
    return () => declarerExamen(false);
  }, []);

  // Le tick ne COMPTE pas le temps : il rafraîchit seulement l'affichage.
  useEffect(() => {
    if (session.demarreeA === null) return undefined;
    const id = setInterval(() => forcerRendu((n) => n + 1), 15_000);
    return () => clearInterval(id);
  }, [session.demarreeA]);

  const majSession = (suivante: ExamSession) => {
    ecrireSession2025(suivante);
    setSession(suivante);
  };

  const reset = (nouveauSujet?: 1 | 2) => {
    setSoumis(false);
    setCopie(null);
    setReponses({ 1: '', 2: '', 3: '' });
    if (nouveauSujet) setSujet(nouveauSujet);
    majSession(remettreAZero(session));
  };

  // Soumission : note calculée UNE fois, archivée (historique + dashboard si compte).
  const soumettre = () => {
    const c = noterCopieCalibree([reponses[1], reponses[2], reponses[3]], sujet);
    setCopie(c);
    setSoumis(true);
    // B3 : la remise fige le chrono (consolidation de la période en cours).
    majSession(mettreEnPause(session));
    logExamAttempt({
      sujet,
      total: c.total,
      exercices: c.exercices.map((n) => ({
        sujet: n.sujet,
        exercice: n.exercice,
        points: n.points,
        maxPts: n.maxPts,
        couverture: Math.round(n.couverture * 100) / 100,
      })),
    });
    setHistorique(getExamAttempts());
  };

  // B3 : valeurs LUES sur l'horloge à chaque rendu — pause/rechargement inclus.
  const enMarche = session.demarreeA !== null;
  const ecoulee = minutesEcoulees(session);
  const phase = phaseEpreuve(ecoulee, DUREE_EPREUVE_MINUTES);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir="rtl">
      <div className="max-w-3xl mx-auto p-4 md:p-6 pb-24 space-y-4">
        {/* En-tête */}
        <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-emerald-400" />
                الإطار الرسمي — بكالوريا 2025
              </h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHistoriqueOuvert((o) => !o)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 flex items-center gap-1"
                >
                  <History className="w-3.5 h-3.5" />
                  سجل النقاط
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  إغلاق
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              أجب عن التمارين الثلاثة، ثم سُلِّم لتشاهد التنقيط الإلزامي على مقتضيات الإجابة الرسمية
              (البناء المثبت + التصحيح النموذجي الرسمي). التقدير آلي على المقتضيات فقط — جودة الصياغة
              والبنود التقديرية تقديرها للمصحح.
            </p>
          </div>
        </div>

        {/* Choix du sujet */}
        <div className="grid grid-cols-2 gap-3">
          {([1, 2] as const).map((s) => (
            <button
              key={s}
              disabled={soumis}
              onClick={() => reset(s)}
              className={`p-3 rounded-2xl border-2 text-right font-black text-sm transition-all ${
                sujet === s
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:border-gray-300'
              } ${soumis && sujet !== s ? 'opacity-40' : ''}`}
            >
              الموضوع {s === 1 ? 'الأول' : 'الثاني'}
              <span className="block text-[10px] font-bold text-gray-400 mt-1">
                خلايا مفترزة/جلوكوز · بيرنويدة/SOD · الشاي/نقل الدم — 20 نقطة
              </span>
            </button>
          ))}
        </div>

        {/* Historique des notes (décision propriétaire : historique de notes) */}
        {historiqueOuvert && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-black/20 border-b border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
              <p className="text-xs font-black text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-emerald-600" />
                سجل النقاط ({historique.length} محاولة)
              </p>
              {historique.length > 0 && (
                <button
                  onClick={() => {
                    clearExamLog();
                    setHistorique([]);
                  }}
                  className="text-[10px] font-bold text-red-500 hover:text-red-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  مسح السجل
                </button>
              )}
            </div>
            {historique.length === 0 ? (
              <p className="px-4 py-4 text-[11px] font-bold text-gray-400">
                لا محاولات مؤرشفة بعد — سلّم إطاراً كاملاً ليظهر هنا سجلك.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {[...historique].reverse().map((a) => (
                  <li key={a.id} className="px-4 py-2.5 flex items-center gap-3">
                    <span
                      className={`text-base font-black w-12 shrink-0 ${a.total >= 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}
                    >
                      {a.total}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-black text-gray-700 dark:text-gray-300">
                        الموضوع {a.sujet === 1 ? 'الأول' : 'الثاني'}
                        <span className="font-bold text-gray-400"> · {fmtDateLatn(new Date(a.dateISO))}</span>
                      </p>
                      <div className="flex gap-1 mt-1" aria-label={`التمارين: ${a.exercices.map((e) => e.points + '/' + e.maxPts).join(' · ')}`}>
                        {a.exercices.map((e) => (
                          <span
                            key={e.exercice}
                            title={`التمرين ${e.exercice}: ${e.points}/${e.maxPts}`}
                            className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-black text-gray-500 dark:text-gray-400"
                          >
                            ت{e.exercice} {e.points}/{e.maxPts}
                          </span>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* B3 — chrono officiel 4 h 30 (persistant, lu sur l'horloge) */}
        <div
          data-testid="bac2025-chrono"
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-black text-gray-700 dark:text-gray-300">
                المدة الرسمية : 4 سا و 30 د —{' '}
                <span aria-label="الزمن المنقضي">{formatDuree(ecoulee)}</span> /{' '}
                {formatDuree(DUREE_EPREUVE_MINUTES)}
              </p>
              <p className="text-[10px] font-bold text-gray-400">{PHASE_LABEL_2025[phase]}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              data-testid="bac2025-chrono-toggle"
              onClick={() => majSession(enMarche ? mettreEnPause(session) : demarrer(session))}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-black flex items-center gap-1"
            >
              {enMarche ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{enMarche ? 'إيقاف مؤقت' : 'بدء الزمن'}</span>
            </button>
            <button
              onClick={() => majSession(remettreAZero(session))}
              aria-label="تصفير الزمن"
              className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 text-[11px] font-black"
            >
              تصفير
            </button>
          </div>
        </div>

        {/* B3 — avis honnête : les documents officiels ne sont pas dans l'app */}
        <div
          data-testid="bac2025-avis-documents"
          className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-[11px] font-bold text-amber-900 dark:text-amber-200 leading-relaxed"
        >
          تنبيه : نصوص الموضوعين الرسميين ومستنداتهما (الرسوم والجداول) غير مُضمَّنة في التطبيق.
          اقرأ الموضوع الأصلي في ورقة الامتحان أو في أرشيف ONEC، ثم حرِّر إجاباتك هنا؛ فالتقويم
          يجري على مقتضيات الإجابة الرسمية لا على إعادة طباعة الموضوع.
        </div>

        {/* Les 3 exercices */}
        {([1, 2, 3] as const).map((ex) => {
          const g = attendusDeGroupe(sujet, ex);
          return (
            <div
              key={ex}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <div className="px-4 py-3 bg-gray-50 dark:bg-black/20 border-b border-gray-100 dark:border-gray-800/60 flex items-start justify-between gap-2">
                <p className="text-xs font-black text-gray-700 dark:text-gray-300 leading-relaxed" dir="auto">
                  <FileText className="w-3.5 h-3.5 inline-block ml-1 text-emerald-600" />
                  {g.questionAr}
                </p>
                <span className="shrink-0 text-[10px] font-black text-gray-400">{g.maxPts} ن</span>
              </div>
              <div className="p-3">
                <textarea
                  aria-label={`التمرين ${ex}`}
                  disabled={soumis}
                  value={reponses[ex]}
                  onChange={(e) => setReponses((r) => ({ ...r, [ex]: e.target.value }))}
                  placeholder="اكتب إجابتك هنا…"
                  rows={ex === 1 ? 4 : 6}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black/20 text-xs leading-relaxed text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                />
                {/* Micro-dictée (demande 2026-10-16) — désactivé après la remise. */}
                <div className="mt-1">
                  <Dictaphone
                    zone={`examen-ex${ex}`}
                    disabled={soumis}
                    onTranscript={(t) => setReponses((r) => ({ ...r, [ex]: r[ex] ? `${r[ex]} ${t}` : t }))}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Actions */}
        {!soumis ? (
          <button
            onClick={soumettre}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            <Send className="w-4 h-4" />
            تسليم التصحيح — التنقيط الإلزامي /20
          </button>
        ) : (
          <div className="space-y-4">
            {/* Total */}
            <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  النقطة الأولية الآلية — الموضوع {sujet === 1 ? 'الأول' : 'الثاني'}
                </p>
                <p className="text-[10px] font-bold text-gray-500 mt-0.5">
                  على مقتضيات الإجابة الرسمية فقط · سقوف النزاهة مطبقة · القرار النهائي للمصحح
                </p>
              </div>
              <span className="text-3xl font-black text-emerald-700 dark:text-emerald-300" aria-label="النقطة الإجمالية">
                {copie!.total}<span className="text-base text-gray-400">/20</span>
              </span>
            </div>

            {/* Détail par exercice — la même section que le panneau correcteur */}
            {copie!.exercices.map((n) => (
              <SectionObligatoire key={`${n.sujet}-${n.exercice}`} note={n} />
            ))}

            <button
              onClick={() => reset()}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              محاولة جديدة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
