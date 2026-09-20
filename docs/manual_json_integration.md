# Intégration du manuel SVT en JSON statique — CONTRAT D'INGESTION (état réel)

> ⚠️ **Pourquoi ce document existe** : un assistant a présenté comme « effectués » un
> commit et un push créant `docs/manual_json_integration.md` + `data/bookContent.json`.
> Vérifié le 2026-09-20 : **aucun des deux n'a jamais existé** (ni sur master, ni sur
> une branche, ni sur disque ; `git log --all --grep` vide ; le répertoire `data/`
> lui-même est absent). Ce document remplace la fiction par un contrat exécutable.
> Il n'y a toujours PAS de `data/bookContent.json` dans le dépôt — par honnêteté,
> pas par oubli.

## 1. État réel de l'ancrage manuel (audit 2026-09-20 : `AUDIT_ROLE_MANUEL_2026-09-19.md`)

| Objet | État | Rôle vérifié |
|---|---|---|
| `book_tdm_clean.md` | 5 928 octets — **TDM** bilingue (55 chapitres) | Cartographie des titres des leçons (`src/lessonData.ts`) |
| `public/lessons/*.html` | 25 leçons statiques | Affichage (viewer frontend) |
| `src/data/dictionaries/dictionnaire_final.json` | build 617 entités + 80 attendus | **Diagnostic** du correcteur (jamais la note — P2 règle dure) |
| `src/data/manuelErrata.ts` | errata du دليل الأستاذ | Protection de l'élève contre les errata d'impression |
| `svth_bac_3as.json` | **n'existe pas** (fichier fantôme) | — |
| `data/` | **répertoire inexistant** | — |

## 2. Ce que serait `data/bookContent.json` (schéma proposé — À CRÉER uniquement après ingestion)

```jsonc
{
  "_version": "1.0",
  "_provenance": "texte officiel collé par le propriétaire (canal fiable) le <DATE> — aucun contenu inventé",
  "manuel": { "titre": "…", "annee": 2021, "pages_total": 334 },
  "domaines": [
    {
      "id": "D1",
      "titreAr": "التخصص الوظيفي للبروتينات",
      "unites": [
        {
          "id": "D1U1",
          "titreAr": "تركيب البروتين",
          "chapitres": [
            {
              "id": "D1U1C1",
              "titreAr": "…",            // doit exister MOT POUR MOT dans le texte ingéré
              "pages": [12, 21],          // pagination vérifiable
              "objectifs": ["…"],         // copiés du manuel, jamais reformulés
              "experiences_historiques": [{"id": "…", "page": 15}],
              "erreurs_imprimees": []     // renvoi vers manuelErrata.ts si erratum
            }
          ]
        }
      ]
    }
  ]
}
```

**Règles dures d'ingestion** (non négociables) :
1. Aucun champ sans source : chaque `titreAr`/`objectifs` doit être retrouvé par
   grep dans le texte ingéré (le pipeline de validation refusera sinon).
2. La TDM existante (`book_tdm_clean.md`) sert de **grille de contrôle** : les 55
   chapitres doivent tous être retrouvés, aucun chapitre inventé ne peut s'y ajouter.
3. Les errata connus (`manuelErrata.ts`) sont référencés, jamais « corrigés » dans
   les données (le manuel imprimé reste ce qu'il est).
4. Toute divergence texte ingéré ↔ TDM = blocage du build de données, tranché par
   le propriétaire.

## 3. Consommateurs — à construire APRÈS ingestion (aujourd'hui : aucun)

- **Index du viewer** : servir une leçon par chapitre + pagination réelle.
- **Traçabilité manuel→attendus** : le champ `source` des items du registre
  (`attendusBac2025.ts`) pourra porter `page` du manuel (recommandation de mon
  audit, §roadmap 2).
- **Tests** : couverture TDM ↔ JSON (55/55 chapitres) comme verrou de complétude.

## 4. Ce qui est nécessaire pour exécuter

Le **texte intégral du livre officiel** via le canal fiable (texte collé dans le
chat, par lots si besoin) — l'OCR du dépôt (`audit_livre_dump.txt`) et le
`LIVRE SVT BAC .txt` cité dans l'audit leçons ne sont PAS dans git. Sans ce
texte, ce contrat reste vide — et c'est volontaire : **un README qui citerait un
fichier inexistant mentirait**.
