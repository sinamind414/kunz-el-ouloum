// src/components/MoiView.tsx
// « أنا » — page identité de l'élève (photo 1 du design OPUS 5.5) :
// en-tête (eyebrow + prénom + méta), puis « شجرتك » : UNE FEUILLE par leçon,
// un point plein (زيتونة) par جسر, regroupé par domaine.
//
// Port fidèle du design OPUS 5.5 sur la charte de l'app : palette
// #006d37 / #00562b / #944a00 / #e2dabf, police Noto Kufi, mode sombre
// conservé. Les états viennent UNIQUEMENT du store `kunz_parcours_v1`
// (parcoursProgress) : feuille verte = faite, feuille or = hachée (à
// revoir), feuille pâle = pas encore faite. Aucune donnée inventée.
//
// Rangées NON cliquables (fidèle à OPUS : l'arbre est un état des lieux,
// pas un menu) → aucun `onClick` sur balise inerte.
//
// 2026-10-03 — déplacements demandés : « الأوسمة والإنجازات » et
// « لوحة المتابعة » ont quitté le menu latéral « المزيد », puis « تقدمي » a
// quitté la barre principale du bas (8 → 7 onglets) : les trois finissent
// SOUS l'avancement, sous forme d'icônes. Un clic ouvre le détail.
// Le bloc n'est rendu que si `onOuvrir` est fourni : jamais de bouton inerte.

import { Award, LayoutDashboard, Leaf, Trophy, type LucideIcon } from 'lucide-react';
import { MOI_RACCOURCIS, type MoiRaccourciTab } from '../data/moiRaccourcis';
import { PARCOURS_DOMAINS } from '../lib/parcours/parcoursPath';
import {
  allowance,
  itemStatus,
  loadParcours,
  todaysCompletions,
} from '../lib/parcours/parcoursProgress';

interface MoiProps {
  /** Prénom de l'élève connecté (null = aucune session). */
  nomEleve: string | null;
  /** Adresse du compte connecté (null = aucune session). */
  courriel: string | null;
  /**
   * Ouvre l'onglet du détail derrière une icône de « المزيد ».
   * OPTIONNEL : sans ce prop, la rangée d'icônes n'est pas rendue — on ne
   * laisse jamais un bouton cliquable sans effet (cf. règle « aucune balise
   * inerte » en tête de fichier).
   */
  onOuvrir?: (onglet: MoiRaccourciTab) => void;
}

/** Icône de chaque raccourci — mappée ici, jamais dans la donnée. */
const ICONES_RACCOURCI: Record<MoiRaccourciTab, LucideIcon> = {
  badges: Award,
  teacher: LayoutDashboard,
  stats: Trophy,
};

// Tons des feuilles (OPUS : fill-forest / fill-gold-soft / text-line).
const FEUILLE = {
  faite: 'fill-[#006d37] text-[#006d37] dark:fill-[#2ecc71] dark:text-[#2ecc71]',
  fragile: 'fill-[#f3dfae] text-[#944a00] dark:fill-[#e0a94f] dark:text-amber-300',
  'a faire': 'text-[#e2dabf] dark:text-gray-700',
} as const;

function Feuille({ titre, etat }: { titre: string; etat: 'faite' | 'fragile' | 'a faire' }) {
  return (
    <Leaf
      aria-label={titre}
      className={`h-4 w-4 shrink-0 ${FEUILLE[etat]}`}
      strokeWidth={1.8}
    />
  );
}

export default function MoiView({ nomEleve, courriel, onOuvrir }: MoiProps) {
  const state = loadParcours();

  const items = PARCOURS_DOMAINS.flatMap((d) => d.units.flatMap((u) => u.items));
  const lecons = items.filter((i) => i.kind === 'lesson');
  const jalons = items.filter((i) => i.kind === 'jalon');
  const leconsFaites = lecons.filter((i) => state.done[i.id]);
  const leconsFragiles = leconsFaites.filter((i) => state.done[i.id]?.fragile);
  const jalonsFaits = jalons.filter((i) => state.done[i.id]);

  return (
    <div dir="rtl" className="mx-auto max-w-3xl space-y-5 p-4 pb-10">
      {/* ---------- En-tête identité ---------- */}
      <header data-testid="moi-header">
        <p className="text-[11px] font-bold tracking-[0.02em] text-[#944a00] dark:text-amber-300">
          أنا
        </p>
        <h1 className="mt-1 text-[2.1rem] font-black leading-tight text-gray-900 dark:text-gray-50">
          {nomEleve ?? 'صفحتي'}
        </h1>
        <p className="mt-1 text-xs leading-6 text-gray-500 dark:text-gray-400">
          {courriel ? (
            <>
              الحساب:{' '}
              <span
                dir="ltr"
                className="font-semibold text-gray-700 dark:text-gray-300"
              >
                {courriel}
              </span>
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">
              مسار تجريبي · محفوظ على هذا الجهاز
            </span>
          )}
        </p>
      </header>

      {/* ---------- شجرتك : une feuille par leçon, un point par جسر ---------- */}
      <section
        data-testid="moi-tree"
        className="rounded-[24px] border border-[#e2dabf] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#161c18]"
      >
        <h2 className="text-base font-black text-gray-900 dark:text-gray-50">شجرتك</h2>
        <p className="mt-1 text-xs leading-6 text-gray-500 dark:text-gray-400">
          ورقة لكل درس، وزيتونة لكل جسر. لا نقاط، ولا ترتيب بين التلاميذ.
        </p>

        <div className="mt-4 space-y-4" data-testid="moi-tree-units">
          {PARCOURS_DOMAINS.map((domain) => (
            <div key={domain.domainId}>
              <p className="mb-2 text-[11px] font-bold text-[#944a00] dark:text-amber-300">
                {domain.title}
              </p>
              <ul className="space-y-1.5">
                {domain.units.map((unit) => {
                  const leconsUnite = unit.items.filter((i) => i.kind === 'lesson');
                  const jalonUnite = unit.items.find((i) => i.kind === 'jalon');
                  const jalonFait = jalonUnite ? state.done[jalonUnite.id] : undefined;
                  return (
                    <li key={unit.unitId} className="flex items-center gap-3">
                      <span
                        className="w-36 shrink-0 truncate text-xs text-gray-600 dark:text-gray-300 md:w-56"
                        title={unit.title}
                      >
                        {unit.unitId}. {unit.title}
                      </span>
                      <span className="flex flex-1 flex-wrap items-center gap-1 border-r-2 border-[#e2dabf]/70 pr-2 dark:border-gray-700/70">
                        {leconsUnite.map((lecon) => {
                          const fait = state.done[lecon.id];
                          const etat = fait
                            ? fait.fragile
                              ? 'fragile'
                              : 'faite'
                            : 'a faire';
                          return (
                            <Feuille
                              key={lecon.id}
                              titre={lecon.title}
                              etat={etat}
                            />
                          );
                        })}
                        <span
                          title="الجسر"
                          aria-label="الجسر"
                          className={`mr-1 h-3 w-3 shrink-0 rounded-full ${
                            jalonFait
                              ? 'bg-[#00562b] dark:bg-[#2ecc71]'
                              : 'border border-[#e2dabf] dark:border-gray-700'
                          }`}
                        />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Légende — indispensable pour lire l'arbre sans deviner. */}
        <ul className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#f0e8d4] pt-3 text-[11px] text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <li className="flex items-center gap-1.5">
            <Feuille titre="درس مُنجز" etat="faite" /> مُنجز
          </li>
          <li className="flex items-center gap-1.5">
            <Feuille titre="درس هشّ" etat="fragile" /> هشّ — يعود في المراجعة
          </li>
          <li className="flex items-center gap-1.5">
            <Feuille titre="درس لم يُنجز" etat="a faire" /> لم يُنجز بعد
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#00562b] dark:bg-[#2ecc71]" />
            جسر مفتوح
          </li>
        </ul>
      </section>

      {/* ---------- أرقامك بالكلمات ---------- */}
      <section
        data-testid="moi-nums"
        className="rounded-[24px] border border-[#e2dabf] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#161c18]"
      >
        <h2 className="text-base font-black text-gray-900 dark:text-gray-50">
          أرقامك بالكلمات
        </h2>
        <p className="mt-1 text-xs leading-6 text-gray-500 dark:text-gray-400">
          لا نسب مئوية ولا رتبة أمام غيرك — أرقامك أنت وحدها.
        </p>
        <dl className="mt-3 divide-y divide-[#f0e8d4] dark:divide-gray-800/70">
          <div className="flex items-baseline justify-between gap-3 py-2.5">
            <dt className="text-sm text-gray-700 dark:text-gray-300">دروس مُنجزة</dt>
            <dd
              dir="ltr"
              className="text-sm font-black text-[#006d37] dark:text-emerald-300"
            >
              {leconsFaites.length} / {lecons.length}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 py-2.5">
            <dt className="text-sm text-gray-700 dark:text-gray-300">
              دروس هشّة تحتاج مراجعة
            </dt>
            <dd
              dir="ltr"
              className="text-sm font-black text-[#944a00] dark:text-amber-300"
            >
              {leconsFragiles.length}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 py-2.5">
            <dt className="text-sm text-gray-700 dark:text-gray-300">جسور مفتوحة</dt>
            <dd
              dir="ltr"
              className="text-sm font-black text-[#006d37] dark:text-emerald-300"
            >
              {jalonsFaits.length} / {jalons.length}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 py-2.5">
            <dt className="text-sm text-gray-700 dark:text-gray-300">حصّة اليوم</dt>
            <dd
              dir="ltr"
              className="text-sm font-black text-gray-900 dark:text-gray-100"
            >
              {todaysCompletions(state)} / {allowance(state)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-[11px] leading-6 text-gray-500 dark:text-gray-400">
          {itemStatus(state, items[0]?.id ?? '') === 'done'
            ? 'خطوة خطوة : ما أنجزته يبقى متاحاً للقراءة في أي وقت.'
            : 'ابدأ من «مساري» — أول درس يفتح الباب لما بعده.'}
        </p>
      </section>

      {/* ---------- المزيد : les rubriques déplacées du menu latéral ---------- */}
      {/* Élément demandé le 2026-10-03 : sous l'avancement de l'élève, sous
          forme d'icônes ; le clic ouvre le détail. Les étiquettes viennent de
          moiRaccourcis.ts (déplacées verbatim depuis SECONDARY_NAV) — si le
          prop n'est pas fourni, la section n'est PAS rendue : aucun bouton
          cliquable sans effet. */}
      {onOuvrir && (
        <section
          data-testid="moi-raccourcis"
          className="rounded-[24px] border border-[#e2dabf] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#161c18]"
        >
          <h2 className="text-base font-black text-gray-900 dark:text-gray-50">المزيد</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {MOI_RACCOURCIS.map(({ tab, labelAr }) => {
              const Icone = ICONES_RACCOURCI[tab];
              return (
                <button
                  key={tab}
                  type="button"
                  data-testid={`moi-raccourci-${tab}`}
                  aria-label={labelAr}
                  onClick={() => onOuvrir(tab)}
                  className="flex min-w-[8.5rem] flex-1 cursor-pointer flex-col items-center gap-2 rounded-2xl border border-[#e2dabf] bg-[#f8fbfa] px-4 py-4 text-center transition-all hover:border-[#006d37] hover:bg-[#e5f6ed] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#006d37] dark:border-gray-700 dark:bg-[#161c18] dark:hover:border-[#2ecc71] dark:hover:bg-[#2ecc71]/10"
                >
                  <Icone
                    aria-hidden="true"
                    className="h-6 w-6 text-[#006d37] dark:text-[#2ecc71]"
                    strokeWidth={1.8}
                  />
                  <span className="text-xs font-bold leading-5 text-gray-800 dark:text-gray-100">
                    {labelAr}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
