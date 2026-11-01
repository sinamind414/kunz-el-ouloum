import { HOSILA_OFFICIELLES } from '../src/data/hosila';
for (const u of HOSILA_OFFICIELLES) {
  for (const b of u.blocs) {
    const sansAr = b.texte.replace(/[\u0600-\u06FF\s]/g, '');
    if (sansAr.length === 1) console.log('FRAG1', u.id, b.kind, JSON.stringify(b.texte), 'num=', JSON.stringify(b.num ?? ''));
  }
  const t = u.blocs.map((b) => (b.num ? `${b.num} ${b.texte}` : b.texte)).join(' ');
  if (!t.includes('الإدماج العصبي')) console.log('ANCHOR', u.id, '| adja?', t.includes('الادماج'), '| إدماج?', t.includes('إدماج'), '| مخدرات?', t.includes('المخدرات'));
}
