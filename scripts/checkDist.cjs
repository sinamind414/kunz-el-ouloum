// checkDist.cjs — Garde-fou post-build (anti-régression ARCH-001).
// Vérifie que le build de production contient bien les chunks de vues lazy :
// l'obfuscateur javascript-obfuscator (retiré) cassait le code-splitting et le
// build ne produisait que 3 chunks sans contenu pédagogique.
// Échoue (exit 1) si la sortie de dist/ n'est pas saine.
const fs = require('node:fs');
const path = require('node:path');

const distDir = path.join(process.cwd(), 'dist');
const assetsDir = path.join(distDir, 'assets');

const EXPECTED_CHUNKS = [
  // Vues lazy critiques du parcours élève (voir src/App.tsx / LessonsView.tsx).
  'QuizView',
  'CoachView',
  'LessonsView',
  'InteractiveLessonView',
  'TrainingView',
  'ProgressView',
  'MyPathView',
  'MethodologyView',
  // Chunks de contenu et de dépendances majeurs.
  'quizCorpus',
  'vendor-react',
];

const MIN_JS_CHUNKS = 20;

function fail(message) {
  console.error(`❌ checkDist: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  fail('dist/index.html absent — le build Vite n\'a pas produit de sortie.');
}

const jsFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
if (jsFiles.length < MIN_JS_CHUNKS) {
  fail(`seulement ${jsFiles.length} chunk(s) JS dans dist/assets (minimum attendu : ${MIN_JS_CHUNKS}). ` +
    'Le code-splitting des vues lazy est probablement cassé — ne pas déployer.');
}

for (const name of EXPECTED_CHUNKS) {
  if (!jsFiles.some((f) => f.startsWith(name + '-'))) {
    fail(`chunk attendu "${name}-*" absent de dist/assets. Le build de production est incomplet.`);
  }
}

// Aucune chaîne du plugin d'obfuscation ne doit subsister.
for (const file of jsFiles) {
  const content = fs.readFileSync(path.join(assetsDir, file), 'utf8');
  if (content.includes('_0x') && content.includes('javascript-obfuscator')) {
    fail(`traces d'obfuscation dans ${file} — la configuration de build est à vérifier.`);
  }
}

console.log(`✅ checkDist: ${jsFiles.length} chunks JS, vues lazy et contenu présents — build sain.`);
