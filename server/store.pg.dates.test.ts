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

  it("les composantes LOCALES font foi, quel que soit le fuseau du runner", () => {
    // Représentation interne observée en production sur la colonne date :
    // minuit local d'un fuseau à l'est d'UTC = 23:00Z de la veille.
    // 2026-11-03 : l'attendu était figé « 2027-06-30 » (machine à Alger,
    // UTC+1) et restait rouge sous TZ=UTC — d'où 3 jobs CI rouges. L'attendu
    // est maintenant recalculé depuis les composantes LOCALES du même
    // instant, par une voie DIFFÉRENTE de celle du code testé (Intl, pas
    // getFullYear/getDate) : « 2027-06-29 » au runner UTC, « 2027-06-30 » en
    // UTC+1. Le cas discriminant (UTC porte la veille, le local gagne) reste
    // actif pour tout runner à l'est d'UTC.
    const d = new Date("2027-06-29T23:00:00.000Z");
    const attendu = new Intl.DateTimeFormat("sv-SE", {
      year: "numeric", month: "2-digit", day: "2-digit",
    }).format(d);
    expect(isoleDate(d)).toBe(attendu);
  });

  it("passe les chaînes ISO déjà découpées et les null", () => {
    expect(isoleDate("2027-06-30")).toBe("2027-06-30");
    expect(isoleDate("2027-06-30 00:00:00")).toBe("2027-06-30");
    expect(isoleDate(null)).toBeNull();
    expect(isoleDate(undefined)).toBeNull();
  });
});
