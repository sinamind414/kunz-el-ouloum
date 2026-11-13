// BacCorrectionPanel.tsx — « التصحيح حسب الدورة » : la vérité sur les corrigés.
//
// Avant : la banque BAC annonçait des « sujets corrigés » sans que l'élève
// sache lesquels l'étaient vraiment. Après : pour CHAQUE session 2016→2026,
// l'écran dit ce qui est intégré (12 questions de barème officiel 2023→2025,
// 80 attendus), ce qui ne l'est pas (lien vers le corrigé officiel externe),
// et ce qui manque (2021 S2 E1). Aucun énoncé ni corrigé n'est inventé :
// l'évaluation vient de `baremeCorrecteur.evaluerBareme`, les textes affichés
// sont les attendus officiels du dictionnaire.
//
// Position produit : correction DIAGNOSTIC, jamais une note de jury.

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ExternalLink, FileText } from 'lucide-react';
import {
  AVERTISSEMENT_ENONCES_BAC,
  AVERTISSEMENT_NOTE_BAC,
  COUVERTURE_BAC,
  LIBELLE_NIVEAU_BAC,
  RATTRAPAGE_BAC,
  STATS_COUVERTURE_BAC,
  couvertureBacSession,
  questionsBaremePourAnnee,
} from '../data/bacCorrectionIndex';
import { YEARS_COVERED } from '../data/bacSessionIndex';
import {
  evaluerBareme,
  type ResultatBareme,
} from '../data/dictionaries/baremeCorrecteur';

interface Props {
  /** Année sélectionnée dans « أفكار التمارين » (null = toutes). */
  annee?: number | null;
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, '');
}

export default function BacCorrectionPanel({ annee = null }: Props) {
  const [anneeChoisie, setAnneeChoisie] = useState<number>(
    annee && couvertureBacSession(annee) ? annee : 2025,
  );
  useEffect(() => {
    if (annee && couvertureBacSession(annee)) setAnneeChoisie(annee);
  }, [annee]);

  const couverture = couvertureBacSession(anneeChoisie)!;
  const questions = useMemo(() => questionsBaremePourAnnee(anneeChoisie), [anneeChoisie]);
  const [questionId, setQuestionId] = useState<string>('');
  const [reponse, setReponse] = useState('');
  const [resultat, setResultat] = useState<ResultatBareme | null>(null);

  // Changer d'année ou de question invalide un verdict périmé : on ne laisse
  // jamais une note calculée pour une autre question à l'écran.
  useEffect(() => {
    setQuestionId('');
    setResultat(null);
  }, [anneeChoisie]);

  const corriger = () => {
    if (!questionId) return;
    setResultat(evaluerBareme(reponse, questionId));
  };

  return (
    <section
      data-testid="bac-correction-panel"
      dir="rtl"
      className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#006d37]/30 mb-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="text-right">
          <h2 className="flex items-center gap-2 text-base font-black text-[#1f1c0b] dark:text-gray-100">
            <FileText className="w-4 h-4" />
            التصحيح حسب دورة البكالوريا
          </h2>
          <p className="text-[11px] leading-6 text-[#506072] dark:text-gray-400">
            {STATS_COUVERTURE_BAC.annees} دورات مُفهرسة ({STATS_COUVERTURE_BAC.premiereAnnee}–
            {STATS_COUVERTURE_BAC.derniereAnnee}) · {STATS_COUVERTURE_BAC.nbQuestionsBareme} سؤالاً
            بمقياس رسمي مُدمج · {STATS_COUVERTURE_BAC.nbItemsBareme} بنداً رسمياً ·{' '}
            {STATS_COUVERTURE_BAC.nbSujetsIntegraux} موضوع كامل داخل التطبيق
          </p>
        </div>
        <label className="flex items-center gap-2 text-[11px] font-bold text-[#506072] dark:text-gray-300">
          الدورة:
          <select
            data-testid="bac-annee"
            value={anneeChoisie}
            onChange={(e) => setAnneeChoisie(Number(e.target.value))}
            className="px-2 py-1.5 rounded-xl bg-[#f3f4f5] dark:bg-[#1f2622] border border-[#bbcbbb]/30 text-[#1f1c0b] dark:text-gray-100 cursor-pointer"
          >
            {YEARS_COVERED.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        data-testid="bac-couverture"
        className="rounded-2xl p-3 bg-[#f8fbfa] dark:bg-black/20 border border-[#bbcbbb]/30 mb-3"
      >
        <p data-testid="bac-niveau" className="text-[12px] font-black text-[#006d37] dark:text-[#2ecc71] text-right mb-2">
          {anneeChoisie} — {LIBELLE_NIVEAU_BAC[couverture.niveau].ar}
        </p>
        <p className="text-[11px] leading-6 text-[#506072] dark:text-gray-300 text-right mb-2">
          {couverture.nbIdees} أفكار تمارين · الموضوع الأول {couverture.pointsSujet1}/20 · الموضوع الثاني{' '}
          {couverture.pointsSujet2}/20 ·{' '}
          {couverture.nbQuestionsBareme > 0
            ? `${couverture.nbQuestionsBareme} أسئلة مقياس / ${couverture.nbItemsBareme} بنداً مُدمجاً`
            : 'لا مقياس رسمي مُدمج لهذه الدورة'}
          {couverture.sujetIntegral && ' · الموضوع الكامل 2025 متاح داخل التطبيق (التصحيح بعد الإرسال)'}
        </p>
        <div className="flex flex-wrap gap-3 text-[11px] font-bold">
          <a
            href={couverture.sujetUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[#006d37] dark:text-[#2ecc71] underline"
          >
            الموضوع الرسمي <ExternalLink className="w-3 h-3" />
          </a>
          <a
            data-testid="bac-lien-correction"
            href={couverture.correctionUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[#006d37] dark:text-[#2ecc71] underline"
          >
            الإجابة النموذجية الرسمية <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {couverture.lacunes.length > 0 && (
        <div
          data-testid="bac-lacune"
          className="flex items-start gap-2 rounded-2xl p-3 mb-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-800/40"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
          <p className="text-[11px] leading-6 text-amber-900 dark:text-amber-300 text-right">
            <span className="font-black">فجوة مُعلَنة: </span>
            {couverture.lacunes.map((l) => `الموضوع ${l.sujet}: ${l.raison}`).join(' · ')}. المجموع{' '}
            {couverture.pointsSujet2}/20 بدل 20 — لم يُضَف أي تمرين من عندنا.
          </p>
        </div>
      )}

      <p
        data-testid="bac-avertissement-enonces"
        className="text-[11px] leading-6 text-[#506072] dark:text-gray-400 text-right mb-3"
      >
        {AVERTISSEMENT_ENONCES_BAC.ar}
      </p>

      {questions.length > 0 ? (
        <div className="rounded-2xl p-3 bg-[#fff9ed] dark:bg-black/20 border border-[#d9a400]/30">
          <p className="text-[12px] font-black text-[#8a6a00] dark:text-[#d9a400] text-right mb-2">
            صحّح جوابك على مقياس رسمي مُدمج ({anneeChoisie})
          </p>
          <label className="block text-[11px] font-bold text-[#506072] dark:text-gray-300 text-right mb-1">
            السؤال:
            <select
              data-testid="bac-select-question"
              value={questionId}
              onChange={(e) => {
                setQuestionId(e.target.value);
                setResultat(null);
              }}
              className="w-full mt-1 px-2 py-2 rounded-xl bg-white dark:bg-[#141916] border border-[#bbcbbb]/30 text-[12px] text-[#1f1c0b] dark:text-gray-100 cursor-pointer"
            >
              <option value="">اختر سؤالاً من المقياس الرسمي</option>
              {questions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.labelAr} — {fmt(q.totalPoints)} ن
                </option>
              ))}
            </select>
          </label>
          <textarea
            data-testid="bac-reponse"
            value={reponse}
            onChange={(e) => setReponse(e.target.value)}
            rows={4}
            placeholder="اكتب جوابك هنا ثم اطلب التحليل مقابل البنود الرسمية…"
            className="w-full mt-2 rounded-xl p-3 text-[12px] leading-7 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30 text-[#1f1c0b] dark:text-gray-100 text-right"
          />
          <button
            data-testid="bac-corriger"
            onClick={corriger}
            disabled={!questionId}
            className="mt-2 px-4 py-2 rounded-xl bg-[#006d37] text-white text-[11px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            حلّل جوابي مقابل المقياس
          </button>

          {resultat && (
            <div data-testid="bac-resultat" className="mt-3 rounded-xl border border-[#bbcbbb]/40 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#141916]">
                <span className="text-[11px] font-black text-[#1f1c0b] dark:text-gray-100">{resultat.labelAr}</span>
                <span className="text-[12px] font-black text-[#006d37] dark:text-[#2ecc71]">
                  {fmt(resultat.pointsObtenus)} / {fmt(resultat.pointsTotal)} ن
                </span>
              </div>
              <ul className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {resultat.verdicts.map((v) => (
                  <li key={v.item.id} className="px-3 py-2 flex items-start gap-2 bg-[#f8fbfa] dark:bg-black/20">
                    <span
                      className={`shrink-0 mt-0.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                        v.credite
                          ? 'bg-emerald-500 text-white'
                          : v.mode === 'manuelle'
                            ? 'bg-amber-400 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}
                    >
                      {v.credite ? '✓' : v.mode === 'manuelle' ? '؟' : ''}
                    </span>
                    <div className="min-w-0 flex-1 text-right">
                      <p className="text-[11px] leading-6 text-[#1f1c0b] dark:text-gray-200" dir="auto">
                        {v.item.ar || v.item.fr}
                      </p>
                      {v.credite && v.via.length > 0 && (
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                          صيغ مقبولة رُصدت: {v.via.map((x) => x.terme).join('، ')}
                        </p>
                      )}
                      {v.mode === 'manuelle' && !v.credite && (
                        <p className="text-[10px] text-amber-700 dark:text-amber-400">
                          بند يدوي — تقديره للمصحح، لا يُحتسب آلياً
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] font-black text-[#506072]">{fmt(v.item.points)} ن</span>
                  </li>
                ))}
              </ul>
              <p className="px-3 py-2 text-[10px] leading-5 text-[#506072] dark:text-gray-400 bg-white dark:bg-[#141916]">
                {resultat.nbAuto} بنود آلية · {resultat.nbManuelles} بنود يدوية · {AVERTISSEMENT_NOTE_BAC.ar}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div
          data-testid="bac-correction-externe"
          className="rounded-2xl p-3 bg-[#f8fbfa] dark:bg-black/20 border border-[#bbcbbb]/30"
        >
          <p className="text-[11px] leading-6 text-[#506072] dark:text-gray-300 text-right">
            <span className="font-black text-[#1f1c0b] dark:text-gray-100">لا تصحيح مُدمج لهذه الدورة. </span>
            لم يُدوَن مقياسها الرسمي بنداً ببند داخل التطبيق؛ لذلك لا نعرض هنا رقماً تقديرياً ولا
            « إجابة نموذجية » من عندنا. استعمل رابط « الإجابة النموذجية الرسمية » أعلاه، ثم قارن
            جوابك بفكرة التمرين وسنداته في البطاقات أدناه.
          </p>
        </div>
      )}

      <p
        data-testid="bac-rattrapage"
        className="mt-3 text-[10px] leading-5 text-[#506072] dark:text-gray-500 text-right"
      >
        {RATTRAPAGE_BAC.ar}
      </p>
      <p className="mt-1 text-[10px] leading-5 text-[#506072] dark:text-gray-500 text-right">
        {COUVERTURE_BAC.filter((c) => c.niveau === 'idees-seules').length} دورات على{' '}
        {STATS_COUVERTURE_BAC.annees} تعتمد على الأفكار + الروابط الرسمية فقط.
      </p>
    </section>
  );
}
