import { noterExerciceCalibre } from './src/data/dictionaries/calibrationBac2025';
import { MEFTA_BAC_EXERCISES } from './src/data/meftahManhajia';

// Contrôle Meftah après granularité
for (const ex of MEFTA_BAC_EXERCISES) {
  const e = (ex.id.endsWith('1')?1:ex.id.endsWith('2')?2:3) as 1|2|3;
  const texte = ex.questions.flatMap(q=>q.writeAr).join('\n');
  const n = noterExerciceCalibre(texte, 1, e);
  console.log(`Meftah Ex${e}: ${n.points}/${n.maxPts} cov=${(n.couverture*100).toFixed(0)}% plafonds=${n.plafonds.map(p=>p.type).join(',')||'—'}`);
}

// Le scénario exact de la limite P5
const n = noterExerciceCalibre('ARNm ARNr ARNt', 1, 1);
console.log('\n« ARNm ARNr ARNt » sur S1-Ex1:', n.points + '/' + n.maxPts, 'cov=' + (n.couverture*100).toFixed(0) + '%', 'plafonds=' + n.plafonds.map(p=>p.type).join(','));
for (const v of n.verdicts.filter(v=>v.id.includes('Q1') || v.id.includes('Q2')))
  console.log('  ', v.id.split('/').slice(-2).join('/'), v.pointsCredites + '/' + v.points, v.composantesTotal ? `(${v.composantesDetectees}/${v.composantesTotal})` : '');

// Rôle RIP seul vs complet
const n2 = noterExerciceCalibre('RIP', 1, 1);
const rip = n2.verdicts.find(v=>v.id.includes('RIP'))!;
console.log('\n« RIP » seul: item RIP =', rip.pointsCredites + '/' + rip.points, `(${rip.composantesDetectees}/${rip.composantesTotal})`);
const n3 = noterExerciceCalibre('RIP تكسر الرابطة بين الأدنين وسكر الريبوز', 1, 1);
const rip3 = n3.verdicts.find(v=>v.id.includes('RIP'))!;
console.log('« RIP + أدنين + ريبوز »: item RIP =', rip3.pointsCredites + '/' + rip3.points, `(${rip3.composantesDetectees}/${rip3.composantesTotal})`);

// Exhaustif : textes officiels + glossaire
import { attendusDeGroupe } from './src/data/dictionaries/attendusBac2025';
for (const s of [1,2] as const) for (const e of [1,2,3] as const) {
  let rep = attendusDeGroupe(s,e).items.map(i=>i.texteAr).join(' ');
  if (s===1) rep += '\n' + MEFTA_BAC_EXERCISES.filter(x=>x.id==='bac2025-ex'+e).flatMap(q=>q.questions.flatMap(qq=>qq.writeAr)).join('\n');
  if (s===2 && e===1) rep += ' فوسفات';
  const n = noterExerciceCalibre(rep, s, e);
  console.log(`Exhaustif S${s}-Ex${e}: ${n.points}/${n.maxPts} cov=${(n.couverture*100).toFixed(0)}%`);
  if (n.points !== n.maxPts) for (const v of n.verdicts.filter(v=>v.pointsCredites < v.points)) console.log('   PARTIEL:', v.id, v.pointsCredites+'/'+v.points, v.composantesTotal?`(${v.composantesDetectees}/${v.composantesTotal})`:'', v.id.startsWith('corr')? v.texteAr.slice(0,40) : '');
}
