/**
 * scripts/tools/proFigureSpecs.ts
 *
 * Registre des figures ProFigureEngine à appliquer dans les leçons.
 * Chaque entrée associe :
 *   - file   : leçon cible ;
 *   - slot   : index du bloc <svg class="svg-container"> à remplacer ;
 *   - anchor : extrait du titre <h1..h4> précédant le bloc (garde anti-remplacement
 *              erroné : si le titre ne correspond plus, l'application échoue
 *              plutôt que d'écraser la mauvaise figure) ;
 *   - build  : gabarit + données bilingues.
 *
 * Identification par slot+titre (et non par commentaire HTML) car les
 * marqueurs `<!-- SVG ... -->` ne sont pas uniques dans une même leçon
 * (ex. `<!-- SVG Photolysis -->` répété deux fois dans phase11).
 *
 * Exécution : npx tsx scripts/tools/applyProFigures.ts [--check]
 */

import {
  generateCurveChart,
  generateFlowDiagram,
  generateLayerStack,
  generatePanelCompare,
} from './ProFigureTemplates.ts';
import { ProFigureEngine } from './ProFigureEngine.ts';

export interface FigureTarget {
  file: string;
  slot: number;
  anchor: string;
  build: () => string;
}

const CYAN = '#38bdf8';
const ROSE = '#f43f5e';
const AMBER = '#fbbf24';
const EMERALD = '#34d399';
const VIOLET = '#a78bfa';

export const PFE_TARGETS: FigureTarget[] = [
  // __LOT1__
  /* ------------------------------ phase4 — courbe pH ------------------------------ */
  {
    file: 'public/lessons/phase4_chapitres_7_8.html',
    slot: 0,
    anchor: 'بدلالة الـ pH',
    build: () =>
      generateCurveChart({
        title: 'منحنى النشاط الإنزيمي بدلالة الـ pH (شكل الجرس)',
        subtitle: "Activité enzymatique vs pH — optimum et zones d'ionisation",
        xLabel: 'pH الوسط',
        yLabel: 'السرعة Vi',
        xTicks: [
          { x: 0, label: '0' },
          { x: 0.286, label: '4' },
          { x: 0.5, label: '7' },
          { x: 0.714, label: '10' },
          { x: 1, label: '14' },
        ],
        yTicks: [
          { y: 0.5, label: '50%' },
          { y: 0, label: '0' },
        ],
        zones: [
          { x0: 0, x1: 0.36, label: 'وسط حامضي (تأين موجب)', fill: ROSE },
          { x0: 0.64, x1: 1, label: 'وسط قاعدي (تأين سالب)', fill: CYAN },
        ],
        guides: [{ y: 1, label: 'Vmax', color: '#94a3b8' }],
        series: [
          {
            name: 'النشاط الإنزيمي',
            color: AMBER,
            points: [
              [0.07, 0.03],
              [0.15, 0.12],
              [0.22, 0.3],
              [0.3, 0.55],
              [0.4, 0.82],
              [0.5, 1],
              [0.6, 0.9],
              [0.68, 0.7],
              [0.76, 0.45],
              [0.85, 0.18],
              [0.93, 0.05],
            ],
          },
        ],
        marks: [{ x: 0.5, y: 1, text: 'pH أمثل (Optimum)', dx: -4, dy: 34 }],
        note: [
          'الوسط الحامضي: تأين موجب | الوسط القاعدي: تأين سالب للإنزيم.',
          'أي تغيّر في pH يُعدّل البنية الفراغية ← انخفاض الفعالية.',
        ],
      }),
  },

  /* ------------------------------ phase4 — courbe température ------------------------------ */
  {
    file: 'public/lessons/phase4_chapitres_7_8.html',
    slot: 1,
    anchor: 'تأثير الحرارة',
    build: () =>
      generateCurveChart({
        title: 'منحنى تأثير الحرارة على النشاط الإنزيمي',
        subtitle: 'Effet de la température — courbe asymétrique',
        xLabel: 'الحرارة (°C)',
        yLabel: 'السرعة Vi',
        xTicks: [
          { x: 0, label: '0' },
          { x: 0.2, label: '20' },
          { x: 0.37, label: '37' },
          { x: 0.6, label: '60' },
          { x: 0.8, label: '80' },
          { x: 1, label: '100' },
        ],
        yTicks: [
          { y: 1, label: 'Vmax' },
          { y: 0, label: '0' },
        ],
        zones: [
          { x0: 0, x1: 0.37, label: 'تبريد — توقف مؤقت', fill: CYAN },
          { x0: 0.55, x1: 1, label: 'تسخين — تخريب', fill: ROSE },
        ],
        series: [
          {
            name: 'النشاط',
            color: AMBER,
            points: [
              [0.03, 0.06],
              [0.12, 0.22],
              [0.2, 0.45],
              [0.28, 0.72],
              [0.37, 1],
              [0.45, 0.94],
              [0.55, 0.8],
              [0.65, 0.58],
              [0.75, 0.34],
              [0.85, 0.14],
              [0.94, 0.03],
              [1, 0.01],
            ],
          },
        ],
        marks: [{ x: 0.37, y: 1, text: '37°C أمثل', dx: -4, dy: 34 }],
        note: [
          'التبريد: توقف مؤقت رجعي — النشاط يعود عند التبريد.',
          'التسخين: تخريب لا رجوي للبنية الفراغية — النشاط لا يعود.',
        ],
      }),
  },

  /* ------------------------------ phase8 — membrane (couches) ------------------------------ */
  {
    file: 'public/lessons/phase8_chapitres_15_16.html',
    slot: 0,
    anchor: 'كمون الراحة',
    build: () =>
      generateLayerStack({
        title: 'بروتينات كمون الراحة على الغشاء الهيولي لليف العصبي',
        subtitle: 'Potentiel de repos — canaux passifs et pompe Na⁺/K⁺ ATP',
        leftHead: 'الموقع',
        rightHead: 'الحالة والكمون',
        bands: [
          {
            name: 'الوسط الخارجي',
            detail: 'غني بـ Na⁺ موجب — التدرج نحو الداخل',
            left: 'خارج',
            right: '+ mV',
            color: ROSE,
            weight: 1.2,
          },
          {
            name: 'الغشاء الهيولي (bicouche)',
            detail: 'قناة تسرب K⁺ + قناة تسرب Na⁺ + مضخة ATP',
            left: 'غشاء',
            right: '7 nm',
            color: CYAN,
            weight: 1,
          },
          {
            name: 'الوسط الداخلي',
            detail: 'غني بـ K⁺ سالب — كمون −70 mV',
            left: 'داخل',
            right: '−70 mV',
            color: EMERALD,
            weight: 1.2,
          },
        ],
        note: [
          'خروج K⁺ وفق تدرجه + دخول Na⁺ وفق تدرجه ← كمون −70 mV.',
          'مضخة ATP: خروج 3 Na⁺ مقابل دخول 2 K⁺ (ضد التدرج).',
        ],
      }),
  },

  /* ------------------------------ phase8 — potentiel d'action ------------------------------ */
  {
    file: 'public/lessons/phase8_chapitres_15_16.html',
    slot: 1,
    anchor: 'كمون العمل',
    build: () =>
      generateCurveChart({
        title: 'منحنى كمون العمل أحادي الطور والأطوار الأيونية',
        subtitle: "Potentiel d'action monophasique — influx Na⁺ puis efflux K⁺",
        xLabel: 'الزمن (ms)',
        yLabel: 'الكمون (mV)',
        xTicks: [
          { x: 0.1, label: '0' },
          { x: 0.3, label: '2' },
          { x: 0.5, label: '4' },
          { x: 0.7, label: '6' },
          { x: 0.9, label: '8' },
        ],
        yTicks: [
          { y: 0.9, label: '+30' },
          { y: 0.4, label: '−50' },
          { y: 0.25, label: '−70' },
          { y: 0, label: '−90' },
        ],
        guides: [
          { y: 0.4, label: 'عتبة −50 mV', color: ROSE },
          { y: 0.25, label: '−70 mV (راحة)', color: CYAN },
        ],
        series: [
          {
            name: 'كمون العمل',
            color: AMBER,
            points: [
              [0.05, 0.25],
              [0.15, 0.25],
              [0.25, 0.3],
              [0.3, 0.4],
              [0.37, 0.9],
              [0.45, 0.62],
              [0.55, 0.3],
              [0.62, 0.12],
              [0.7, 0.08],
              [0.8, 0.18],
              [0.9, 0.25],
              [0.98, 0.25],
            ],
          },
        ],
        marks: [
          { x: 0.37, y: 0.9, text: 'ذروة +30 mV (دخول Na⁺)', dx: -4, dy: 30 },
          { x: 0.62, y: 0.12, text: 'فرط استقطاب (خروج K⁺)', dx: 12, dy: 16, color: CYAN, anchor: 'start' },
        ],
        note: [
          '1) زوال الاستقطاب: دخول Na⁺ سريع | 2) عودة الاستقطاب: خروج K⁺.',
          '3) فرط الاستقطاب ثم عودة الكمون إلى −70 mV (راحة).',
        ],
      }),
  },

  /* ------------------------------ phase3 — Anfinsen (mécanisme) ------------------------------ */
  {
    file: 'public/lessons/phase3_chapitres_5_6.html',
    slot: 0,
    anchor: 'أنفنصن',
    build: () =>
      generateFlowDiagram({
        title: 'تجربة أنفنصن على إنزيم الريبونكلياز (4 جسور ثنائية الكبريت)',
        subtitle: 'Anfinsen (1961) — la séquence primaire détermine le repliement',
        steps: [
          {
            badge: '1',
            title: 'بنية طبيعية فعالة',
            lines: ['4 جسور ثنائية الكبريت'],
            chip: '100% نشاط',
            color: EMERALD,
          },
          {
            badge: '2',
            title: 'فقدان البنية',
            lines: ['يوريا + β-مركابتوإثانول'],
            chip: '0% نشاط',
            color: ROSE,
          },
          {
            badge: '3',
            title: 'استرجاع البنية',
            lines: ['إزالة المواد الكيميائية'],
            chip: '100% نشاط',
            color: CYAN,
          },
        ],
        lanes: ['+ يوريا و β-مركابتوإثانول', 'إزالة المواد الكيميائية'],
        note: ['البنية الفراغية للبروتين تتبع من التسلسل الأولي (فرضية أنفنصن).'],
      }),
  },
  {
    file: 'public/lessons/phase3_chapitres_5_6.html',
    slot: 1,
    anchor: 'التوافق المحرض',
    build: () =>
      generateFlowDiagram({
        title: 'نموذج التوافق المحرض — التداخل والتكامل البنيوي',
        subtitle: 'Induced fit (Koshland, 1958) — E + S → complexe E·S',
        steps: [
          {
            badge: '1',
            title: 'الإنزيم (E) قبل الارتباط',
            lines: ['الموقع النشط مرن'],
            chip: 'غير متوافق',
            color: CYAN,
          },
          {
            badge: '2',
            title: 'مادة التفاعل (S)',
            lines: ['تقترب من الموقع'],
            chip: 'اقتراب S',
            color: AMBER,
          },
          {
            badge: '3',
            title: 'معقد (E - S) متوافق',
            lines: ['تكامل بنيوي تام'],
            chip: 'فعالية قصوى',
            color: EMERALD,
          },
        ],
        lanes: ['+ اقتراب S', 'توافق محرض'],
        note: ['الموقع النشط يتكيّف مع المادة — لا قفل/صندوق ثابت (Koshland).'],
      }),
  },

  /* ------------------------------ phase13 — glycolyse + Krebs ------------------------------ */
  {
    file: 'public/lessons/phase13_chapitres_25_26.html',
    slot: 0,
    anchor: 'مخطط التحلل السكري',
    build: () =>
      generateFlowDiagram({
        title: 'مخطط التحلل السكري — تفكيك الغلوكوز C₆ إلى 2 بيروفيك C₃',
        subtitle: 'Glycolyse (cytoplasme) — bilan net 2 ATP + 2 NADH',
        steps: [
          { badge: '1', title: 'غلوكوز (C₆)', lines: ['C₆H₁₂O₆ بداية المسار'], color: CYAN },
          {
            badge: '2',
            title: 'فركتوز ثنائي الفوسفات',
            lines: ['إدخال 2 ATP وتفعيل'],
            chip: 'F-1,6-BP',
            color: AMBER,
          },
          {
            badge: '3',
            title: 'PGAL (C₃) ×2',
            lines: ['انشطار إلى جزيئين'],
            chip: 'C₃ ×2',
            color: VIOLET,
          },
          {
            badge: '4',
            title: 'بيروفيك (C₃) ×2',
            lines: ['ربح صافي للـ ATP'],
            chip: '2 ATP + 2 NADH',
            color: EMERALD,
          },
        ],
        lanes: ['استهلاك 2 ATP', 'انشطار', '2 ATP + NADH'],
        note: [
          'المكان: السيتوبلازم — لا يشترط الأكسجين (Glycolyse).',
          'الصافي لكل غلوكوز: 2 ATP + 2 NADH قبل دورة كريبس.',
        ],
      }),
  },
  {
    file: 'public/lessons/phase13_chapitres_25_26.html',
    slot: 1,
    anchor: 'حلقة كريبس',
    build: () =>
      generateFlowDiagram({
        title: 'حلقة كريبس — هدم الأستيل مرافق الإنزيم أ',
        subtitle: 'Cycle de Krebs (matrice mitocondriale) — Acétyl-CoA C₂',
        steps: [
          { badge: '1', title: 'بيروفيك (C₃)', lines: ['من التحلل السكري'], chip: 'C₃', color: CYAN },
          {
            badge: '2',
            title: 'أستيل-CoA (C₂)',
            lines: ['يدخل مع أوكسالوأسيتات'],
            chip: 'C₂ + C₄',
            color: ROSE,
          },
          { badge: '3', title: 'سترات (C₆)', lines: ['أول مركب في الحلقة'], chip: 'C₆', color: AMBER },
          {
            badge: '4',
            title: 'أوكسالوأسيتات C₄',
            lines: ['تتجدد لدورة جديدة'],
            chip: 'C₄',
            color: EMERALD,
          },
        ],
        lanes: ['نزع CO₂ + NADH', 'تكاثف C₂ + C₄', '3 NADH + FADH₂'],
        loop: 'تجدد الأوكسالوأسيتات — إطلاق CO₂ و NADH',
        note: [
          'النواتج لكل بيروفيك: 3 NADH + 1 FADH₂ + 1 ATP + 2 CO₂.',
          'المكان: حشوة الميتوكوندري (Matrix).',
        ],
      }),
  },

  /* ------------------------------ phase12 — Calvin + couplage ------------------------------ */
  {
    file: 'public/lessons/phase12_chapitres_23_24.html',
    slot: 0,
    anchor: 'حلقة كالفن',
    build: () =>
      generateFlowDiagram({
        title: 'مخطط حلقة كالفن — دورة إدماج الكربون في الحشوة',
        subtitle: 'Cycle de Calvin — RuBP (C₅) → fixation CO₂ → glucose (C₆)',
        steps: [
          { badge: '1', title: '6 RuBP (C₅)', lines: ['حامل الـ CO₂'], chip: 'C₅', color: CYAN },
          {
            badge: '2',
            title: 'تثبيت6 CO₂',
            lines: ['إنزيم Rubisco'],
            chip: 'Rubisco',
            color: ROSE,
          },
          {
            badge: '3',
            title: '12 APG (C₃)',
            lines: ['اختزال بـ NADPH'],
            chip: '12 ATP',
            color: AMBER,
          },
          {
            badge: '4',
            title: 'غلوكوز C₆H₁₂O₆',
            lines: ['+ تجديد6 RuBP'],
            chip: 'C₆H₁₂O₆',
            color: EMERALD,
          },
        ],
        lanes: ['+ 6 CO₂', '12 ATP + 12 NADPH', 'اختزال → PGAL'],
        loop: 'تجديد RuBP (6 ATP) لإغلاق الدورة',
        note: [
          'المكان: الحشوة (Stroma) — يحتاج ATP و NADPH من مرحلة الضوء.',
          'لكل CO₂ مثبَّت: 3 ATP + 2 NADPH.',
        ],
      }),
  },
  {
    file: 'public/lessons/phase12_chapitres_23_24.html',
    slot: 1,
    anchor: 'الازدواج الوظيفي',
    build: () =>
      generatePanelCompare({
        title: 'الازدواج الوظيفي بين التيلاكويد والحشوة',
        subtitle: 'Couplage — phase photochimique (lumière) ↔ chimioautotrophie (CO₂)',
        panels: [
          {
            title: 'التيلةكويدي (ضوء) — المرحلة الكيميائية',
            glyph: 'hν',
            color: CYAN,
            lines: ['تصريف الماء: H₂O → O₂', 'ينتج ATP و NADPH', 'المرحلة المحبة للضوء'],
          },
          {
            title: 'الحشوة (Rubisco) — المرحلة الكيميوحيوية',
            glyph: 'C',
            color: AMBER,
            lines: ['تثبيت CO₂ في حلقة كالفن', 'ينتج سكر النشا', 'المرحلة غير المحبة للضوء'],
          },
        ],
        exchanges: [
          { label: 'ATP + NADPH, H⁺', color: AMBER },
          { label: 'ADP + Pi + NADP⁺', color: CYAN, rtl: true },
        ],
        note: ['الضوء يوفّر ATP و NADPH التي تُستعمل في تثبيت CO₂ بالحشوة.'],
      }),
  },

  /* ------------------------------ phase19 — ondes sismiques ------------------------------ */
  {
    file: 'public/lessons/phase19_chapitres_37_38.html',
    slot: 0,
    anchor: 'الانقطاعات الثلاثة',
    build: () =>
      generateCurveChart({
        title: 'منحنى سرعة الموجات P و S والانقطاعات الثلاثة لباطن الأرض',
        subtitle: 'Vitesse sismique vs profondeur — Moho (30), Gutenberg (2900), Lehmann (5100)',
        xLabel: 'السرعة V (كم/ث)',
        yLabel: 'العمق (كم) — يزداد نحو الأسفل',
        xTicks: [
          { x: 0.2, label: '4' },
          { x: 0.4, label: '8' },
          { x: 0.6, label: '12' },
          { x: 0.8, label: '16' },
        ],
        yTicks: [
          { y: 1, label: '0' },
          { y: 0.545, label: '2900' },
          { y: 0.201, label: '5100' },
          { y: 0, label: '6371' },
        ],
        yZones: [
          { y0: 0.545, y1: 0.201, label: 'النواة الخارجية (سائلة)', fill: AMBER },
          { y0: 0.201, y1: 0, label: 'النواة الداخلية (صلبة)', fill: ROSE },
        ],
        series: [
          {
            name: 'الموجات P (تخترق كل شيء)',
            color: CYAN,
            points: [
              [0.275, 1],
              [0.4, 0.995],
              [0.5, 0.8],
              [0.6, 0.65],
              [0.68, 0.56],
              [0.4, 0.545],
              [0.45, 0.4],
              [0.5, 0.25],
              [0.52, 0.201],
              [0.55, 0.16],
              [0.565, 0],
            ],
          },
          {
            name: 'الموجات S (تتوقف عند 2900)',
            color: ROSE,
            dashed: true,
            points: [
              [0.16, 1],
              [0.24, 0.995],
              [0.3, 0.8],
              [0.35, 0.65],
              [0.37, 0.56],
              [0.36, 0.545],
            ],
          },
        ],
        marks: [
          { x: 0.4, y: 0.995, text: 'موهو (30 كم)', dx: -10, dy: 40, color: EMERALD, anchor: 'end' },
          { x: 0.68, y: 0.56, text: 'غوتنبرغ (2900 كم)', dx: 14, dy: -24, color: EMERALD, anchor: 'start' },
          { x: 0.55, y: 0.201, text: 'ليمان (5100 كم)', dx: 14, dy: -20, color: EMERALD, anchor: 'start' },
          { x: 0.36, y: 0.545, text: 'تتوقف عند 2900 كم', dx: -12, dy: 8, color: ROSE, anchor: 'end' },
        ],
        note: [
          'السرعتان تزدادان بالعمق، ثم ينهار الإرسال عند النواة الخارجية السائلة.',
          'الانقطاعات: موهو 30 كم · غوتنبرغ 2900 كم · ليمان 5100 كم.',
        ],
      }),
  },

  /* ------------------------------ phase19 — roches (comparaison) ------------------------------ */
  {
    file: 'public/lessons/phase19_chapitres_37_38.html',
    slot: 1,
    anchor: 'الصخور المميزة',
    build: () =>
      generatePanelCompare({
        title: 'مقارنة الصخور المميزة للأغلفة الصخرية والستار الأرضي',
        subtitle: 'Roches de la croûte et du manteau — densités 2.7 / 3.0 / 3.3',
        panels: [
          {
            title: 'القشرة القارية',
            glyph: 'Si',
            color: AMBER,
            lines: ['صخر الغرانيت', 'كوارتز + فلسبار', 'SIAL: سيليس + ألمنيوم', 'الكثافة = 2.7'],
          },
          {
            title: 'القشرة المحيطية',
            glyph: 'Ma',
            color: CYAN,
            lines: ['بازلت + غابرو', 'بيروكسين + بلاجيوكلاز', 'SIMA: سيليس + مغنيزيوم', 'الكثافة = 3.0'],
          },
          {
            title: 'البرنس (الستار)',
            glyph: 'Pe',
            color: EMERALD,
            lines: ['صخر البيريدوتيت', 'أوليفين + بيروكسين', 'صخر فوق قاعدي غني بالحديد', 'الكثافة = 3.3'],
          },
        ],
        note: ['الكثافة تزداد نحو الأسفل: 2.7 ← 3.0 ← 3.3 (تفاوت الكتلة).'],
      }),
  },

  /* ------------------------------ phase20 — sphère terrestre (couches) ------------------------------ */
  {
    file: 'public/lessons/phase20_chapitres_39_40.html',
    slot: 0,
    anchor: 'الأغلفة الخمسة',
    build: () =>
      generateLayerStack({
        title: 'مخطط قطاعي: الأغلفة الخمسة — العمق، الكثافة والحالة الفيزيائية',
        subtitle: 'Structure interne de la Terre — 5 enveloppes (0 → 6371 km)',
        leftHead: 'العمق (كم)',
        rightHead: 'الحالة والكثافة',
        bands: [
          {
            name: '1. القشرة الأرضية',
            detail: 'صلبة · 0 – 30 كم · كثافة 2.7 – 3.0',
            left: '0 – 30 كم',
            right: 'صلبة — 2.7',
            color: VIOLET,
            weight: 1,
          },
          {
            name: '2. البرنس العلوي',
            detail: 'بيريدوتيت صلب/لدن · 30 – 670 كم · 3.3',
            left: '30 – 670 كم',
            right: 'صلب/لدن — 3.3',
            color: CYAN,
            weight: 1.15,
          },
          {
            name: '3. البرنس السفلي',
            detail: 'بيروفسكايت · 670 – 2900 كم · 5.5',
            left: '670 – 2900 كم',
            right: 'صلب — 5.5',
            color: EMERALD,
            weight: 1.15,
          },
          {
            name: '4. النواة الخارجية',
            detail: 'حديد ونيكل سائل · 2900 – 5100 كم · 10',
            left: '2900 – 5100 كم',
            right: 'سائل — 10',
            color: AMBER,
            weight: 1.15,
          },
          {
            name: '5. النواة الداخلية (البذرة)',
            detail: 'حديد صلب جدًا · 5100 – 6371 كم · 13',
            left: '5100 – 6371 كم',
            right: 'صلب — 13',
            color: ROSE,
            weight: 1,
          },
        ],
        note: [
          'الحدود: موهو 30 كم · غوتنبرغ 2900 كم · ليمان 5100 كم.',
          'الكثافة والحالة الفيزيائية تتغير نحو مركز الأرض.',
        ],
      }),
  },

  /* ------------------------------ phase20 — déformations (comparaison) ------------------------------ */
  {
    file: 'public/lessons/phase20_chapitres_39_40.html',
    slot: 1,
    anchor: 'التشوهات التكتونية',
    build: () =>
      generatePanelCompare({
        title: 'التشوهات التكتونية: الطية المحدبة والفالقين',
        subtitle: 'Plis et failles — compression, tension, extension',
        panels: [
          { title: 'طية محدبة', glyph: 'F', color: CYAN, lines: ['قوى انضغاط', 'صخر لدن (انبعاجي)'] },
          { title: 'فالق عادي', glyph: 'N', color: AMBER, lines: ['قوى شد (تواء)', 'صخر صلب', 'الهياب ينخفض'] },
          { title: 'فالق معكوس', glyph: 'R', color: ROSE, lines: ['قوى انضغاط', 'صخر صلب', 'الهياب يرتفع'] },
        ],
        note: ['كل تشوّه يعكس نوع القوى: انضغاط ← طية/معكوس | شد ← فالق عادي.'],
      }),
  },

  /* ------------------------------ phase5 — groupes sanguins ABO ------------------------------ */
  {
    file: 'public/lessons/phase5_chapitres_9_10.html',
    slot: 1,
    anchor: 'المحددات المستضدية',
    build: () =>
      generatePanelCompare({
        title: 'المحددات المستضدية الغشائية للزمر الأربعة (ABO)',
        subtitle: 'Antigènes membranaires ABO sur la substance de base H',
        panels: [
          { title: 'الزمرة O', glyph: 'O', color: '#94a3b8', lines: ['مادة H فقط', 'بدون مستضد A/B'] },
          { title: 'الزمرة A', glyph: 'A', color: ROSE, lines: ['مستضد A مثبّت على H'] },
          { title: 'الزمرة B', glyph: 'B', color: AMBER, lines: ['مستضد B مثبّت على H'] },
          { title: 'الزمرة AB', glyph: 'AB', color: CYAN, lines: ['مستضد A و B', 'معاً على H'] },
        ],
        note: ['الزمرة O: متبرّع عام | الزمرة AB: متلقّي عام.'],
      }),
  },

  /* ------------------------------ phase9 — PPSE / PPSI (comparaison) ------------------------------ */
  {
    file: 'public/lessons/phase9_chapitres_17_18.html',
    slot: 1,
    anchor: 'الكمون التنبيهي',
    build: () =>
      generateCurveChart({
        title: 'مقارنة الكمون التنبيهي PPSE والكمون التثبيطي PPSI',
        subtitle: 'Dépolarisation (Na⁺) vs hyperpolarisation (Cl⁻ / K⁺)',
        xLabel: 'الزمن (ms)',
        yLabel: 'الكمون (mV)',
        xTicks: [
          { x: 0.2, label: '0' },
          { x: 0.5, label: '5' },
          { x: 0.8, label: '10' },
        ],
        yTicks: [
          { y: 0.9, label: '+30' },
          { y: 0.4, label: '−50' },
          { y: 0.25, label: '−70' },
        ],
        guides: [
          { y: 0.4, label: 'عتبة −50 mV', color: ROSE },
          { y: 0.25, label: '−70 mV (راحة)', color: '#94a3b8' },
        ],
        series: [
          {
            name: 'PPSE — تنبيه',
            color: AMBER,
            points: [
              [0.05, 0.25],
              [0.18, 0.25],
              [0.26, 0.4],
              [0.34, 0.9],
              [0.45, 0.6],
              [0.55, 0.42],
              [0.65, 0.3],
              [0.78, 0.25],
              [0.95, 0.25],
            ],
          },
          {
            name: 'PPSI — تثبيط',
            color: CYAN,
            dashed: true,
            points: [
              [0.05, 0.25],
              [0.18, 0.25],
              [0.26, 0.4],
              [0.34, 0.1],
              [0.45, 0.13],
              [0.58, 0.2],
              [0.7, 0.25],
              [0.95, 0.25],
            ],
          },
        ],
        marks: [
          { x: 0.34, y: 0.9, text: 'دخول Na⁺ (زوال استقطاب)', dx: -6, dy: 32 },
          { x: 0.34, y: 0.1, text: 'دخول Cl⁻ (فرط استقطاب)', dx: 16, dy: 18, color: CYAN, anchor: 'start' },
        ],
        note: [
          'PPSE تنبيه: زوال استقطاب بدخول Na⁺ | PPSI تثبيط: فرط استقطاب بدخول Cl⁻.',
          'كلاهما يرتبط بالكمون العتبة عند −50 mV.',
        ],
      }),
  },

  /* -------------------- lecon_activite_structure — 2 comparaisons d'enzymes -------------------- */
  {
    file: 'public/lessons/lecon_activite_structure.html',
    slot: 0,
    anchor: 'أنبوبان',
    build: () =>
      generatePanelCompare({
        title: 'أنبوبان : نشا + أميلاز / سليلوز + أميلاز عند 37°C',
        subtitle: 'Test à l’amylase — substrats différents (amidon vs cellulose)',
        panels: [
          { title: 'نشا + أميلاز', glyph: 'S', color: EMERALD, lines: ['تفاعل مع النشا', 'راسب فهلنغ أحمر'] },
          { title: 'سليلوز + أميلاز', glyph: 'C', color: ROSE, lines: ['لا يهاجم السليلوز', 'أزرق اليود يبقى'] },
        ],
        note: ['الأميليز يختلف باختلاف السُّبسترات (النشا ≠ السليلوز) عند 37°C.'],
      }),
  },
  {
    file: 'public/lessons/lecon_activite_structure.html',
    slot: 1,
    anchor: 'أميلاز عند',
    build: () =>
      generatePanelCompare({
        title: 'أميلاز عند 37°C وعند 80°C ثم التبريد',
        subtitle: 'Activité de l’amylase vs température — irréversibilité',
        panels: [
          {
            title: '37°C — الحرارة المثلى',
            glyph: '37',
            color: EMERALD,
            lines: ['موقع فعال سليم', 'تكامل بنيوي كامل', 'نشاط كامل'],
          },
          {
            title: '80°C ثم التبريد',
            glyph: '80',
            color: ROSE,
            lines: ['موقع مشوه (80°) : لا تكامل', '← لا نشاط', 'التبريد لا يرجع البنية'],
          },
        ],
        note: ['الحرارة الزائدة تدمر التكوين السكوري (لا رجعي) — عكس التبريد.'],
      }),
  },

  /* -------------------- lecon_representation — modèles 3D (fiche unique) -------------------- */
  {
    file: 'public/lessons/lecon_representation.html',
    slot: 0,
    anchor: 'نموذج الكرات',
    build: () =>
      generatePanelCompare({
        title: 'نموذج الكرات : كل ذرة كرة بحجمها الحقيقي',
        subtitle: 'Modèle « sphères » — espace réellement occupé',
        panels: [
          {
            title: 'الكرة = ذرة',
            glyph: '●',
            color: CYAN,
            lines: ['C ، O ، N ، S بحجمها الحقيقي', 'حجم فان دير فالس', 'يُظهر الفراغ داخل الجزيء'],
          },
        ],
        note: ['يبرز التعبئة الفراغية لكنه يخفي السلسلة الببتيدية الأساسية.'],
      }),
  },
  {
    file: 'public/lessons/lecon_representation.html',
    slot: 1,
    anchor: 'النموذج الشريطي',
    build: () =>
      generatePanelCompare({
        title: 'النموذج الشريطي : مسار السلسلة الببتيدية فقط',
        subtitle: 'Modèle « ruban » — squelette de la chaîne peptidique',
        panels: [
          {
            title: 'الشريط يتبع العمود الفقري',
            glyph: '↻',
            color: VIOLET,
            lines: ['لولب α', 'ورقة β', 'الشريط يتبع العمود الفقري للسلسلة', 'ويُخفي الذرات'],
          },
        ],
        note: ['يُظهر البنية secondaire فقط — الذرات غير مرئية.'],
      }),
  },

  /* ---------- lecon_transcription — figure sur-mesure (ex-bespoke, ciblage par slot) ---------- */
  {
    file: 'public/lessons/lecon_transcription.html',
    slot: 0,
    anchor: 'بقع إشعاعية',
    build: () => ProFigureEngine.generatePulseChaseUracileTracking(),
  },
  /* --------------- lecon_transcription — arbre de Riesman + phase5 CMH --------------- */
  {
    file: 'public/lessons/lecon_transcription.html',
    slot: 1,
    anchor: 'شجرة الريسمان',
    build: () =>
      generatePanelCompare({
        title: 'شجرة الريسمان : فروع استنساخ متعددة على خيط ADN واحد',
        subtitle: 'Transcription multiple — micrographie + schéma interprétatif',
        panels: [
          {
            title: 'الأساس : خيط الـ ADN',
            glyph: 'ADN',
            color: CYAN,
            lines: ['خيط الـ ADN', 'اتجاه الاستنساخ ➡️', 'صورة بالمجهر الإلكتروني'],
          },
        ],
        note: ['كل فرع = ARNm قيد التشكل؛ الفروع الأقصر أقدم في الزمن.'],
      }),
  },
  {
    file: 'public/lessons/phase5_chapitres_9_10.html',
    slot: 0,
    anchor: 'البنية الفراغية لجزيئات',
    build: () =>
      generatePanelCompare({
        title: 'البنية الفراغية لجزيئات الـ CMH على غشاء الخلية',
        subtitle: 'CMH classe I vs classe II — présentation de l’antigène',
        panels: [
          {
            title: 'CMH الصنف I',
            glyph: 'I',
            color: CYAN,
            lines: ['β2m', 'على جميع الخلايا المنواة', 'مركب على الغشاء الهيولي'],
          },
          {
            title: 'CMH الصنف II',
            glyph: 'II',
            color: ROSE,
            lines: ['على الخلايا المناعية', '(CPA, LB)', 'مركب على الغشاء الهيولي'],
          },
        ],
        note: ['الصنف I كل الخلايا المنواة | الصنف II الخلايا المناعية فقط.'],
      }),
  },
  {
    file: 'public/lessons/phase6_chapitres_11_12.html',
    slot: 0,
    anchor: 'البنية الجزيئية المفصلة',
    build: () =>
      generatePanelCompare({
        title: 'البنية الجزيئية للجسم المضاد (2 ثقيلة H + 2 خفيفة L)',
        subtitle: 'Anticorps — 4 chaînes reliées par des ponts S-S',
        panels: [
          {
            title: 'السلاسل الأربع',
            glyph: '4',
            color: CYAN,
            lines: ['سلسلتان ثقيلتان (H)', 'سلسلتان خفيفتان (L)', 'جسور ثنائية الكبريت S-S'],
          },
          {
            title: 'الموقع النشط',
            glyph: 'Ag',
            color: AMBER,
            lines: ['موقع تثبيت محدد المستضد', 'المنطقة المتغيرة', 'ينتهي إلى رأس المقص'],
          },
        ],
        note: ['المنطقة المتغيرة هي التي تتعرف على المستضد النوعي.'],
      }),
  },

  /* --------------- phase6 phagocytose · phase7 LTc / IL-2 · phase9 synapse --------------- */
  {
    file: 'public/lessons/phase6_chapitres_11_12.html',
    slot: 1,
    anchor: 'مراحل بلعمة',
    build: () =>
      generateFlowDiagram({
        title: 'مراحل بلعمة المعقد المناعي (التثبيت ← الابتلاع ← الهضم ← الإطراح)',
        subtitle: 'Phagocytose d’un complexe immune — macrophage',
        steps: [
          { badge: '1', title: 'تثبيت', lines: ['مستقبل غشائي للموقع Fc'], chip: 'Ag', color: CYAN },
          { badge: '2', title: 'ابتلاع', lines: ['البلعمية الكبيرة'], chip: 'Phagocyte', color: AMBER },
          { badge: '3', title: 'هضم', lines: ['ليزوزومات تفرز إنزيمات هاضمة'], chip: 'Phagolysosome', color: ROSE },
          { badge: '4', title: 'إطراح', lines: ['إخراج الفضلات'], color: EMERALD },
        ],
        lanes: ['التعرف على Fc', 'تكوّن الفجوة', 'فرز الإنزيمات'],
        note: ['البلعمية (Macrophage) خلية مناعية متخصصة في البلعمة والهضم.'],
      }),
  },
  {
    file: 'public/lessons/phase7_chapitres_13_14.html',
    slot: 0,
    anchor: 'التعرف المزدوج',
    build: () =>
      generateFlowDiagram({
        title: 'التعريف المزدوج وإفراز البرفورين لإحداث الصدمة الحلولية',
        subtitle: 'LTc + cellule infectée — lyse de la cible',
        steps: [
          {
            badge: '1',
            title: 'التعرف المزدوج',
            lines: ['TCR يتعرف على Ag', 'CD8 على الناقل'],
            chip: 'TCR + CD8',
            color: CYAN,
          },
          { badge: '2', title: 'التلامس', lines: ['الخلية المصابة بالفيروس'], chip: 'Ag', color: AMBER },
          { badge: '3', title: 'إفراز البرفورين', lines: ['جزيئات البرفورين'], chip: 'Perforine', color: ROSE },
          { badge: '4', title: 'الصدمة الحلولية', lines: ['موت الخلية المصابة'], chip: 'Lyse', color: EMERALD },
        ],
        lanes: ['TCR + CD8', 'تلامس مباشر', 'تخريب الغشاء'],
        note: ['التعرّف النوعي ثم البرفورين يثقّب غشاء الخلية المصابة ← موتها.'],
      }),
  },
  {
    file: 'public/lessons/phase7_chapitres_13_14.html',
    slot: 1,
    anchor: 'التنسيق والتحفيز',
    build: () =>
      generatePanelCompare({
        title: 'التنسيق والتحفيز بواسطة الأنترلوكين-2 (IL-2)',
        subtitle: 'IL-2 sécrété par les LT4 — stimulation LB / LT8',
        panels: [
          { title: 'خلية LT4 المساعدة', glyph: 'T4', color: VIOLET, lines: ['تفرز interleukine-2'] },
          { title: 'الخلية LB', glyph: 'B', color: AMBER, lines: ['تستقبل IL-2', 'تكاثر وإنتاج أجسام مضادة'] },
          { title: 'الخلية LT8', glyph: 'T8', color: CYAN, lines: ['تستقبل IL-2', 'تكاثر وتمايز'] },
        ],
        exchanges: [],
        note: [' IL-2 ناقل تنسيقي يربط خلايا الخلل المناعي الثلاث (LT4 ← LB / LT8).'],
      }),
  },
  {
    file: 'public/lessons/phase9_chapitres_17_18.html',
    slot: 0,
    anchor: 'مشبك الكيميائي',
    build: () =>
      generateLayerStack({
        title: 'البنية التشريحية والجزيئية للمشبك الكيميائي التنبيهي',
        subtitle: 'Synapse chimique excitatrice — terminaison, fente, membrane',
        leftHead: 'الموقع',
        rightHead: 'المؤثر',
        bands: [
          {
            name: 'الزر قبل المشبكي',
            detail: 'قنوات Ca²⁺ ← إخراج حويصلات ACh',
            left: 'Presynaptique',
            right: 'Ca²⁺',
            color: ROSE,
            weight: 1.1,
          },
          {
            name: 'الشق المشبكي',
            detail: 'تحرير الأستيل كولين (ACh)',
            left: 'Fente',
            right: 'ACh',
            color: AMBER,
            weight: 0.9,
          },
          {
            name: 'الغشاء بعد المشبكي',
            detail: 'مستقبلات-قنوات كيميائية مثيرة',
            left: 'Postsynaptique',
            right: 'ACh',
            color: CYAN,
            weight: 1.1,
          },
        ],
        note: ['عبر الشق ← ربط المستقبلات-قنوات ← كمون بعد مشبكي تنبيهي.'],
      }),
  },

  /* --------------- phase10 douleur/chloroplaste · phase11 phase photochimique --------------- */
  {
    file: 'public/lessons/phase10_chapitres_19_20.html',
    slot: 0,
    anchor: 'تثبيط قبل المشبكي',
    build: () =>
      generateFlowDiagram({
        title: 'آلية التثبيط قبل المشبكي لرسالة الألم (المادة P مقابل الأنكيفالين)',
        subtitle: 'Douleur — substance P vs enképhalines (récepteurs opiacés)',
        steps: [
          { badge: '1', title: 'نهاية عصبون الألم', lines: ['يفرز مادة P'], chip: 'Substance P', color: ROSE },
          {
            badge: '2',
            title: 'عصبون جامع',
            lines: ['أنكيفالين (مورفين)'],
            chip: 'Enképhaline',
            color: EMERALD,
          },
          {
            badge: '3',
            title: 'مستقبل أفيوني',
            lines: ['قناة Ca²⁺ تُحجب'],
            chip: 'Ca²⁺ bloqué',
            color: AMBER,
          },
          {
            badge: '4',
            title: 'إفراز أقل من P',
            lines: ['العصبون الوارد نحو الدماغ'],
            chip: 'Pain ↓',
            color: CYAN,
          },
        ],
        lanes: ['مادة P', 'ربط أفيوني', 'حجب Ca²⁺'],
        note: ['التثبيط قبل مشبكي: الأنكيفالين يقلّل إفراز مادة P فيتقل الألم.'],
      }),
  },
  {
    file: 'public/lessons/phase10_chapitres_19_20.html',
    slot: 1,
    anchor: 'الصانعة الخضراء',
    build: () =>
      generateLayerStack({
        title: 'الصانعة الخضراء (Chloroplaste) ومقصوراتها',
        subtitle: 'Chloroplaste — enveloppe, stroma, granum, grain d’amidon',
        leftHead: 'المكوّن',
        rightHead: 'الطبيعة',
        bands: [
          {
            name: 'الغشاء الخارجي والداخلي',
            detail: 'يفصل بينهما فراغ بين غشائي',
            left: 'الأغشية',
            right: '2 غشاء',
            color: CYAN,
            weight: 1,
          },
          {
            name: 'الحشوة (Stroma)',
            detail: 'سائل داخلي — إنزيمات التثبيت والدورة',
            left: 'Stroma',
            right: 'سائل',
            color: EMERALD,
            weight: 1.15,
          },
          {
            name: 'البذور (Granum)',
            detail: 'أقراص التيلاكويدات المكدسة',
            left: 'Granum',
            right: 'أقراص',
            color: AMBER,
            weight: 1.15,
          },
          {
            name: 'حبيبة النشا',
            detail: 'مخزن طاقة داخل الحشوة',
            left: 'Amidon',
            right: 'مخزن',
            color: ROSE,
            weight: 0.9,
          },
        ],
        note: ['التيلاكويدات داخل البذرة = موقع التفاعلات الضوئية.'],
      }),
  },
  {
    file: 'public/lessons/phase11_chapitres_21_22.html',
    slot: 0,
    anchor: 'امتصاص الفوتونات',
    build: () =>
      generateFlowDiagram({
        title: 'امتصاص الفوتونات وأكسدة الماء عند مستوى النظام الضوئي PS II',
        subtitle: 'Photosystème II — photolyse de l’eau (2 H₂O → O₂)',
        steps: [
          { badge: '1', title: 'فوتون ضوئي', lines: ['يُمتص عند P680'], chip: 'hν', color: AMBER },
          { badge: '2', title: 'النظام الضوئي II', lines: ['المركز P680'], chip: 'PS II', color: CYAN },
          {
            badge: '3',
            title: 'تصريف الماء',
            lines: ['2 H₂O → O₂ ↑ + 4H⁺'],
            chip: 'Photolyse',
            color: ROSE,
          },
          { badge: '4', title: '2 e⁻ / 4 H⁺', lines: ['إلى ناقل الإلكترون'], chip: 'e⁻', color: EMERALD },
        ],
        lanes: ['طاقة الفوتون', 'P680*', 'فرز الضوئات'],
        note: ['التجويف (Lumen) غني بـ H⁺ والحشوة (Stroma) فقيرة — تدرّج يُستخدم لاحقًا.'],
      }),
  },
  {
    file: 'public/lessons/phase11_chapitres_21_22.html',
    slot: 1,
    anchor: 'نقل الإلكترونات',
    build: () =>
      generateFlowDiagram({
        title: 'نقل الإلكترونات وضخ البروتونات لتوليد طاقة ATP',
        subtitle: 'Chaîne de transfert — H⁺ puis ATP synthase',
        steps: [
          { badge: '1', title: 'نقل الإلكترونات', lines: ['عبر الناقل T₂'], chip: 'e⁻', color: CYAN },
          { badge: '2', title: 'ضخ H⁺', lines: ['من الحشوة إلى التجويف'], chip: 'H⁺', color: ROSE },
          { badge: '3', title: 'ATP synthase', lines: ['عودة H⁺ نحو الحشوة'], chip: 'Turbine', color: AMBER },
          { badge: '4', title: 'ADP + Pi → ATP', lines: ['في الحشوة'], chip: 'ATP', color: EMERALD },
        ],
        lanes: ['سُلّم e⁻', 'تركيز H⁺ مرتفع', 'تدفق H⁺'],
        note: ['التجويف: H⁺ مرتفع جدًا | الحشوة: منخفض — القوة الدافعة لـ ATP synthase.'],
      }),
  },

  /* --------------- phase14 respiration/fermentation · phase15 comparaison + cycle --------------- */
  {
    file: 'public/lessons/phase14_chapitres_27_28.html',
    slot: 0,
    anchor: 'السلسلة التنفسية',
    build: () =>
      generateFlowDiagram({
        title: 'السلسلة التنفسية: ضخ H⁺ عبر ناقلات الغشاء (تركيز H⁺ مرتفع جدًا)',
        subtitle: 'Membrane interne — navette d’électrons, pompage H⁺ et ATP',
        steps: [
          { badge: '1', title: 'NADH → NAD⁺', lines: ['التخلي عن e⁻ عند T₁'], chip: 'NADH', color: CYAN },
          { badge: '2', title: 'الناقل T₁ → T₆', lines: ['e⁻ ينتقل عبر الغشاء'], chip: 'e⁻', color: AMBER },
          {
            badge: '3',
            title: '½ O₂ + 2H⁺ + 2e⁻ → H₂O',
            lines: ['المرحلة النهائية'],
            chip: 'H₂O',
            color: ROSE,
          },
          { badge: '4', title: 'ATP synthase', lines: ['ADP + Pi → ATP'], chip: '≈38 ATP', color: EMERALD },
        ],
        lanes: ['e⁻ مفقود', 'ضخ H⁺', 'عودة H⁺'],
        note: ['أكسدة NADH على الناقلات تخفض H⁺ — والمحصلة النهائية H₂O و ATP.'],
      }),
  },
  {
    file: 'public/lessons/phase14_chapitres_27_28.html',
    slot: 1,
    anchor: 'التخمر',
    build: () =>
      generatePanelCompare({
        title: 'مخطط التخمر اللبني والكحولي: هدم جزئي للمادة العضوية',
        subtitle: 'Fermentation lactique / alcoolique — 2 ATP seulement',
        panels: [
          {
            title: 'التخمر اللبني',
            glyph: 'L',
            color: ROSE,
            lines: ['2 حمض بيروفيك (C₃)', '2 حمض لبني (C₃)', 'تعب عضلي / لبن رائب'],
          },
          {
            title: 'التخمر الكحولي',
            glyph: 'A',
            color: AMBER,
            lines: ['2 حمض بيروفيك (C₃)', '2 إيثانول (C₂) + 2CO₂↑', 'خميرة البيرة'],
          },
        ],
        note: ['كلاهما في الهيولى، بدون O₂، ويكتفي بـ 2 ATP (هدم جزئي للمادة العضوية).'],
      }),
  },
  {
    file: 'public/lessons/phase15_chapitres_29_30.html',
    slot: 0,
    anchor: 'اتجاه ضخ البروتونات',
    build: () =>
      generatePanelCompare({
        title: 'مقارنة اتجاه ضخ البروتونات (H⁺) في الصانعة والميتوكندرون',
        subtitle: 'Sens du pompage H⁺ — chloroplaste vs mitochondrie',
        panels: [
          {
            title: 'التيلاكويد في الصانعة الخضراء',
            glyph: 'Chl',
            color: EMERALD,
            lines: ['الحشوة (Stroma)', 'تجويف التيلاكويد: H⁺', 'ATP في الحشوة'],
          },
          {
            title: 'الغشاء الداخلي (العرف) في الميتوكندرون',
            glyph: 'Mit',
            color: VIOLET,
            lines: ['الفراغ بين الغشائين: H⁺', 'المادة الأساسية (Matrice)', 'ATP في المادة الأساسية'],
          },
        ],
        note: ['H⁺ يُضخ في كل عضية إلى حيز معزول ثم يعود عبر ATP synthase.'],
      }),
  },
  {
    file: 'public/lessons/phase15_chapitres_29_30.html',
    slot: 1,
    anchor: 'التكامل البيئي',
    build: () =>
      generateFlowDiagram({
        title: 'التكامل البيئي: دورة المادة المغلقة وتدفق الطاقة المفتوح',
        subtitle: 'Cycle du carbone — flux d’énergie unidirectionnel',
        steps: [
          { badge: '1', title: 'الشمس', lines: ['طاقة ضوئية'], chip: 'Soleil', color: AMBER },
          {
            badge: '2',
            title: 'النباتات (التركيب الضوئي)',
            lines: ['CO₂ + H₂O', 'مادة عضوية + O₂'],
            chip: 'Photosynthèse',
            color: EMERALD,
          },
          {
            badge: '3',
            title: 'الحيوانات (التنفس)',
            lines: ['O₂ + مادة عضوية', 'CO₂ + H₂O'],
            chip: 'Respiration',
            color: CYAN,
          },
          { badge: '4', title: 'حرارة متبددة', lines: ['طاقة مفقودة'], chip: 'Chaleur', color: ROSE },
        ],
        lanes: ['طاقة ضوئية', 'مادة عضوية + O₂', 'CO₂ + H₂O'],
        loop: 'دورة المادة مغلقة — الطاقة متبددة ولا تُستعاد',
        note: ['الكتلة الحية تعيد استخدام المادة، أما الطاقة فتتبدد كحرارة.'],
      }),
  },

  /* ==================== LOT 2B — GÉOLOGIE (phase16 → phase22) ==================== */
  {
    file: 'public/lessons/phase16_chapitres_31_32.html',
    slot: 0,
    anchor: 'أنواع الحدود التكتونية',
    build: () =>
      generateLayerStack({
        title: 'مقطع رأسي في الغلاف الصخري وأنواع الحدود التكتونية',
        subtitle: 'Lithosphère — divergence, convergence et asthénosphère',
        leftHead: 'الحدّ',
        rightHead: 'الحركة',
        bands: [
          {
            name: 'ظهرة (تباعد)',
            detail: 'صفيحة محيطية 1 + صفيحة محيطية 2 — خلق قشرة جديدة',
            left: 'Divergence',
            right: '↔ تباعد',
            color: EMERALD,
            weight: 1.1,
          },
          {
            name: 'غوص (تقارب)',
            detail: 'صفيحة محيطية باردة وكثيفة تغوص تحت صفيحة قارية 3',
            left: 'Convergence',
            right: '↘ غوص',
            color: ROSE,
            weight: 1.1,
          },
          {
            name: 'الاستينوسفير',
            detail: 'مطاطي لدن ساخن — محرّك حركة الصفائح',
            left: 'Asthénosphère',
            right: 'لدن',
            color: AMBER,
            weight: 1,
          },
        ],
        note: ['الحدود الثلاثة: ظهرة (تباعد) · غوص (تقارب) · تصادم قاري (سلسلة جبال).'],
      }),
  },
  {
    file: 'public/lessons/phase16_chapitres_31_32.html',
    slot: 1,
    anchor: 'تناوب أشرطة المغناطيسية',
    build: () =>
      generatePanelCompare({
        title: 'تناوب أشرطة المغناطيسية وسمك الرسوبيات على جانبي الظهرة',
        subtitle: 'Anomalies magnétiques — symétrie de part et d’autre du rift',
        panels: [
          {
            title: 'محور الظهرة (Rift)',
            glyph: '0',
            color: ROSE,
            lines: ['حديث جدًا ≈ 0 سنة', 'أشرطة عادية ومقلوبة متعاقبة'],
          },
          {
            title: 'الجانبان المتقابلان',
            glyph: '↔',
            color: CYAN,
            lines: ['رسوبيات قديمة وسميكة', 'أشرطة متناظرة الجانبين'],
          },
        ],
        exchanges: [{ label: 'اتساع وتباعد القاع نحو القارات', color: '#38bdf8' }],
        note: ['كلما بعدنا عن المحور زاد عمر الرسوبيات وسمكها — دليل توسع القاع.'],
      }),
  },

  {
    file: 'public/lessons/phase17_chapitres_33_34.html',
    slot: 0,
    anchor: 'منطقة غوص صفيحة محيطية',
    build: () =>
      generateLayerStack({
        title: 'مقطع رأسي في منطقة غوص صفيحة محيطية تحت صفيحة قارية',
        subtitle: 'Subduction — fosse, prisme, arc volcanique et plan de Benioff',
        leftHead: 'العنصر',
        rightHead: 'الحالة',
        bands: [
          {
            name: 'صفيحة محيطية (باردة وكثيفة)',
            detail: 'تغوص في الاستينوسفير بسبب كثافتها',
            left: 'Océanique',
            right: 'باردة',
            color: CYAN,
            weight: 1.05,
          },
          {
            name: 'الخندق وموشور المنضد',
            detail: 'منطقة الغوص — غوص بارد لصفيحة تحت أخرى',
            left: 'Fosse',
            right: 'منضد',
            color: AMBER,
            weight: 1.05,
          },
          {
            name: 'صفيحة قارية (طافية)',
            detail: 'قوس بركاني انفجاري فوق منطقة الغوص',
            left: 'Continentale',
            right: 'طافية',
            color: ROSE,
            weight: 1,
          },
          {
            name: 'الاستينوسفير (ساخن جدًا)',
            detail: 'مستوى بنيوف: زلازل عميقة تدريجيًا',
            left: 'Asthénosphère',
            right: 'Plan de Benioff',
            color: EMERALD,
            weight: 1,
          },
        ],
        note: ['مستوى بنيوف يمتد من الخندق تحت القوس البركاني (زلازل عميقة).'],
      }),
  },
  {
    file: 'public/lessons/phase17_chapitres_33_34.html',
    slot: 1,
    anchor: 'تحرر الماء',
    build: () =>
      generateFlowDiagram({
        title: 'تحرر الماء وإماهة بيريدوتيت الصفيحة الطافية ثم الانصهار',
        subtitle: 'Déshydratation → hydratation → fusion partielle',
        steps: [
          { badge: '1', title: 'صفيحة غائصة', lines: ['تحول معدني بفعل الضغط'], chip: 'Subduction', color: CYAN },
          { badge: '2', title: 'تحرر الماء H₂O', lines: ['يخرج من المعادن المائية'], chip: 'H₂O', color: AMBER },
          {
            badge: '3',
            title: 'برنس علوي مماه',
            lines: ['Péridotite hydraté'],
            chip: 'Péridotite',
            color: ROSE,
          },
          {
            badge: '4',
            title: 'انصهار جزئي',
            lines: ['أنديزيت (سطحي)', 'غرانودوريت (عميق)'],
            chip: 'Magma',
            color: EMERALD,
          },
        ],
        lanes: ['تحول معدني', 'إماهة', 'انصهار جزئي'],
        note: ['المصهر نفسه: أنديزيت في السطح وغرانودوريت في العمق.'],
      }),
  },

  {
    file: 'public/lessons/phase18_chapitres_35_36.html',
    slot: 0,
    anchor: 'طرق انتقال الحرارة',
    build: () =>
      generatePanelCompare({
        title: 'طرق انتقال الحرارة في أغلفة الأرض (توصيل مقابل حمل)',
        subtitle: 'Conduction dans la lithosphère vs convection dans le manteau',
        panels: [
          {
            title: 'الغلاف الصخري الصلب',
            glyph: 'L',
            color: CYAN,
            lines: ['توصيل (Conduction)', 'انتقال بطيء جدًا', 'دون حركة مادة'],
          },
          {
            title: 'البرنس اللدن',
            glyph: 'A',
            color: AMBER,
            lines: ['تيارات الحمل (Convection)', 'مع حركة مادة', 'صعود ساخن / هبوط بارد'],
          },
        ],
        exchanges: [{ label: 'حرارة الباطن ↑', color: '#fbbf24', rtl: true }],
        note: ['Manteau - Asthénosphère: الحمل الحراري هو محرّك حركة الصفائح.'],
      }),
  },
  {
    file: 'public/lessons/phase18_chapitres_35_36.html',
    slot: 1,
    anchor: 'خلية الحمل الحراري',
    build: () =>
      generateFlowDiagram({
        title: 'خلية الحمل الحراري في البرنس المحركة للصفائح',
        subtitle: 'Cellule de convection — panache, rift, subduction',
        steps: [
          {
            badge: '1',
            title: 'حدود البرنس مع النواة',
            lines: ['منطقة ساخنة جدًا'],
            chip: 'Chaleur',
            color: ROSE,
          },
          { badge: '2', title: 'عمود ساخن صاعد', lines: ['Panache خفيف'], chip: 'Panache', color: AMBER },
          {
            badge: '3',
            title: 'ظهرة محيطية (تباعد)',
            lines: ['صفيحة محيطية جديدة'],
            chip: 'Rift',
            color: CYAN,
          },
          {
            badge: '4',
            title: 'صفيحة باردة غائصة',
            lines: ['عودة المادة نحو البرنس'],
            chip: 'Subduction',
            color: EMERALD,
          },
        ],
        lanes: ['صعود', 'تباعد', 'تبريد وغوص'],
        loop: 'دورة مغلقة: النواة ← ظهرة ← غوص ← البرنس',
        note: ['خلية الحمل الحراري في البرنس هي المحرّك الأساسي لحركة الصفائح.'],
      }),
  },

  {
    file: 'public/lessons/phase21_chapitres_41_42.html',
    slot: 0,
    anchor: 'محور الظهرة',
    build: () =>
      generateLayerStack({
        title: 'مقطع في محور الظهرة: صعود البيريدوتيت وتقاطع منحنى الصلابة',
        subtitle: 'Ridge — péridotite en ascension, fusion par décompression',
        leftHead: 'المجال',
        rightHead: 'الظاهرة',
        bands: [
          {
            name: 'مياه المحيط',
            detail: 'تبريد سريع لبازلت الوسائد (Pillow Lavas)',
            left: 'Océan',
            right: 'تبريد سريع',
            color: CYAN,
            weight: 1,
          },
          {
            name: 'غرفة ماغماتية',
            detail: 'تحت محور الظهرة مباشرة',
            left: 'Chambre',
            right: 'انصهار',
            color: ROSE,
            weight: 1,
          },
          {
            name: 'صعود سريع للبيريدوتيت الساخن',
            detail: 'انخفاض الضغط P مع ثبات الحرارة T',
            left: 'Péridotite',
            right: 'ساخن',
            color: AMBER,
            weight: 1.15,
          },
          {
            name: 'منحنى الصلابة',
            detail: 'تقاطع مسار الصعود مع المنحنى ← انصهار',
            left: 'Solidus',
            right: 'تقاطع',
            color: EMERALD,
            weight: 1,
          },
        ],
        note: ['الصعود يخفض الضغط دون تبريد ← تقاطع منحنى الصلابة ← انصهار جزئي.'],
      }),
  },
  {
    file: 'public/lessons/phase21_chapitres_41_42.html',
    slot: 1,
    anchor: 'سلسلة جبال التصادم',
    build: () =>
      generateLayerStack({
        title: 'مقطع رأسي في سلسلة الهيمالايا: تقصير وتسميك القشرة',
        subtitle: 'Collision continentale — Himalaya et racine crustale (70 km)',
        leftHead: 'العنصر',
        rightHead: 'الأثر',
        bands: [
          {
            name: 'قارة الهند (دافعة →)',
            detail: 'صفيحة قارية اندفعت نحو آسيا (← آسيا)',
            left: 'Inde',
            right: '→ دفع',
            color: ROSE,
            weight: 1,
          },
          {
            name: 'سلسلة جبال الهيمالايا',
            detail: 'قمم شامخة ناتجة عن التطوي',
            left: 'Himalaya',
            right: 'قمم',
            color: AMBER,
            weight: 1,
          },
          {
            name: 'جذر الجبل',
            detail: 'تسميك القشرة حتى 70 كم',
            left: 'Racine',
            right: '70 كم',
            color: VIOLET,
            weight: 1.2,
          },
          {
            name: 'الاستينوسفير',
            detail: 'Asthénosphère — ملاط لدن أسفل الجذر',
            left: 'Asthénosphère',
            right: 'لدن',
            color: EMERALD,
            weight: 1,
          },
        ],
        note: ['تصادم قارتين ← تقصير وتسميك القشرة ← ارتفاع أعلى سلسلة جبال.'],
      }),
  },

  {
    file: 'public/lessons/phase22_chapitres_43_44.html',
    slot: 0,
    anchor: 'دورة الصخور',
    build: () =>
      generateFlowDiagram({
        title: 'دورة الصخور الجيوديناميكية في القشرة والبرنس',
        subtitle: 'Cycle des roches — magmatiques, sédimentaires, métamorphiques',
        steps: [
          {
            badge: '1',
            title: 'الماغما (الصهارة)',
            lines: ['تبريد وتصلب'],
            chip: 'Magma',
            color: ROSE,
          },
          {
            badge: '2',
            title: 'صخور نارية / مغماتية',
            lines: ['تجوية وتعرية وترسيب'],
            chip: 'Ignée',
            color: AMBER,
          },
          { badge: '3', title: 'صخور رسوبية', lines: ['ترسيب ثم ترصص'], chip: 'Sédimentaire', color: CYAN },
          {
            badge: '4',
            title: 'صخور متحولة',
            lines: ['ضغط وحرارة (تحول)'],
            chip: 'Métamorphique',
            color: EMERALD,
          },
        ],
        lanes: ['تبريد وتصلب', 'تجوية وتعرية وترسيب', 'ضغط وحرارة (تحول)'],
        loop: 'انصهار كلي ← عودة الماغما',
        note: ['الدورة مغلقة: نارية ← رسوبية ← متحولة ← انصهار كلي من جديد.'],
      }),
  },
  {
    file: 'public/lessons/phase22_chapitres_43_44.html',
    slot: 1,
    anchor: 'مصيدة بترولية',
    build: () =>
      generateLayerStack({
        title: 'مقطع في مصيدة بترولية (طية محدبة) وترتيب الموائع',
        subtitle: 'Piège anticlinal — couverture, gaz, pétrole, eau salée',
        leftHead: 'الطبقة',
        rightHead: 'الدور',
        bands: [
          {
            name: 'صخر غطاء غير منفذ (طين / جبس)',
            detail: 'يمنع هروب الموائع — شرط أساسي للمصيدة',
            left: 'Couverture',
            right: 'غير منفذ',
            color: VIOLET,
            weight: 1,
          },
          {
            name: 'غاز طبيعي (خفيف جدًا)',
            detail: 'يتمركز في قمة الطية المحدبة',
            left: 'Gaz',
            right: 'أخف',
            color: AMBER,
            weight: 0.95,
          },
          {
            name: 'بترول خام (كثافة متوسطة)',
            detail: 'يتجمع أسفل الغاز',
            left: 'Pétrole',
            right: 'متوسط',
            color: ROSE,
            weight: 1,
          },
          {
            name: 'ماء مالح (كثيف وثقيل)',
            detail: 'يشغل الجزء الأسفل من المخزن',
            left: 'Eau salée',
            right: 'أثقل',
            color: CYAN,
            weight: 1,
          },
          {
            name: 'صخر الأم غني بالمادة العضوية',
            detail: 'سجيل غضاري — مصدر البترول | بئر تنقيب للاستخراج',
            left: 'Roche mère',
            right: 'عضوي',
            color: EMERALD,
            weight: 1.15,
          },
        ],
        note: ['3 شروط: صخر أم عضوي + صخر مخزن منفذ + غطاء غير منفذ (طية محدبة).'],
      }),
  },
];

