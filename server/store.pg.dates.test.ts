// Régression 24/10/2026 — colonnes DATE PostgreSQL : pg livre des objets
// Date bâtis sur minuit LOCAL. `String(date).slice(0,10)` produisait
// « Wed Jun 30 » → date illisible → analyserAcces retombait sur l'essai
// alors que l'abonnement était bien persisté (bug observé en production
// sur Vercel/Neon). isoleDate recompose via les composantes locales.
import { describe, expect, it } from "vitest";
import { isoleDate } from "./dates.pg";

describe("isoleDate — colonnes DATE pg", () => {
  it("recompose une Date native (minuit local) en YYYY-MM-DD correct", () => {
    // Un abonnement au 30 juin 2027, tel que pg le restitue localement
    // (le fuseau machine importe peu : les composantes LOCALES font foi).
    const d = new Date(2027, 5, 30, 0, 0, 0, 0);
    expect(isoleDate(d)).toBe("2027-06-30");
  });

  it("couvre le cas UTC+1 : un Date au 29T23:00Z reste le 30 en local", () => {
    // Représentation interne observée en production sur la colonne date :
    // minuit local d'un fuseau à l'est d'UTC = 23:00Z de la veille.
    const d = new Date("2027-06-29T23:00:00.000Z");
    expect(isoleDate(d)).toBe("2027-06-30");
  });

  it("passe les chaînes ISO déjà découpées et les null", () => {
    expect(isoleDate("2027-06-30")).toBe("2027-06-30");
    expect(isoleDate("2027-06-30 00:00:00")).toBe("2027-06-30");
    expect(isoleDate(null)).toBeNull();
    expect(isoleDate(undefined)).toBeNull();
  });
});
