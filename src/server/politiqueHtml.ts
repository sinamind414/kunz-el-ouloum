// politiqueHtml.ts — la politique de confidentialité en page WEB autonome (H2).
//
// Pourquoi ce module existe
// ------------------------
// Google Play exige, pour toute application publiée, une URL **publique** de
// politique de confidentialité. Le dépôt contient déjà ce texte
// (`src/data/politiqueConfidentialite.ts`, source unique, verrouillé par un test
// qui vérifie qu'il décrit bien ce que le code fait) — mais il n'était lisible
// QUE dans l'application, derrière JavaScript. Deux problèmes concrets pour une
// soumission :
//
//   1. un relecteur qui ouvre l'URL sans exécuter le JavaScript de l'application
//      ne voit rien : ce n'est pas une politique publique, c'est une application ;
//   2. le texte est en arabe seul — la vérification par un examinateur
//      non arabophone est un motif classique de rejet.
//
// Ce module rend donc le MÊME texte (aucune deuxième source à maintenir) en HTML
// complet, en arabe ET en français, sans une ligne de JavaScript. Il est appelé
// par la route `GET /privacy` de `server.ts`.

import {
  CONTACT_PUBLIC,
  DERNIERE_MISE_A_JOUR,
  SECTIONS_CONFIDENTIALITE,
  SECTIONS_CONFIDENTIALITE_FR,
  type SectionConfidentialite,
} from '../data/politiqueConfidentialite';

/** Échappement HTML — le texte est interne, mais une page publique ne prend pas ce risque. */
export function echapperHtml(texte: string): string {
  return texte
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function blocSections(sections: SectionConfidentialite[], titreBalise: 'h2' | 'h3'): string {
  return sections
    .map(
      (s) => `      <section>
        <${titreBalise}>${echapperHtml(s.titre)}</${titreBalise}>
${s.paragraphes.map((p) => `        <p>${echapperHtml(p)}</p>`).join('\n')}
      </section>`,
    )
    .join('\n');
}

export interface OptionsPolitique {
  /** Nom affiché du produit. */
  produit?: string;
  /** URL publique de la page (pour les métadonnées de partage). */
  urlPublique?: string;
  /** Contact affiché (défaut : `CONTACT_PUBLIC`). */
  contact?: string;
}

/**
 * Rend la page complète. Autonome : aucune ressource externe (ni police, ni
 * script) — une page qu'un relecteur peut lire même sans réseau, et qu'un
 * hébergement statique pourrait servir tel quel.
 */
export function rendrePolitiqueHtml(options: OptionsPolitique = {}): string {
  const produit = options.produit ?? 'كنز العلوم — Kunz El Ouloum';
  const contact = options.contact ?? CONTACT_PUBLIC;
  const urlPublique = options.urlPublique ?? '';
  const twitter = ''; // eslint-disable-line @typescript-eslint/no-unused-vars

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>سياسة الخصوصية — Politique de confidentialité — ${echapperHtml(produit)}</title>
<meta name="robots" content="index,follow">
<meta name="description" content="Politique de confidentialité de ${echapperHtml(produit)} (SVT BAC Algérie) : données collectées, finalités, droits, contact.">
${urlPublique ? `<link rel="canonical" href="${echapperHtml(urlPublique)}">` : ''}
<style>
  :root { color-scheme: light dark; }
  body { margin: 0 auto; padding: 1.25rem; max-width: 46rem; line-height: 1.7;
         font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Naskh Arabic", sans-serif; }
  header { border-bottom: 2px solid #006d37; padding-bottom: .75rem; margin-bottom: 1.25rem; }
  h1 { font-size: 1.4rem; margin: 0 0 .35rem; }
  h2 { font-size: 1.05rem; color: #006d37; margin: 1.5rem 0 .4rem; }
  h3 { font-size: 1rem; color: #006d37; margin: 1.25rem 0 .4rem; }
  p { margin: .35rem 0 .6rem; }
  .meta { font-size: .85rem; opacity: .85; }
  .encadre { border: 1px solid #006d37; border-radius: .6rem; padding: .75rem 1rem; margin: 1rem 0; }
  .fr { direction: ltr; text-align: left; }
  hr.sep { margin: 2.5rem 0; border: 0; border-top: 1px dashed currentColor; opacity: .35; }
  footer { margin-top: 2rem; font-size: .85rem; opacity: .85; }
  @media (prefers-color-scheme: dark) { h1, h2, h3 { color: #7ee2a8; } header { border-color: #7ee2a8; } }
</style>
</head>
<body>
<header>
  <h1>سياسة الخصوصية — Politique de confidentialité</h1>
  <p class="meta">${echapperHtml(produit)} · آخر تحديث / dernière mise à jour : ${echapperHtml(DERNIERE_MISE_A_JOUR)}</p>
</header>

<p class="encadre">هذه الصفحة هي النص الرسمي لسياسة الخصوصية. النص العربي هو المرجع.
<br><span dir="ltr">Cette page est le texte officiel de la politique de confidentialité. Le texte arabe fait foi ; la version française est une traduction de courtoisie, section par section, sans ajout ni retrait.</span></p>

<div lang="ar" dir="rtl">
${blocSections(SECTIONS_CONFIDENTIALITE, 'h2')}
      <section>
        <h2>٨. الاتصال</h2>
        <p>${echapperHtml(contact)}</p>
      </section>
</div>

<hr class="sep">

<div class="fr" lang="fr" dir="ltr">
  <h2 style="font-size:1.2rem">Version française (traduction)</h2>
${blocSections(SECTIONS_CONFIDENTIALITE_FR, 'h3')}
      <section>
        <h3>8. Contact</h3>
        <p>${echapperHtml(contact)}</p>
      </section>
</div>

<footer>
  <p>${echapperHtml(produit)} — ${echapperHtml(DERNIERE_MISE_A_JOUR)}</p>
</footer>
</body>
</html>
`;
}
