// src/utils/latinDigits.ts
// CHIFFRES LATINS PARTOUT — source unique.
// Contexte : l'app est en arabe (dir=rtl) mais les chiffres doivent rester
// latins (0-9) pour la lisibilité scolaire DZ (notes /20, ICM %, durées).
// - toLatinDigits() : convertit les chiffres arabes orientaux (٠-٩ U+0660-69)
//   et persans (۰-۹ U+06F0-F9) déjà présents dans les contenus/données.
// - AR_LATN : locale arabe avec système de numération latin forcé —
//   `ar-DZ` seul peut rendre ٠-٩ selon le navigateur ; `-u-nu-latn`
//   garantit 0-9 tout en gardant les noms de mois arabes.

export const AR_LATN = 'ar-DZ-u-nu-latn';

/** Convertit ٠-٩ / ۰-۹ → 0-9 dans n'importe quelle chaîne. */
export function toLatinDigits(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/** Date/heure arabe MAIS chiffres latins garantis. */
export function fmtDateLatn(
  date: Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  return toLatinDigits(date.toLocaleDateString(AR_LATN, options));
}

/** Date+heure arabe MAIS chiffres latins garantis. */
export function fmtDateTimeLatn(
  date: Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  return toLatinDigits(date.toLocaleString(AR_LATN, options));
}
