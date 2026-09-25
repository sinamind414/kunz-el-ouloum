// SearchView.tsx — R5 : RECHERCHE GLOBALE dans les cours (Morchid).
// Réutilise le moteur de retrieval du tuteur (searchAllBases) qui indexe déjà
// 450 chunks : 47 leçons HTML + 20 leçons actives + bases de connaissances.
// Avant : la recherche n'existait que dans les cartes mentales.
import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Search, Sparkles, Star, X } from 'lucide-react';
import { normalizeArabic, searchAllBases } from '../smartTutorEngine';
import {
  getFavorites,
  getRecentSearches,
  pushRecentSearch,
  removeFavorite,
  toggleFavorite,
  type FavoriteEntry,
} from '../utils/favorites';

/** Un résultat de recherche groupé par lessonKey (un seul card par leçon). */
interface GroupedResult {
  key: string;
  type: 'card' | 'book' | 'opus' | 'guide' | 'lesson';
  title: string;
  unitId: number;
  unitTitle: string;
  text: string;
  sourceLabel?: string;
  lessonKey?: string;
  lessonKind?: 'html' | 'active';
  bestScore: number;
}

const MAX_RESULTS = 10;

const TYPE_META: Record<GroupedResult['type'], { badge: string; cls: string }> = {
  lesson: { badge: 'درس', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  book: { badge: 'سؤال من الكتاب', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  card: { badge: 'بطاقة معرفية', cls: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' },
  guide: { badge: 'دليل منهجي', cls: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300' },
  opus: { badge: 'موسوعة', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' },
};

function snippet(text: string, max = 150): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

function groupResults(hits: ReturnType<typeof searchAllBases>): GroupedResult[] {
  const map = new Map<string, GroupedResult>();
  for (const ch of hits) {
    // Une leçon découpée en plusieurs chunks → on garde le meilleur morceau,
    // la clé de regroupement est le lessonKey (ou l'id si hors leçon).
    const groupKey = ch.type === 'lesson' && ch.lessonKey ? `lesson:${ch.lessonKey}` : `other:${ch.id}`;
    const existing = map.get(groupKey);
    if (existing) {
      if (ch.text.length > existing.text.length) {
        existing.text = ch.text;
        existing.title = ch.title;
      }
      continue;
    }
    map.set(groupKey, {
      key: groupKey,
      type: ch.type,
      title: ch.title,
      unitId: ch.unitId,
      unitTitle: ch.unitTitle,
      text: ch.text,
      sourceLabel: ch.sourceLabel,
      lessonKey: ch.lessonKey,
      lessonKind: ch.lessonKind,
      bestScore: 0,
    });
  }
  return [...map.values()];
}

interface SearchViewProps {
  onBack: () => void;
  /** Ouvre la leçon complète : (lessonKey, kind, unitId). */
  onOpenLesson: (lessonKey: string, kind: 'html' | 'active', unitId: number) => void;
}

export default function SearchView({ onBack, onOpenLesson }: SearchViewProps) {
  const [query, setQuery] = useState('');
  const [favoritesTick, setFavoritesTick] = useState(0);
  const favorites = useMemo(() => getFavorites(), [favoritesTick]);
  const recents = useMemo(() => getRecentSearches(), [favoritesTick]);

  const results = useMemo<GroupedResult[]>(() => {
    const q = query.trim();
    if (q.length < 2) return [];
    return groupResults(searchAllBases(normalizeArabic(q), null)).slice(0, MAX_RESULTS);
  }, [query]);

  const hasQuery = query.trim().length >= 2;

  // On n'enregistre la recherche qu'à la validation (Entrée) ou à l'ouverture
  // d'un résultat — sinon chaque frappe partielle pollue l'historique.
  const commitSearch = () => {
    const q = query.trim();
    if (q.length >= 2) pushRecentSearch(q);
  };

  const handleToggleFavorite = (r: GroupedResult) => {
    if (!r.lessonKey || !r.lessonKind) return;
    const entry: Omit<FavoriteEntry, 'addedAt'> = {
      lessonKey: r.lessonKey,
      lessonKind: r.lessonKind,
      title: r.unitTitle || r.title,
      unitId: r.unitId,
    };
    toggleFavorite(entry);
    setFavoritesTick((t) => t + 1);
  };

  const isFav = (lessonKey?: string) => (lessonKey ? getFavorites().some((f) => f.lessonKey === lessonKey) : false);

  return (
    <div dir="rtl" className="space-y-4">
      {/* En-tête + champ de recherche */}
      <div className="bg-gradient-to-l from-[#006d37] via-[#008744] to-[#10b981] text-white p-5 md:p-6 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold transition-all"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>عودة</span>
          </button>
          <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
            <Search className="w-6 h-6" />
            بحث في كل الدروس
          </h1>
        </div>
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اكتب كلمة أو موضوع… (مثال: الفسفرة التأكسدية)"
            aria-label="البحث في الدروس"
            className="w-full bg-white/95 dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-base font-medium rounded-2xl px-4 py-3 pr-11 border-0 focus:ring-2 focus:ring-white/60 outline-none"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') commitSearch(); }}
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="مسح البحث"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {!hasQuery && (
          <p className="text-white/80 text-[11px] font-bold mt-2">
            يبحث في ٤٥٠ مقطعاً: ٤٧ درساً رسمياً + ٢٠ درساً نشيطاً + بنك الأسئلة — يعمل دون اتصال
          </p>
        )}
      </div>

      {/* Recherches récentes (G5) */}
      {!hasQuery && recents.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-black text-gray-500 dark:text-gray-400">🔍 عمليات البحث الأخيرة</h2>
          <div className="flex flex-wrap gap-2">
            {recents.map((r) => (
              <button
                key={r}
                onClick={() => setQuery(r)}
                className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Favoris (G2) */}
      {!hasQuery && (
        <div className="space-y-2">
          <h2 className="text-xs font-black text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
            دروسي المفضلة ({favorites.length})
          </h2>
          {favorites.length === 0 ? (
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 text-center">
              لا توجد دروس مفضلة بعد — ابحث وأضفها بالنجمة ⭐
            </p>
          ) : (
            <div className="space-y-2">
              {favorites.map((f) => (
                <div
                  key={f.lessonKey}
                  className="flex items-center gap-3 bg-white dark:bg-[#161c18] border border-gray-100 dark:border-gray-800 rounded-2xl p-3"
                >
                  <button
                    onClick={() => onOpenLesson(f.lessonKey, f.lessonKind, f.unitId)}
                    className="flex-1 min-w-0 text-right"
                  >
                    <span className="block text-sm font-black text-gray-800 dark:text-gray-100 truncate">
                      {f.title}
                    </span>
                    <span className="inline-flex items-center gap-1 mt-0.5">
                      <span className="inline-flex h-5 px-1.5 items-center rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                        وحدة {f.unitId}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {f.lessonKind === 'active' ? 'درس نشيط' : 'درس رسمي'}
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      removeFavorite(f.lessonKey);
                      setFavoritesTick((t) => t + 1);
                    }}
                    aria-label="إزالة من المفضلة"
                    className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all"
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Résultats */}
      {hasQuery && (
        <div className="space-y-2.5">
          <h2 className="text-xs font-black text-gray-500 dark:text-gray-400">
            {results.length > 0
              ? `${results.length} نتيجة لـ « ${query.trim()} »`
              : `لا توجد نتائج لـ « ${query.trim()} »`}
          </h2>

          {results.length === 0 && (
            <div className="bg-white dark:bg-[#161c18] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto" />
              <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                جرّب كلمة أخرى، أو اسأل المرشد الذكي مباشرةً
              </p>
              <p className="text-[11px] font-bold text-gray-400">
                كلمات مفتاحية مقترحة: الفسفرة التأكسدية · التركيب الضوئي · الغوص · المناعة · الكود الوراثي
              </p>
            </div>
          )}

          {results.map((r) => {
            const meta = TYPE_META[r.type];
            const fav = isFav(r.lessonKey);
            return (
              <div
                key={r.key}
                className="bg-white dark:bg-[#161c18] border border-gray-100 dark:border-gray-800 rounded-2xl p-3.5 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`inline-flex h-5 px-1.5 items-center rounded-md text-[10px] font-black ${meta.cls}`}>
                        {meta.badge}
                      </span>
                      {r.type === 'lesson' && (
                        <span className="inline-flex h-5 px-1.5 items-center rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                          وحدة {r.unitId}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-black text-gray-800 dark:text-gray-100 leading-snug">
                      {r.title}
                    </h3>
                    <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                      {snippet(r.text)}
                    </p>
                  </div>

                  {r.type === 'lesson' && r.lessonKey && (
                    <button
                      onClick={() => handleToggleFavorite(r)}
                      aria-label={fav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                      className={`p-1.5 rounded-lg transition-all shrink-0 ${
                        fav
                          ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                          : 'text-gray-300 dark:text-gray-600 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                      }`}
                    >
                      <Star className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} />
                    </button>
                  )}
                </div>

                {r.type === 'lesson' && r.lessonKey && (() => {
                  const lk = r.lessonKey;
                  return (
                  <button
                    onClick={() => { commitSearch(); onOpenLesson(lk, r.lessonKind ?? 'html', r.unitId); }}
                    className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-black hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    فتح الدرس
                  </button>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
