// tools/audit-lessons.mjs — Inventaire complet des leçons passives + actives pour l'audit du programme.
import { readFileSync, writeFileSync } from 'node:fs';

const data = readFileSync('src/lessonData.ts', 'utf-8');
const re = /"(phase\d+_chapitres_\d+_\d+|lecon_transcription)":\s*\{[\s\S]*?titleAr:\s*`([^`]*)`,\s*[\s\S]*?breadcrumb:\s*`([^`]*)`/g;
let out = '## PASSIVE LESSONS (lessonData.ts)\n';
let m;
while ((m = re.exec(data))) out += `${m[1]}\n  T: ${m[2]}\n  U: ${m[3]}\n`;

const act = readFileSync('src/data/activeLessons.ts', 'utf-8');
out += '\n## ACTIVE LESSONS (activeLessons.ts)\n';
const re2 = /id:\s*'([a-z0-9-]+)',\s*\n\s*title:\s*'([^']*)'/g;
while ((m = re2.exec(act))) out += `${m[1]}\n  T: ${m[2]}\n`;

const seq = readFileSync('src/data/unitLessonSequences.ts', 'utf-8');
out += '\n## OFFICIAL_PROGRAM_SEQUENCE\n' + seq.slice(seq.indexOf('OFFICIAL_PROGRAM_SEQUENCE'), seq.indexOf('TWO_CHAPTER_KEY_RE'));

writeFileSync('tmp_audit_lessons.txt', out, 'utf-8');
console.log('written tmp_audit_lessons.txt, lessons found:', (out.match(/^phase|^lecon_transcription/gm) || []).length);