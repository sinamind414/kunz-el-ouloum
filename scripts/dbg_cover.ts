// dbg_cover.ts — diagnostique la couverture d'une ligne source dans le بنك الحفظ
// enrichi (verrou okachaEnriched.lock.test.ts). Usage : npx tsx scripts/dbg_cover.ts
import { OKACHA_UNITES, OKACHA_METHODO } from '../src/data/okacha';
import {
  OKACHA_UNITES_ENRICHIES,
  OKACHA_METHODO_SECTIONS,
  ENRICH_FIXES,
  normAr,
} from '../src/data/okachaEnriched';
import { assainirTexte, estDechetOCR } from '../src/data/okachaQuality';

const flat = (s: string) => normAr(s).replace(/\s+/g, '');
const bare = (s: string) =>
  flat(assainirTexte(s)).replace(/^[0-9٠-٩اا\-–.٫:\s*•'ʼ?؟]+/, '');
const avecFixes = (ligne: string) => {
  let t = ligne;
  for (const f of ENRICH_FIXES) t = t.split(f.from).join(f.to);
  return t.split('9070').join('90 %');
};
const toutTexte = [
  ...OKACHA_UNITES_ENRICHIES.flatMap((u) => u.blocs.map((b) => b.texte)),
  ...OKACHA_METHODO_SECTIONS.flatMap((s) => s.blocs.map((b) => b.texte)),
]
  .map(bare)
  .join('§');

const cible = process.argv.slice(2).join(' ');
for (const u of OKACHA_UNITES) {
  for (const l of u.lignes) {
    if (!cible || l.includes(cible)) {
      if (!l.trim() || estDechetOCR(l)) continue;
      const attendu = bare(avecFixes(l));
      const ok = toutTexte.includes(attendu);
      console.log(`\n[${ok ? 'OK' : 'KO'}] ${u.id} ${l.slice(0, 60)}`);
      if (!ok) {
        console.log('  attendu (fixes appliqués) :', attendu.slice(0, 300));
        // Préfixe commun maximal pour localiser la divergence
        let i = 0;
        while (i < attendu.length && toutTexte.includes(attendu.slice(0, i + 1))) i++;
        console.log('  couvert jusqu\'à la position :', i);
        console.log('  attendu à partir de là     :', attendu.slice(i, i + 160));
      }
    }
  }
}
