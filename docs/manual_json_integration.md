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

## 5. STATUT (2026-09-20, fin de journée) — l ingestion a eu lieu

`data/bookContent.json` EXISTE désormais (master cb4afe6, cherry-pické en 4ead072
sur la branche) : OCR intégral 319 774 car. / 76 % arabe + grille TDM 3/11/55 +
hashes des sources. Audit indépendant : `AUDIT_INGESTION_MANUEL_2026-09-20.md`
(réel et exploitable ; réserves : positions de chapitres non persistées,
texte « corrigé v1.0 » et sources brutes non committés — hashes seuls).
Verrous permanents : `src/data/bookContent.lock.test.ts` (6 tests).

## 4. Ce qui est nécessaire pour exécuter — et le canal qui marche (2026-09-20)

**Inventaire Dropbox du propriétaire** (vérifié via fetcher plateforme) : dossier
« LIVRE SVT BAC OFFICIEL 2026 » = 1 fichier `LIVRE SVT BAC SCOLAIRE OFFICIEL.pdf`
(15,3 Mo). **Le sandbox est coupé de Dropbox au niveau réseau** (TLS killé sur
www.dropbox.com ET dl.dropboxusercontent.com — curl/wget/python). Le fetcher de
texte de la plateforme voit les pages HTML mais ne peut pas déposer un PDF de
334 pages sur disque de façon fidèle — et le re-taper depuis des extraits de
contexte violerait la règle de sourcing.

**Canal validé par l'usage : l'upload GitHub web** (les 40 copies élève sont
arrivées ainsi sur master, commit 7ba77d4). 15,3 Mo < limite 25 Mo du web UI :
1. https://github.com/sinamind414/kunz-el-ouloum → « Add file » → « Upload files »
2. Déposer `LIVRE SVT BAC SCOLAIRE OFFICIEL.pdf` (ou mieux : son export **.txt**,
   immédiatement greppable)
3. Prévenir ici → `git fetch` → extraction + validation TDM 55/55 + build du JSON
   selon les règles dures de la section 2.

Alternatives : texte collé par lots dans le chat (comme le دليل الأستاذ), ou
nouvel essai de pièce jointe (vérification `ls /home/user/uploads` au tour suivant).
