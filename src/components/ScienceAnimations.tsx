// ScienceAnimations.tsx — U4 (audits Opus/Gemini) : animations vectorielles
// de mécanismes clés du programme 3AS SE. SVG + SMIL pur : aucune dépendance,
// aucun GIF/vidéo, fonctionne hors-ligne et sur 3G (quelques Ko).
//accessibility: chaque animation porte un <title> + une légende arabe.

import type { FC } from 'react';

const CAPTION_CLASS = 'mt-3 text-sm font-bold text-[#006d37] dark:text-[#2ecc71] text-right';
const SUB_CLASS = 'mt-1 text-xs text-[#506072] dark:text-gray-400 text-right leading-relaxed';

/** 1. انتقال السيالة العصبية على طول المحور العصبي (U2). */
export const ActionPotentialAnimation: FC = () => (
  <figure>
    <svg viewBox="0 0 420 170" role="img" aria-label="انتشار السيالة العصبية" className="w-full">
      <title>انتشار السيالة العصبية على طول المحور العصبي</title>
      <rect x="10" y="70" width="400" height="26" rx="13" fill="#e8f5ee" stroke="#9cc8ab" />
      {/* Segments de myéline */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={40 + i * 76} y="58" width="44" height="50" rx="10" fill="#d9c48a" stroke="#b8a05a" />
      ))}
      {/* Onde de dépolarisation qui se propage */}
      <g>
        <rect x="-30" y="62" width="60" height="42" rx="12" fill="#2ecc71" opacity="0.85">
          <animateTransform
            attributeName="transform" type="translate"
            values="0 0; 400 0; 0 0" keyTimes="0; 0.5; 1"
            dur="4s" repeatCount="indefinite"
          />
        </rect>
        <text x="0" y="52" fontSize="12" fontWeight="700" fill="#006d37" textAnchor="middle">
          + + +
          <animateTransform
            attributeName="transform" type="translate"
            values="0 0; 400 0; 0 0" keyTimes="0; 0.5; 1"
            dur="4s" repeatCount="indefinite"
          />
        </text>
      </g>
      {/* Na+ entre (flèches vers l'intérieur), K+ sort (flèches vers l'extérieur) */}
      <g stroke="#ba1a1a" strokeWidth="2.5" fill="none">
        <line x1="70" y1="30" x2="70" y2="56"><animate attributeName="opacity" values="0;1;0" dur="4s" begin="0.2s" repeatCount="indefinite" /></line>
        <path d="M 64 48 L 70 58 L 76 48" />
      </g>
      <text x="70" y="22" fontSize="10" fill="#ba1a1a" fontWeight="700" textAnchor="middle">+Na يدخل</text>
      <g stroke="#1d4ed8" strokeWidth="2.5" fill="none">
        <line x1="200" y1="130" x2="200" y2="104"><animate attributeName="opacity" values="0;1;0" dur="4s" begin="1.4s" repeatCount="indefinite" /></line>
        <path d="M 194 112 L 200 102 L 206 112" />
      </g>
      <text x="200" y="148" fontSize="10" fill="#1d4ed8" fontWeight="700" textAnchor="middle">+K يخرج</text>
    </svg>
    <figcaption className={CAPTION_CLASS}>انتشار السيالة العصبية</figcaption>
    <p className={SUB_CLASS}>دخول Na+ يولّد كمون العمل، ثم خروج K+ يعيد الاستقطاب — تنتشر الموجة على طول المحور من قطعة لأخرى.</p>
  </figure>
);

/** 2. تباعد الصفائح التكتونية وارتفاع الصهارة (U9). */
export const PlateDivergenceAnimation: FC = () => (
  <figure>
    <svg viewBox="0 0 420 180" role="img" aria-label="تباعد الصفائح التكتونية" className="w-full">
      <title>تباعد صفيحتان وارتفاع الصهارة</title>
      {/* Manteau asthénosphérique */}
      <rect x="10" y="110" width="400" height="60" rx="10" fill="#f0a35e" opacity="0.5" />
      {/* Lithosphère : deux plaques qui s'écartent */}
      <g>
        <rect x="40" y="50" width="150" height="60" rx="8" fill="#8fbc9b" stroke="#5b8a6b">
          <animateTransform attributeName="transform" type="translate"
            values="0 0; -34 0; 0 0" keyTimes="0; 0.5; 1" dur="5s" repeatCount="indefinite" />
        </rect>
        <rect x="230" y="50" width="150" height="60" rx="8" fill="#8fbc9b" stroke="#5b8a6b">
          <animateTransform attributeName="transform" type="translate"
            values="0 0; 34 0; 0 0" keyTimes="0; 0.5; 1" dur="5s" repeatCount="indefinite" />
        </rect>
      </g>
      {/* Faille / vallée médio-océanique entre les deux plaques */}
      <path d="M 200 50 L 210 110 L 220 50 Z" fill="#cfe6d6" />
      {/* Montée de la cahara (magma) */}
      <g>
        <path d="M 204 108 C 200 90 212 80 208 60 C 206 48 214 42 210 30" stroke="#e25822" strokeWidth="6" fill="none" strokeLinecap="round">
          <animate attributeName="opacity" values="0.2; 1; 0.2" dur="5s" repeatCount="indefinite" />
        </path>
        <circle cx="210" cy="30" r="7" fill="#e25822">
          <animate attributeName="r" values="5; 9; 5" dur="5s" repeatCount="indefinite" />
        </circle>
      </g>
      {/* Flèches d'écartement */}
      <g stroke="#006d37" strokeWidth="3" fill="none">
        <line x1="170" y1="40" x2="120" y2="40"><animate attributeName="opacity" values="0;1;0" dur="5s" begin="1s" repeatCount="indefinite" /></line>
        <path d="M 130 33 L 118 40 L 130 47" />
        <line x1="250" y1="40" x2="300" y2="40"><animate attributeName="opacity" values="0;1;0" dur="5s" begin="1s" repeatCount="indefinite" /></line>
        <path d="M 290 33 L 302 40 L 290 47" />
      </g>
      <text x="105" y="26" fontSize="11" fill="#006d37" fontWeight="700">تباعد</text>
      <text x="285" y="26" fontSize="11" fill="#006d37" fontWeight="700">تباعد</text>
      <text x="120" y="150" fontSize="11" fill="#9a5b1f" fontWeight="700">الوشاح (أثينوسفير)</text>
    </svg>
    <figcaption className={CAPTION_CLASS}>تباعد الصفائح وارتفاع الصهارة</figcaption>
    <p className={SUB_CLASS}>عند الحدود التباعدية تبتعد الصفيحتان فترتفع الصهارة من الوشاح وتتصلب مكوّنةً قشرة محيطية جديدة.</p>
  </figure>
);

/** 3. تركيب البروتين: الاستنساخ ثم الترجمة (U1). */
export const ProteinSynthesisAnimation: FC = () => (
  <figure>
    <svg viewBox="0 0 420 180" role="img" aria-label="تركيب البروتين" className="w-full">
      <title>الاستنساخ ثم الترجمة : من ADN إلى سلسلة ببتيدية</title>
      {/* ADN double brin (gauche) */}
      <g>
        <path d="M 20 30 C 40 10 60 50 80 30 C 100 10 120 50 140 30" stroke="#1d4ed8" strokeWidth="4" fill="none" />
        <path d="M 20 90 C 40 70 60 110 80 90 C 100 70 120 110 140 90" stroke="#1d4ed8" strokeWidth="4" fill="none" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={24 + i * 20} y1="32" x2={24 + i * 20} y2="88" stroke="#93c5fd" strokeWidth="2" />
        ))}
        <text x="80" y="125" fontSize="11" fill="#1d4ed8" fontWeight="700" textAnchor="middle">ADN</text>
      </g>
      {/* Flèche ADN -> ARNm */}
      <g stroke="#006d37" strokeWidth="3" fill="none">
        <line x1="150" y1="60" x2="195" y2="60" />
        <path d="M 186 53 L 198 60 L 186 67" />
      </g>
      {/* ARNm (ruban) qui se détache et se déplace */}
      <g>
        <rect x="205" y="48" width="130" height="24" rx="12" fill="#fde68a" stroke="#d9a400">
          <animateTransform attributeName="transform" type="translate"
            values="-90 0; 0 0; -90 0" keyTimes="0; 0.5; 1" dur="5s" repeatCount="indefinite" />
        </rect>
        <text x="270" y="64" fontSize="10" fontWeight="700" fill="#92580c" textAnchor="middle">ARNm</text>
      </g>
      {/* Ribosome qui lit l'ARNm et libère la chaîne peptidique */}
      <g>
        <circle cx="260" cy="140" r="16" fill="#a78bfa" stroke="#7c3aed" strokeWidth="2">
          <animateTransform attributeName="transform" type="translate"
            values="0 0; -70 0; 0 0" keyTimes="0; 0.5; 1" dur="5s" repeatCount="indefinite" />
        </circle>
        <text x="260" y="144" fontSize="9" fill="#ffffff" fontWeight="700" textAnchor="middle">رايبوسوم</text>
      </g>
      {/* Acides aminés qui s'assemblent en chaîne */}
      <g>
        {['#f472b6', '#60a5fa', '#34d399', '#fbbf24'].map((c, i) => (
          <g key={i}>
            <circle cx={150 + i * 20} cy="160" r="7" fill={c}>
              <animate attributeName="opacity" values="0; 0; 1; 1" keyTimes="0; 0.5; 0.7; 1" dur="5s" repeatCount="indefinite" />
            </circle>
            <line x1={157 + i * 20} y1="160" x2={163 + i * 20} y2="160" stroke="#64748b" strokeWidth="2">
              <animate attributeName="opacity" values="0; 0; 1; 1" keyTimes="0; 0.5; 0.7; 1" dur="5s" repeatCount="indefinite" />
            </line>
          </g>
        ))}
      </g>
    </svg>
    <figcaption className={CAPTION_CLASS}>الاستنساخ ثم الترجمة</figcaption>
    <p className={SUB_CLASS}>تُنسخ المورثة إلى ARNm، ثم يقرأها الرايبوسوم ويربط الأحماض الأمينية وفق الرامزات لتتشكّل السلسلة الببتيدية.</p>
  </figure>
);

export const ANIMATION_CATALOG = [
  { id: 'action-potential', titleAr: 'انتشار السيالة العصبية', unitAr: 'الوحدة 2 — التخصص الوظيفي للبروتينات', Component: ActionPotentialAnimation },
  { id: 'plate-divergence', titleAr: 'تباعد الصفائح وارتفاع الصهارة', unitAr: 'الوحدة 9 — التكتونية العامة', Component: PlateDivergenceAnimation },
  { id: 'protein-synthesis', titleAr: 'الاستنساخ ثم الترجمة', unitAr: 'الوحدة 1 — التخصص الوظيفي للبروتينات', Component: ProteinSynthesisAnimation },
] as const;
