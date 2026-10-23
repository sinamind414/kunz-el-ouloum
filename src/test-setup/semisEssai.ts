// semisEssai.ts — état d'accès « essai actif » pour la suite de tests.
//
// Depuis le verrou freemium (24/10/2026), un composant rendu en état invité
// affiche l'écran de paiement au lieu de son contenu. Les tests qui prouvent
// le CONTENU (leçons, QCM, sujets blancs, cartes…) doivent donc tourner comme
// un élève en essai. Les tests qui prouvent l'ACCÈS lui-même (accès.test.ts,
// écran de paiement) vident le stockage après le hook global et restent
// maîtres de leur état.
export function semerEssai(): void {
  localStorage.setItem('boussole_token', 'jeton-tests-facturation');
  localStorage.setItem('kunz_acces', JSON.stringify({ statut: 'essai', expireLe: '2099-12-31' }));
}
