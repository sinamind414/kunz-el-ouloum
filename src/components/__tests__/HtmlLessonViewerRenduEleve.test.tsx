// HtmlLessonViewerRenduEleve.test.tsx — RENDU ÉLÈVE (GO propriétaire 24/10/2026).
//
// Deux défauts constatés sur émulateur (APK 1.2) :
//  1. des notes internes de génération fuient à l'écran (« الوحدة: D2-U6 — …
//     نص بتنسيق قرائي… ») — 11 <p> inline font-size:11px dans ~7 fichiers
//     phase*.html + 1 <p class="hosila-meta"> (phase7_chapitres_13_14.html) ;
//  2. h1 (2.1rem/900) et .section-title (1.3rem) tiennent sur 3+ lignes en mobile.
//
// Les fichiers lessons/*.html restent INTACTS sur disque (projet concurrent non
// signé) : la correction vit dans compileLecon() du lecteur, AU RENDU. On teste
// la fonction pure EXPORTÉE (aucun mock, aucun I/O — couvrable par vitest ET
// jest, cf. limite vi.mock du shim jest-vitest-shim.ts) sur le HTML SERVI :
//   - chips retirées (les 2 variantes), paragraphe légitime PRÉSERVÉ
//     (garde-fou contre une regex trop large) ;
//   - <style id="pfe-rendu-eleve"> injecté APRÈS le style de la leçon ;
//   - mesureur de hauteur + bloc figureZoom toujours présents (pipeline intact).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compileLecon } from '../HtmlLessonViewer';
import { FIGURE_ZOOM_MARKER_END, FIGURE_ZOOM_MARKER_START } from '../../utils/figureZoomRuntime';

const LECON_BIDON = [
  '<!DOCTYPE html>',
  '<html dir="rtl" lang="ar"><head><meta charset="utf-8">',
  '<style>h1 { font-size: 2.1rem; font-weight: 900; margin-bottom: 1rem; line-height: 1.3; }</style>',
  '<title>test</title></head><body>',
  '<h1>النشاط 6 : مفهوم الإِنزيم وعلاقته ببنية البروتين</h1>',
  '<div class="section-title"><span class="step-num">1</span><span>وضعية الانطلاق</span></div>',
  '<p class="hosila-meta"><span class="src-chip">الوحدة: D1-U4 — الدفاع عن الذات</span><span>نص بتنسيق قرائي، دون تغيير في المعنى</span></p>',
  '<p style="font-size:11px; color:#92400e; font-weight:700; margin:6px 0;">الوحدة: D2-U6 — التركيب الضوئي — نص بتنسيق قرائي، دون تغيير في المعنى، مع تنسيق قرائي يجعل النص مقروءاً.</p>',
  // Paragraphe LÉGITIME qui commence par « الوحدة » : ne doit PAS être retiré.
  '<p>الوحدة القلبية تنظم الدورة الدموية وفق حاجة الجسم.</p>',
  '<figure><figcaption>رسم تجريبي</figcaption></figure>',
  '</body></html>',
].join('\n');

describe('le HTML servi à l\u2019iframe est rendu ÉLÈVE (notes internes retirées, titres dimensionnés)', () => {
  const doc = compileLecon(LECON_BIDON);

  it('aucune note de génération ne fuit : les 2 variantes sont retirées', () => {
    expect(doc).not.toContain('نص بتنسيق قرائي');
    expect(doc).not.toContain('الوحدة: D2-U6');
    expect(doc).not.toContain('الوحدة: D1-U4');
    // Cibler les BALISES (et non les mots nus) : notre CSS défensif référence
    // légitimement .hosila-meta/.src-chip pour masquer toute variante future.
    expect(doc).not.toContain('<p class="hosila-meta"');
    expect(doc).not.toContain('<p style="font-size:11px');
    expect(doc).toContain('.hosila-meta,.src-chip{display:none!important}');
  });

  it('garde-fou anti-regex large : un paragraphe légitime qui commence par « الوحدة » est PRÉSERVÉ', () => {
    expect(doc).toContain('الوحدة القلبية تنظم الدورة الدموية');
  });

  it('le style de dimensionnement est injecté APRÈS le <style> de la leçon (devant </head>)', () => {
    const iStyle = doc.indexOf('id="pfe-rendu-eleve"');
    const iStyleLecon = doc.indexOf('font-size: 2.1rem');
    const iTete = doc.indexOf('</head>');
    expect(iStyle).toBeGreaterThan(-1);
    expect(iStyleLecon).toBeGreaterThan(-1);
    expect(iStyle).toBeGreaterThan(iStyleLecon);
    expect(iStyle).toBeLessThan(iTete);
    expect(doc).toContain('font-size:1.35rem');
    expect(doc).toContain('.section-title{font-size:1.05rem');
  });

  it('le pipeline existant reste intact : mesureur de hauteur + bloc figureZoom toujours injectés', () => {
    expect(doc).toContain('pfe-lecon-hauteur');
    // injectFigureZoom ré-injecte le bloc canonique au rendu (verrou
    // leconRuntimeZoomRendu.lock.test.ts) : il a survécu à notre
    // remplacement de </body> (IDs canoniques de figureZoomRuntime.ts).
    expect(doc).toContain('id="pfe-zoom-style"');
    expect(doc).toContain('id="pfe-zoom-runtime"');
  });
});

describe('LE « code de page » — le bloc zoom servi est HTML-sûr (réel, 24/10/2026)', () => {
  // Reproduction du défaut élève : le bloc zoom (canonique ou dérivé disque)
  // contient une chaîne JS d'impression avec un '</script>' littéral → le
  // tokenizer referme le script et le reste s'affiche en texte. Ici : la
  // VRAIE leçon sur disque passe par compileLecon, et le HTML servi ne doit
  // contenir AUCUN '</script>' intermédiaire dans le bloc, donc aucun JS en
  // texte visible hors des <script>…</script>.
  const LECON_REELLE = readFileSync(
    resolve(__dirname, '../../../public/lessons/lecon_activite_structure.html'),
    'utf8',
  );

  it('aucune fermeture parasite : le bloc marqué ne contient qu\u2019UN </script> (le légitime), les internes sont <\\/script>', () => {
    const servi = compileLecon(LECON_REELLE);
    const debut = servi.indexOf(FIGURE_ZOOM_MARKER_START);
    const fin = servi.indexOf(FIGURE_ZOOM_MARKER_END, debut);
    expect(debut).toBeGreaterThan(-1);
    expect(fin).toBeGreaterThan(debut);
    const zone = servi.slice(debut, fin);
    // exactement UNE fermeture réelle : celle du bloc canonique injecté
    const fermetures = zone.match(/<\/script>/g) ?? [];
    expect(fermetures).toHaveLength(1);
    // (l'échappement <\/script> n'apparaît que si un bloc dérivé sur disque
    // contient des fermetures internes — sur le canonique, il n'y en a pas.)
  });

  it('aucun JS de zoom ne reste en TEXTE visible hors des <script> (défaut élève corrigé)', () => {
    const servi = compileLecon(LECON_REELLE);
    // on retire les scripts BALANCÉS (le '</script>' échappé ne clôt plus rien)
    const horsScripts = servi.replace(/<script[\s\S]*?<\/script>/g, '');
    expect(horsScripts).not.toContain('__pfeZoom');
    expect(horsScripts).not.toContain('Démontage exact');
    expect(horsScripts).not.toContain('figureFrom');
  });

  it('idempotence : repasser compileLecon sur sa SORTIE ne duplique rien', () => {
    const servi1 = compileLecon(LECON_REELLE);
    const servi2 = compileLecon(servi1);
    expect((servi2.match(/<style id="pfe-zoom-style"/g) ?? []).length).toBe(1);
    expect((servi2.match(new RegExp(FIGURE_ZOOM_MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length).toBe(1);
    expect((servi2.match(/id="pfe-rendu-eleve"/g) ?? []).length).toBe(1);
  });
});
