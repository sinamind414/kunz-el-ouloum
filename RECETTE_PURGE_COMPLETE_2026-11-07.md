# Recette — purge complète des ouvrages tiers (à exécuter **hors** de cette session)

**Date :** 7 novembre 2026 · **Dépôt :** `https://github.com/sinamind414/kunz-el-ouloum.git`
**Statut :** document de procédure, **aucune commande de cette recette n'a été exécutée** dans le sandbox Arena.

---

## 0. Pourquoi cette recette n'est pas exécutée ici

**[CONSTAT]** La session Arena est liée à la branche `arena/bcf8863b-kunz-el-ouloum` et n'autorise de pousser **que** sur cette branche : `git push origin arena/bcf8863b-kunz-el-ouloum`. Il est interdit de changer, créer ou pousser une autre branche. **[INTERPRÉTATION]** Aucun « GO » ne peut lever cette règle : une purge complète exige de réécrire et de repousser **8 autres branches**, donc de sortir du périmètre autorisé. Ce document est le livrable maximal et réversible.

**[CONSTAT]** Ce qui a **déjà** été fait dans la session : `arena/bcf8863b-kunz-el-ouloum` a été réécrite (320 commits, `git filter-branch`), poussée en `--force-with-lease`, pointe **`fe28ed5`**, **0 ouvrage** dans ses 367 commits. Ancienne pointe `7be66ef` encore récupérable via l'API GitHub.

---

## 1. État mesuré le 7/11/2026 (API `git/trees/<sha>?recursive=1`)

| Branche | SHA | Chemins des 2 ouvrages à la pointe |
|---|---|---|
| `arena/bcf8863b-kunz-el-ouloum` | `fe28ed5` | **0** — déjà purgée |
| `arena/5420e52e-kunz-el-ouloum` | `d653886` | racine (`…v1.0.md`, `…SVT.md`) |
| `arena/b840cf8e-kunz-el-ouloum` | `f4bc4f4` | racine |
| `fix/navigation-bugs` | `da50cfd` | `uploads_externes/` |
| `fix/navigation-hooks-order` | `ad9510f` | `uploads_externes/` |
| `fix/spa-history-router` | `35bb2cb` | `uploads_externes/` |
| `fix/tadwin-report-desactivate` | `b85b594` | `uploads_externes/` **+** `CREATION MONTRE XWATCH/kunz-el-ouloum-arena-3e06e598-kunz-el-ouloum/` |
| `master` | `70b69ec` | `uploads_externes/` |
| `reorganisation-med` | `8c1eac3` | `uploads_externes/` |

**[CONSTAT]** Les fichiers ne portent **pas le même chemin** selon la branche. Un filtre qui ne retire que les 2 noms à la racine laisserait subsister 6 branches contaminées. **[INTERPRÉTATION]** Le filtre doit porter sur le **nom de fichier**, quel que soit le dossier.

**Autres documents tiers visibles** (ex. `master`, `fix/*`) : `uploads_externes/FINALBAC_VOLUME_1.txt`, `FINALBAC_VOLUME_2.txt`, `PROGRAMME NATIONAL SVT CLAUDE OPUS - Copie.MD`, `504601676-كتاب-العلوم-للطالبة-اكرام-بوزار.txt`, `hosila_officielle_3as.txt`, `book_tdm_clean.md`. **[INTERPRÉTATION]** Leur statut juridique et leur caractère officiel relèvent d'un arbitrage humain : **« Non vérifiable »** avec les seules sources du dépôt. Cette recette ne les retire pas ; une revue de droits doit les lister avant toute purge définitive. `book_tdm_clean.md` est une TDM de 5,8 Ko utilisée par `scripts/book_to_json.py` : ne pas la supprimer sans décision.

---

## 2. Pré-requis (à vérifier AVANT)

1. Un clone **complet**, pas shallow : `git rev-parse --is-shallow-repository` doit répondre `false`. Sinon `git fetch --unshallow --all`.
2. **Personne d'autre ne pousse** pendant l'opération ; prévenir les collaborateurs.
3. Sauvegarde **hors du dépôt** :
   ```sh
   git fetch --all --prune
   git bundle create /chemin/sûr/avant-purge-toutes-branches.bundle --all
   git ls-remote --heads origin > /chemin/sûr/sha-avant-purge.txt
   ```
4. Noter que **tous les clones existants** (dont `C:\Users\zakaria\Documents\application kunz el ouloum finale`) devront être resynchronisés ou re-clonés : les SHA changent sur 8 branches.

---

## 3. Filtre par nom de fichier (robuste aux 3 familles de chemins)

Créer `/chemin/sûr/purge-index.py` :

```python
#!/usr/bin/env python3
"""Index-filter : retire les 2 ouvrages quel que soit leur dossier."""
import subprocess

NOMS = {"الكتاب_المصحح_v1.0.md", "المكتبة_الكاملة_SVT.md"}
fichiers = subprocess.check_output(["git", "ls-files", "-z"]).decode("utf-8").split("\0")
a_retirer = [f for f in fichiers if f and f.rsplit("/", 1)[-1] in NOMS]
if a_retirer:
    subprocess.run(["git", "rm", "-q", "--cached", "--ignore-unmatch", "--", *a_retirer], check=False)
```

Puis, **une seule fois**, sur toutes les refs locales :

```sh
chmod +x /chemin/sûr/purge-index.py
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f \
  --index-filter 'python3 /chemin/sûr/purge-index.py' \
  --prune-empty -- --all
```

> **[INTERPRÉTATION]** `--prune-empty` est facultatif mais utile : `6d26c17` (« Add files via upload ») ne contenait quasiment que ces fichiers. Sans lui, la structure des 366 commits reste mieux préservée. Choisir **avant** de lancer, car le nombre de commits changera.

---

## 4. Publication, branche par branche, avec garde-fou

Pour **chaque** branche de la table du §1 (sauf `arena/bcf8863b-kunz-el-ouloum`, déjà faite), avec le SHA noté au §2 :

```sh
# Exemple pour master ; répéter pour les 7 autres, avec le SHA COMPLET du §2
ATTENDU=$(awk '$2=="refs/heads/master" {print $1}' /chemin/sûr/sha-avant-purge.txt)
git push --force-with-lease="refs/heads/master:${ATTENDU}" origin master
```

Utiliser le **SHA complet** attendu (40 caractères), jamais `--force` seul. Si le lease échoue, **s'arrêter** : quelqu'un a poussé entre-temps.

---

## 5. Vérification après chaque branche

```sh
# Aucun commit de la branche ne doit contenir l'un des 2 noms
git rev-list <branche> | while read -r c; do
  git -c core.quotepath=false ls-tree -r --name-only "$c" \
    | grep -E 'الكتاب_المصحح|المكتبة_الكاملة' && echo "⚠️ $c"
done
```

**[CONSTAT]** `-c core.quotepath=false` est **obligatoire** : sans lui, les noms arabes sont affichés échappés et `grep` renvoie un faux « 0 fichier ». Vérifier aussi le nombre de commits (`git rev-list --count <branche>`) et que l'arbre de la pointe, hors les 2 ouvrages, est inchangé.

Contrôle côté GitHub, pour chaque branche :

```sh
sha=$(git ls-remote --heads origin "refs/heads/<branche>" | cut -f1)
gh api "repos/sinamind414/kunz-el-ouloum/git/trees/${sha}?recursive=1" \
  --jq '[.tree[].path] | map(select(test("الكتاب_المصحح|المكتبة_الكاملة"))) | length'
# doit répondre 0
```

---

## 6. Retour arrière

- Depuis le bundle : `git clone /chemin/sûr/avant-purge-toutes-branches.bundle restauration` puis repousser les SHA de `sha-avant-purge.txt` avec `--force-with-lease`.
- Commits isolés : GitHub conserve les objets ; l'ancienne pointe `7be66ef` a été vérifiée accessible par `gh api repos/.../commits/<sha>` après la purge de notre branche.

---

## 7. Ce qui restera **« Non vérifiable »** même après toute la procédure

- Les objets conservés par GitHub jusqu'à collecte : seule une demande au **support GitHub** peut les purger ; aucun endpoint API ne le fait.
- Les **forks**, les caches CDN, les artefacts de CI/GitHub Actions, les PR fermées et les clones déjà téléchargés.
- L'identité papier ↔ fichier des ouvrages, le caractère officiel des autres documents tiers du §1, la conformité juridique finale.
- **[INTERPRÉTATION]** Tant que les 8 branches et les objets ne sont pas traités, le retrait de l'index et la réécriture de notre seule branche **ne règlent pas** le sujet des droits d'auteur : ils le rendent cohérent pour l'avenir, sur une branche.

---

**Aucune source web externe de contenu consultée** ; mesures issues des API GitHub du dépôt (`git/trees`, `commits`, `ls-remote`) et du clone local. Aucune branche autre que `arena/bcf8863b-kunz-el-ouloum` n'a été modifiée ou poussée depuis cette session.
