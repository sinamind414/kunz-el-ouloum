// TadwinView.tsx — التدوين الشامل — parcours des 5 paliers (Spec §5).
//
// Vue dédiée : l'apprentissage de la méthode est formulaire + verdict, pas un
// fil de discussion. Câblée via l'onglet secondaire 'tadwin' dans App.tsx.
// Toute la logique vit dans lib/tadwin/tadwinEngine.ts (pure, testée) ; ici
// uniquement présentation + état local React.
//
// Chronomètre doux : FocusTimer.tsx est un Pomodoro complet (préréglages,
// phases, réglages) — trop envahissant pour une écriture courte de 3 clés.
// On intègre un minuteur léger sans alarme, comme l'esprit « chronomètre doux ».

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight,
  BookOpen,
  Clock,
  KeyRound,
  Lightbulb,
  RefreshCw,
  Trophy,
} from 'lucide-react';
import { TADWIN_UNITES, clesDeUnite } from '../data/tadwinCles';
import {
  PALIERS,
  PALIER_MAX,
  configPalier,
  lireEtat,
  ecrireEtat,
  lireFiches,
  enregistrerFiche,
  enregistrerRappel,
  evaluerProduction,
  retourDirect,
  avancerPalier,
  demarrerDefi,
  defiEnCours,
  joursRestantsDefi,
  ETIQUETTE_NOTATION,
  type EtatTadwin,
  type FicheTadwin,
  type ResultatTadwin,
  type EvenementPalier,
} from '../lib/tadwin/tadwinEngine';
import type { ChoixCles } from '../lib/validation/couvCle';

type EtapePalier3 = 'choix' | 'ecriture' | 'verdict';

const DUREE_ECRITURE_S = 5 * 60;

function compterMots(texte: string): number {
  return texte.trim().split(/\s+/).filter(Boolean).length;
}

export default function TadwinView({ onBackToHome }: { onBackToHome: () => void }) {
  const [etat, setEtat] = useState<EtatTadwin>(() => lireEtat());
  const [fiches, setFiches] = useState<FicheTadwin[]>(() => lireFiches());

  // Palier 0 — restitution (la preuve de l'oubli).
  const [restitution, setRestitution] = useState('');
  const [messageChoc, setMessageChoc] = useState<string | null>(null);

  // Palier 1 — clé mécanisme dans le gabarit pré-rempli.
  const [cle1, setCle1] = useState('');

  // Palier 2 — pratique assistée.
  const [assistee, setAssistee] = useState('');
  const [indice, setIndice] = useState<string | null>(null);

  // Palier 3 — production autonome notée.
  const [etape, setEtape] = useState<EtapePalier3>('choix');
  const [cochees, setCochees] = useState<string[]>([]);
  const [reponse, setReponse] = useState('');
  const [resultat, setResultat] = useState<ResultatTadwin | null>(null);
  const [secondes, setSecondes] = useState(DUREE_ECRITURE_S);

  // Palier 4 — rappel (carnet masqué).
  const [reveleeId, setReveleeId] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const majEtat = useCallback((next: EtatTadwin) => {
    setEtat(next);
    ecrireEtat(next);
  }, []);

  const rafraichirFiches = useCallback(() => setFiches(lireFiches()), []);

  // Chronomètre doux du palier 3 : décompte silencieux, sans alarme.
  useEffect(() => {
    if (etat.palier !== 3 || etape !== 'ecriture') return;
    intervalRef.current = setInterval(() => {
      setSecondes((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [etat.palier, etape]);

  const unite = TADWIN_UNITES.find((u) => u.uniteId === etat.uniteId);
  const cles = clesDeUnite(etat.uniteId);
  const config = configPalier(etat.palier);
  const alerteLive = etat.palier === 2 ? retourDirect(assistee) : null;

  // ── Transitions de paliers ────────────────────────────────────────────────

  const validerPalier = (evenement: EvenementPalier) => {
    const next = avancerPalier(etat, evenement);
    if (next.palier !== etat.palier) majEtat(next);
    return next;
  };

  const choisirUnite = (uniteId: number) => majEtat({ ...etat, uniteId });

  const demarrer = () => majEtat(demarrerDefi());

  const terminerRestitution = () => {
    if (!restitution.trim()) return;
    validerPalier({ type: 'rappel_tente' });
    setMessageChoc('المشكلة ليست في ذاكرتك، بل في طريقة تدوينك');
  };

  const terminerCle1 = () => {
    if (!cle1.trim()) return;
    validerPalier({ type: 'cle1_ecrite' });
  };

  const terminerAssistee = () => {
    if (!assistee.trim()) return;
    validerPalier({ type: 'fiche_assistee_terminee' });
  };

  // ── Palier 3 : sélection puis écriture ────────────────────────────────────

  const validerChoixCles = () => {
    if (cochees.length < 2 || cochees.length > 3) return;
    setEtape('ecriture');
    setSecondes(DUREE_ECRITURE_S);
  };

  const soumettreProduction = () => {
    if (!reponse.trim() || !cles) return;
    const choix: ChoixCles = { uniteId: etat.uniteId, clesChoisies: cochees };
    try {
      const res = evaluerProduction(reponse, choix);
      enregistrerFiche(reponse, choix);
      rafraichirFiches();
      setResultat(res);
      setEtape('verdict');
    } catch {
      // ChoixClesInvalide — ne devrait pas arriver (choix validé en amont).
      setResultat(null);
    }
  };

  const terminerProduction = () => {
    validerPalier({ type: 'fiche_autonome_terminee' });
    setEtape('choix');
    setCochees([]);
    setReponse('');
    setResultat(null);
  };

  // ── Palier 4 : rappel espacé ──────────────────────────────────────────────

  const repondreRappel = (fiche: FicheTadwin, reussi: boolean) => {
    enregistrerRappel(fiche, reussi);
    rafraichirFiches();
    setReveleeId(null);
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────

  const maintenant = Date.now();
  const dues = fiches.filter((f) => f.prochainRappelAt != null && maintenant >= f.prochainRappelAt);
  const maitrises = fiches.filter((f) => f.maitrise === 'maitrise');
  const chasseurZabda = maitrises.length >= 3;

  return (
    <div dir="rtl" className="flex flex-col h-full bg-[#f8fbfa] overflow-y-auto">
      {/* En-tête */}
      <div className="bg-[#fff9ed] border-b border-[#e2dabf]/60 px-5 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={onBackToHome}
          className="p-2 rounded-xl hover:bg-[#006d37]/10 text-[#006d37] transition-all cursor-pointer"
          title="العودة إلى القائمة الرئيسية"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#006d37]" />
          <h3 className="font-extrabold text-base text-[#006d37]">التدوين الشامل</h3>
        </div>
        {defiEnCours(etat, maintenant) && (
          <span className="mr-auto text-xs font-bold text-[#944a00] bg-[#944a00]/10 px-3 py-1.5 rounded-full">
            جرّب 3 أيام — باقٍ {joursRestantsDefi(etat, maintenant)} أيام
          </span>
        )}
      </div>

      {/* Indicateur de paliers */}
      <div className="px-5 py-3 flex items-center justify-center gap-2 bg-white border-b border-[#e2dabf]/40">
        {PALIERS.map((p) => (
          <div key={p.palier} className="flex items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                p.palier < etat.palier
                  ? 'bg-[#006d37] text-white'
                  : p.palier === etat.palier
                    ? 'bg-[#006d37]/15 text-[#006d37] ring-2 ring-[#006d37]/40'
                    : 'bg-[#e2dabf]/40 text-[#8a8570]'
              }`}
              title={`${p.nomAr} — ${p.nomFr}`}
            >
              {p.palier < etat.palier ? '✓' : p.palier}
            </div>
            {p.palier < PALIER_MAX && <div className="w-3 h-0.5 bg-[#e2dabf]" />}
          </div>
        ))}
      </div>

      <div className="flex-1 px-5 py-6 max-w-2xl mx-auto w-full space-y-5">
        <p className="text-center text-sm text-[#506072] font-semibold">
          {config.nomAr} — {config.nomFr}
        </p>

        {/* ─── Écran d'entrée : défi 3 jours + choix de l'unité ─── */}
        {etat.palier === 0 && etat.defiDebutAt == null && (
          <div className="bg-white rounded-3xl border border-[#e2dabf]/60 p-6 space-y-5 shadow-sm">
            <div className="text-center space-y-2">
              <p className="text-lg font-extrabold text-[#1f1c0b]">لا تنقل الدرس — استخرج زبدته</p>
              <p className="text-sm text-[#506072] leading-relaxed">
                جرّب 3 أيام فقط من التدوين الشامل: تلخّص كل درس في مفاتيح قليلة بأسلوبك أنت،
                وستتذكّره في الامتحان. ليست نقطة بكالوريا — بل طريقة تتدرّب عليها بالتدريج.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1f1c0b] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#006d37]" />
                اختر الدرس
              </label>
              <select
                data-testid="tadwin-unite-select"
                value={etat.uniteId}
                onChange={(e) => choisirUnite(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-[#e2dabf] bg-[#fffdf6] text-sm font-semibold text-[#1f1c0b] focus:outline-none focus:ring-2 focus:ring-[#006d37]/30"
              >
                {TADWIN_UNITES.map((u) => (
                  <option key={u.uniteId} value={u.uniteId}>
                    {u.uniteId}. {u.titre}
                  </option>
                ))}
              </select>
            </div>
            <button
              data-testid="tadwin-demarrer"
              onClick={demarrer}
              className="w-full py-3.5 rounded-2xl bg-[#006d37] text-white font-extrabold text-sm hover:bg-[#005a2e] transition-all cursor-pointer shadow-sm"
            >
              ابدأ التحدي — جرّب 3 أيام
            </button>
          </div>
        )}

        {/* ─── Palier 0 — الصدمة : la preuve de l'oubli ─── */}
        {etat.palier === 0 && etat.defiDebutAt != null && (
          <div className="bg-white rounded-3xl border border-[#e2dabf]/60 p-6 space-y-4 shadow-sm">
            <p className="text-sm font-bold text-[#1f1c0b]">
              اقرأ الدرس كالعادة، ثم استرجع من الذاكرة — دون النظر إليه — كل ما تتذكره عنه.
            </p>
            <textarea
              data-testid="tadwin-restitution"
              value={restitution}
              onChange={(e) => setRestitution(e.target.value)}
              placeholder="اكتب هنا ما تتذكره من الذاكرة…"
              rows={6}
              className="w-full p-4 rounded-2xl border border-[#e2dabf] bg-[#fffdf6] text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[#006d37]/30"
            />
            <button
              data-testid="tadwin-restitution-envoyer"
              onClick={terminerRestitution}
              disabled={!restitution.trim()}
              className="w-full py-3.5 rounded-2xl bg-[#006d37] text-white font-extrabold text-sm hover:bg-[#005a2e] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              انتهيت من الاسترجاع
            </button>
          </div>
        )}

        {/* ─── Palier 1 — موجّه : modelage + gabarit pré-rempli ─── */}
        {etat.palier === 1 && (
          <div className="space-y-4">
            {messageChoc && (
              <div className="bg-[#944a00]/10 border border-[#944a00]/30 rounded-2xl p-4 text-sm font-bold text-[#944a00]">
                {messageChoc}
              </div>
            )}
            <div className="bg-white rounded-3xl border border-[#e2dabf]/60 p-6 space-y-4 shadow-sm">
              <p className="text-sm font-bold text-[#1f1c0b] flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#006d37]" />
                هذه هي زبدة الدرس — مفاتيحه الثلاثة
              </p>
              <ul className="space-y-2">
                {cles?.map((c) => (
                  <li key={c.cle} className="text-sm bg-[#fff9ed] rounded-xl p-3 border border-[#e2dabf]/50">
                    <span className="font-extrabold text-[#006d37]">{c.cle}</span>
                    <span className="block text-xs text-[#8a8570] mt-1">{c.atoms.join(' • ')}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm font-bold text-[#1f1c0b]">
                اكتب المفتاح الأول (الآلية) بأسلوبك أنت — جملة واحدة تكفي.
              </p>
              <textarea
                data-testid="tadwin-cle1"
                value={cle1}
                onChange={(e) => setCle1(e.target.value)}
                placeholder="اكتب المفتاح الأول بأسلوبك…"
                rows={4}
                className="w-full p-4 rounded-2xl border border-[#e2dabf] bg-[#fffdf6] text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[#006d37]/30"
              />
              <button
                data-testid="tadwin-cle1-envoyer"
                onClick={terminerCle1}
                disabled={!cle1.trim()}
                className="w-full py-3.5 rounded-2xl bg-[#006d37] text-white font-extrabold text-sm hover:bg-[#005a2e] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                التالي
              </button>
            </div>
          </div>
        )}

        {/* ─── Palier 2 — مُساعَد : pratique guidée + retour en direct ─── */}
        {etat.palier === 2 && (
          <div className="bg-white rounded-3xl border border-[#e2dabf]/60 p-6 space-y-4 shadow-sm">
            <p className="text-sm font-bold text-[#1f1c0b]">
              الآن دوّن الزبدة بنفسك — الحقل فارغ. يمكنك طلب تلميح، ولا يُحتسب عليك شيء.
            </p>
            <textarea
              data-testid="tadwin-assistee"
              value={assistee}
              onChange={(e) => setAssistee(e.target.value)}
              placeholder="اكتب زبدة الدرس في جملتين أو ثلاث…"
              rows={6}
              className="w-full p-4 rounded-2xl border border-[#e2dabf] bg-[#fffdf6] text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[#006d37]/30"
            />
            {alerteLive?.alerteAr && (
              <div className="bg-[#ba1a1a]/10 border border-[#ba1a1a]/30 rounded-xl p-3 text-sm font-bold text-[#ba1a1a]">
                {alerteLive.alerteAr}
              </div>
            )}
            {indice && (
              <div className="bg-[#944a00]/10 border border-[#944a00]/30 rounded-xl p-3 text-sm text-[#944a00]">
                <span className="font-bold">تلميح: </span>
                {indice}
              </div>
            )}
            <div className="flex gap-3">
              <button
                data-testid="tadwin-indice"
                onClick={() => setIndice(cles ? `ابدأ بالمفتاح: «${cles[0].cle}»` : null)}
                className="flex-1 py-3 rounded-2xl bg-[#944a00]/10 text-[#944a00] font-bold text-sm hover:bg-[#944a00]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Lightbulb className="w-4 h-4" />
                طلب تلميح
              </button>
              <button
                data-testid="tadwin-assistee-envoyer"
                onClick={terminerAssistee}
                disabled={!assistee.trim()}
                className="flex-1 py-3 rounded-2xl bg-[#006d37] text-white font-extrabold text-sm hover:bg-[#005a2e] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                انتهيت
              </button>
            </div>
          </div>
        )}

        {/* ─── Palier 3 — مستقل : sélection des clés ─── */}
        {etat.palier === 3 && etape === 'choix' && (
          <div className="bg-white rounded-3xl border border-[#e2dabf]/60 p-6 space-y-4 shadow-sm">
            <p className="text-sm font-bold text-[#1f1c0b]">
              قاوِم الرغبة — مفتاحان يكفيان. اختر 2 أو 3 مفاتيح فقط من الثلاثة.
            </p>
            <div className="space-y-2">
              {cles?.map((c) => {
                const coché = cochees.includes(c.cle);
                return (
                  <button
                    key={c.cle}
                    data-testid={`tadwin-cle-${cles?.indexOf(c)}`}
                    onClick={() =>
                      setCochees((prev) =>
                        coché ? prev.filter((x) => x !== c.cle) : prev.length >= 3 ? prev : [...prev, c.cle],
                      )
                    }
                    className={`w-full text-right p-4 rounded-2xl border-2 text-sm font-bold transition-all cursor-pointer ${
                      coché
                        ? 'border-[#006d37] bg-[#006d37]/8 text-[#006d37]'
                        : 'border-[#e2dabf] bg-[#fffdf6] text-[#1f1c0b] hover:border-[#006d37]/40'
                    }`}
                  >
                    <span className={coché ? 'text-[#006d37]' : 'text-[#e2dabf]'}>{coché ? '◉' : '○'} </span>
                    {c.cle}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[#8a8570] font-semibold">الاختيار: {cochees.length} من 3 (الحد الأدنى 2)</p>
            <button
              data-testid="tadwin-choix-valider"
              onClick={validerChoixCles}
              disabled={cochees.length < 2}
              className="w-full py-3.5 rounded-2xl bg-[#006d37] text-white font-extrabold text-sm hover:bg-[#005a2e] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              التالي — اكتب الزبدة
            </button>
          </div>
        )}

        {/* ─── Palier 3 — مستقل : écriture notée ─── */}
        {etat.palier === 3 && etape === 'ecriture' && (
          <div className="bg-white rounded-3xl border border-[#e2dabf]/60 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-[#1f1c0b]">اكتب المفاتيح المختارة بأسلوبك — من الذاكرة:</p>
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#506072]">
                <Clock className="w-3.5 h-3.5" />
                {String(Math.floor(secondes / 60)).padStart(2, '0')}:
                {String(secondes % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {cochees.map((c) => (
                <span
                  key={c}
                  className="text-xs font-bold text-[#006d37] bg-[#006d37]/8 px-3 py-1.5 rounded-full"
                >
                  {c}
                </span>
              ))}
            </div>
            <textarea
              data-testid="tadwin-reponse"
              value={reponse}
              onChange={(e) => setReponse(e.target.value)}
              placeholder="اكتب الزبدة هنا…"
              rows={8}
              className="w-full p-4 rounded-2xl border border-[#e2dabf] bg-[#fffdf6] text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[#006d37]/30"
            />
            <p className="text-xs text-[#8a8570] font-semibold">عدد الكلمات: {compterMots(reponse)}</p>
            <button
              data-testid="tadwin-evaluer"
              onClick={soumettreProduction}
              disabled={!reponse.trim()}
              className="w-full py-3.5 rounded-2xl bg-[#006d37] text-white font-extrabold text-sm hover:bg-[#005a2e] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              تقييم الزبدة
            </button>
          </div>
        )}

        {/* ─── Palier 3 — verdict ─── */}
        {etat.palier === 3 && etape === 'verdict' && resultat && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-[#e2dabf]/60 p-6 space-y-4 shadow-sm">
              <p className="text-xs text-[#8a8570] font-bold text-center">{ETIQUETTE_NOTATION}</p>
              <p data-testid="tadwin-verdict" className="text-lg font-extrabold text-[#006d37] text-center">{resultat.verdictAr}</p>
              <div>
                <div className="flex justify-between text-xs font-bold text-[#506072] mb-1">
                  <span data-testid="tadwin-c2-label">التغطية (C2)</span>
                  <span data-testid="tadwin-c2">{Math.round(resultat.c2 * 100)}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#e2dabf]/50 overflow-hidden">
                  <div
                    className="h-full bg-[#006d37] rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(resultat.c2 * 100)}%` }}
                  />
                </div>
              </div>
              {resultat.stuffing.stuffing_detected && (
                <div className="bg-[#ba1a1a]/10 border border-[#ba1a1a]/30 rounded-xl p-3 text-sm font-bold text-[#ba1a1a]">
                  C3 — {resultat.stuffing.explanation_ar}
                </div>
              )}
              <div className="bg-[#944a00]/8 border border-[#944a00]/25 rounded-xl p-4">
                <span className="text-xs font-bold text-[#944a00]">نصيحة واحدة: </span>
                <span data-testid="tadwin-conseil" className="text-sm font-semibold text-[#1f1c0b]">{resultat.conseilAr}</span>
              </div>
              <div className="space-y-2">
                {resultat.detail.map((d) => (
                  <div
                    key={d.cle}
                    className="text-xs bg-[#fff9ed] rounded-xl p-3 border border-[#e2dabf]/50"
                  >
                    <span className={d.couvert ? 'text-[#006d37] font-bold' : 'text-[#ba1a1a] font-bold'}>
                      {d.couvert ? '✓ ' : '✗ '}
                      {d.cle}
                    </span>
                    {d.atomsManquants.length > 0 && (
                      <span className="block text-[#8a8570] mt-1">
                        ينقص: {d.atomsManquants.join(' • ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#8a8570] text-center font-semibold">
                حُفظت الفقرة في الدفتر — ستراجعها في J+1.
              </p>
              <button
                data-testid="tadwin-vers-consolidation"
                onClick={terminerProduction}
                className="w-full py-3.5 rounded-2xl bg-[#006d37] text-white font-extrabold text-sm hover:bg-[#005a2e] transition-all cursor-pointer shadow-sm"
              >
                الانتقال إلى التثبيت
              </button>
            </div>
          </div>
        )}

        {/* ─── Palier 4 — التثبيت : rappel espacé sur le carnet masqué ─── */}
        {etat.palier === PALIER_MAX && (
          <div className="space-y-4">
            {chasseurZabda && (
              <div className="bg-[#006d37]/8 border border-[#006d37]/30 rounded-2xl p-4 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-[#006d37] shrink-0" />
                <p className="text-sm font-extrabold text-[#006d37]">
                  صائد الزبدة — {maitrises.length} مفاتيح ثُبّتت في ذاكرتك
                </p>
              </div>
            )}

            {dues.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#e2dabf]/60 p-6 text-center space-y-2 shadow-sm">
                <p className="text-sm font-bold text-[#1f1c0b]">لا توجد فقرة مستحقة للمراجعة الآن</p>
                <p className="text-xs text-[#8a8570] font-semibold">
                  الراجعة المخطّطة: {fiches.length - dues.length} — حسب جدول J+1 / J+3 / J+7 / J+14.
                </p>
              </div>
            ) : (
              dues.map((fiche) => {
                const u = TADWIN_UNITES.find((x) => x.uniteId === fiche.uniteId);
                const estRevelee = reveleeId === fiche.id;
                return (
                  <div
                    key={fiche.id}
                    className="bg-white rounded-3xl border border-[#e2dabf]/60 p-6 space-y-3 shadow-sm"
                  >
                    <p className="text-xs font-bold text-[#8a8570]">{u?.titre}</p>
                    <div className="flex flex-wrap gap-2">
                      {fiche.clesChoisies.map((c) => (
                        <span
                          key={c}
                          className="text-xs font-bold text-[#006d37] bg-[#006d37]/8 px-3 py-1.5 rounded-full"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                    {estRevelee ? (
                      <div className="space-y-3">
                        <div className="text-sm bg-[#fff9ed] rounded-xl p-3 border border-[#e2dabf]/50 leading-relaxed">
                          {fiche.reponse}
                        </div>
                        <p className="text-xs font-bold text-[#1f1c0b]">هل تذكّرت الزبدة قبل إظهارها؟</p>
                        <div className="flex gap-3">
                          <button
                            data-testid={`tadwin-rappel-ok-${fiche.id}`}
                            onClick={() => repondreRappel(fiche, true)}
                            className="flex-1 py-3 rounded-2xl bg-[#006d37] text-white font-bold text-sm hover:bg-[#005a2e] transition-all cursor-pointer"
                          >
                            تذكّرتها
                          </button>
                          <button
                            data-testid={`tadwin-rappel-ko-${fiche.id}`}
                            onClick={() => repondreRappel(fiche, false)}
                            className="flex-1 py-3 rounded-2xl bg-[#ba1a1a]/10 text-[#ba1a1a] font-bold text-sm hover:bg-[#ba1a1a]/20 transition-all cursor-pointer"
                          >
                            لم أتذكرها
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        data-testid={`tadwin-rappel-reveler-${fiche.id}`}
                        onClick={() => setReveleeId(fiche.id)}
                        className="w-full py-3 rounded-2xl bg-[#944a00]/10 text-[#944a00] font-bold text-sm hover:bg-[#944a00]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-4 h-4" />
                        استعد من الذاكرة ثم أظهر الإجابة
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
