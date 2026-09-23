#!/usr/bin/env tsx
// scripts/check-lecons.ts — CI guard for v3.2 leçons
// Vérifie que chaque HTML content/lessons/*.html contient :
// - sommaire sticky (id="sommaire")
// - au moins 1 miftah-encadre
// - badges c1-badge (et c2-badge pour les phases)
// - ids ch1-step* / ch2-step* (ou step* pour transcription)
// - CSS v3.2 (sommaire sticky)

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const dir = 'content/lessons';
const files = readdirSync(dir).filter(f => f.endsWith('.html')).sort();

let failures = 0;
console.log(`🔍 check:lecons — ${files.length} fichiers`);

for (const file of files) {
  const path = join(dir, file);
  const html = readFileSync(path, 'utf-8');
  const errs: string[] = [];

  if (!html.includes('id="sommaire"')) errs.push('sommaire manquant');
  if (!html.includes('miftah-encadre')) errs.push('miftah-encadre manquant');
  if (!html.includes('quiz-badge')) errs.push('quiz-badge manquant');
  if (!html.includes('.sommaire{position:sticky')) errs.push('CSS sommaire manquant');

  // ids
  if (file.startsWith('lecon_')) {
    if (!html.includes('id="step1"')) errs.push('ids step* manquants');
    if (!html.includes('id="c1-badge"')) errs.push('c1-badge manquant');
  } else {
    if (!html.includes('id="ch1-step1"') || !html.includes('id="ch2-step1"')) errs.push('ids ch1/ch2-step* manquants');
    if (!html.includes('id="c1-badge"') || !html.includes('id="c2-badge"')) errs.push('c1/c2-badge manquants');
  }

  // generic JS
  if (!html.includes('function scrollToStep') || !html.includes('function updateBadges')) {
    // transcription uses updateBadges as well now (generic)
    if (!html.includes('scrollToStep')) errs.push('JS scrollToStep manquant');
  }

  if (errs.length) {
    console.error(`✗ ${file} → ${errs.join(', ')}`);
    failures++;
  } else {
    console.log(`✓ ${file}`);
  }
}

if (failures) {
  console.error(`\n${failures}/${files.length} leçons en échec — v3.2 incomplet`);
  process.exit(1);
} else {
    console.log(`\n✓ Toutes les leçons v3.2 OK (${files.length}/${files.length})`);
}
