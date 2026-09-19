const phase26_js = `
        function sim51(type) {
            if (type === 'pil') simShow('sim51box', '<h3 style="color:#38bdf8; margin-bottom:10px;">🌊 البازلت الوسائدي (Pillow Basalt)</h3><p style="color:#cbd5e1; line-height:1.8;">ينساب ماغما بازلتي ساطع في ماء بارد، فيتشكل "وسادة" مميزة بنفس تبريده. البازلت الوسائدي = شاهد مباشر على تكوّن القشرة المحيطية عند الظهر البحري.</p>');
            else if (type === 'dol') simShow('sim51box', '<h3 style="color:#fbbf24; margin-bottom:10px;">🪨 الدوليريت (Dolerite) والغابرو (Gabbro)</h3><p style="color:#cbd5e1; line-height:1.8;">إذا تبرّك الماغما البازلتي عميقاً تحت القشرة (دوليريت) أو على مدى طويل في صهيرة مغماتية (غابرو حبيبي)، تكوّن بلوراً كبيرة. هذه الصخور الباطنية الكثيفة تُعثر في الأوفيوليت.</p>');
            else if (type === 'serp') simShow('sim51box', '<h3 style="color:#f87171; margin-bottom:10px;">🐍 السربنتينيت (Serpentinite)</h3><p style="color:#cbd5e1; line-height:1.8;">بيريدوتيت البرنس (مليء بالماء) يتفاعل مع أوليفين لتكوين سربنتينيت — صخرة لزجة خضراء تدل على إماهة البرنس. تدلّ على أن اللوح المحيطي قد تم امتصاصه وتحويله.</p>');
            else if (type === 'obd') simShow('sim51box', '<h3 style="color:#c084fc; margin-bottom:10px;">🚚 آلية الانتزاع (Obduction)</h3><p style="color:#cbd5e1; line-height:1.8;">عند إغلاق المحيط بالتصادم، لا يغوص اللوح المحيطي بكثافته الأقل — بل يُرفع (obduction) فوق القارة، يُنقلب، ويُعثر كأوفيوليت. هذه العملية تُظهر الأدلة المباشرة للغوص والإغلاق.</p>');
        }
        function sim52(type) {
            if (type === 'rift') simShow('sim52box', '<h3 style="color:#f97316; margin-bottom:10px;">1️⃣ تشقق قاري (Rifting)</h3><p style="color:#cbd5e1; line-height:1.8;">تبدأ القوار لتتشقق (تيثيس 250-150 م.أ): تتمدد القشرة القارية فينشق عنه وادي صدع، يندفع ماغما بازلتي يمنح البحر الأحمر الأولي.</p>');
            else if (type === 'med') simShow('sim52box', '<h3 style="color:#0ea5e9; margin-bottom:10px;">2️⃣ بحر جنيني (Embryonic Ocean)</h3><p style="color:#cbd5e1; line-height:1.8;">يدور على محيط شاب (البحر الأحمر ≤ 5 م.أ): يزداد العمق والاتساع، تُترسب طبقات رسوبية، والقشرة المحيطية تتوسع.</p>');
            else if (type === 'atl') simShow('sim52box', '<h3 style="color:#38bdf8; margin-bottom:10px;">3️⃣ محيط ناضج (Mature Ocean)</h3><p style="color:#cbd5e1; line-height:1.8;">ينتقل إلى محيط ناضج (الأطلسي ≥ 180 م.أ): يتوسع إلى أبعد، يُنتج قشرة محيطية كاملة (رواسب عميقة + بازلت + غابرو)، وسطح بحري واسع.</p>');
            else if (type === 'sub') simShow('sim52box', '<h3 style="color:#f87171; margin-bottom:10px;">4️⃣ بداية غوص (Initial Subduction)</h3><p style="color:#cbd5e1; line-height:1.8;">عند تصادم الصفائح، يبدأ اللوح المحيطي بالغوص: انقسام الموجات (موهو)، زلازل متعمقة على مستوى بينيوف، وبراكين أنديزيتية.</p>');
            else if (type === 'close') simShow('sim52box', '<h3 style="color:#fbbf24; margin-bottom:10px;">5️⃣ إغلاق المحيط (Ocean Closure)</h3><p style="color:#cbd5e1; line-height:1.8;">يدمر المحيط بالكامل: اللوح ينصهر ويُدمج في البرنس، مع بقايا المحيط تظهر كأوفيوليت فوق القارة.</p>');
            else if (type === 'col') simShow('sim52box', '<h3 style="color:#4ade80; margin-bottom:10px;">6️⃣ تصادم (Collision)</h3><p style="color:#cbd5e1; line-height:1.8;">تلتقي القشرتان القاريتان: الضغط الأفقي يُنشئ طيّات، فوالق عكسية، وجبال عالية (الهيمالايا، الألب). الأوفيوليت يُقفل بينهما. ثم يبدأ افتتاح جديد.</p>');
        }
`;

// =====================================================================
// Écriture des fichiers HTML — 4 leçons passives → actives (v3.2)
// =====================================================================
const OUT = 'public/lessons/';
const jobs = [
  { file: OUT + 'phase23_chapitres_45_46.html', title: 'الدرس 45-46 : بنية الكرة الأرضية — البرنس والقشرة', ch1: phase23_ch1, ch2: phase23_ch2, js: phase23_js },
  { file: OUT + 'phase24_chapitres_47_48.html', title: 'الدرس 47-48 : الغوص والانصهار — آلية وتوازن', ch1: phase24_ch1, ch2: phase24_ch2, js: phase24_js },
  { file: OUT + 'phase25_chapitres_49_50.html', title: 'الدرس 49-50 : التصادم القاري — التكوينات والتقلص', ch1: phase25_ch1, ch2: phase25_ch2, js: phase25_js },
  { file: OUT + 'phase26_chapitres_51_52.html', title: 'الدرس 51-52 : الأوفيوليت والدورة الكاملة لويلسون', ch1: phase26_ch1, ch2: phase26_ch2, js: phase26_js },
];

for (const j of jobs) {
  const html = buildPage(j.title, j.ch1, j.ch2, j.js);
  writeFileSync(j.file, html, 'utf8');
  console.log('✓ ' + j.file + ' (' + html.length + ' octets)');
}
