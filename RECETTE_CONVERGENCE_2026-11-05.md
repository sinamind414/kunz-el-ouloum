# 🧩 Recette de convergence — écriture des deep links sur `reorganisation-med`

**Statut : document + patch préparés, RIEN appliqué.** Aucun merge, cherry-pick, push, changement de branche ni modification de `reorganisation-med`. À exécuter **dans votre clone** (`C:\Users\zakaria\Documents\application kunz el ouloum finale`), sur la branche de votre choix, après votre arbitrage.

Deux livrables :
- `PATCH_CONVERGENCE_deepLinks.patch` — 3 fichiers, **127 lignes**, ajouts quasi purs.
- ce document — les 4 points d'appel manuels dans `src/App.tsx`, les tests et la validation.

**Validations du patch déjà faites ici (sur une copie `/tmp` de vos fichiers, pas sur le dépôt) :** `patch -p1 --dry-run` ✅ · `git apply --check` ✅ · application réelle sur la copie ✅. Les 3 fichiers ciblés sont **identiques au montage** à ceux de `arena/bcf8863b` après application.

---

## 0. Pré-requis

```bash
git checkout reorganisation-med     # ou la branche retenue
git status                          # doit être propre
git rev-parse HEAD                  # e730d9c attendu
```

Le patch part **exactement** des blobs de `e730d9c`. Si votre branche a bougé depuis, il refusera de s'appliquer (`git apply --check` le dira) — c'est voulu, plutôt que d'écraser du travail.

## 1. Appliquer le patch

```bash
git apply --check PATCH_CONVERGENCE_deepLinks.patch
git apply        PATCH_CONVERGENCE_deepLinks.patch
git diff --stat
# retour arrière éventuel : git apply -R PATCH_CONVERGENCE_deepLinks.patch
```

Il couvre :

| Fichier | Delta |
|---|---|
| `src/utils/navigationHash.ts` | **+16** : `export function ecrireParametresPourTab(tab, query)` |
| `src/utils/deepLinkInterne.ts` | **+14** : `queryPourLecon` / `queryPourQcm` / `queryPourExamen` / `queryPourIdee` |
| `src/utils/deepLinkInterne.lock.test.ts` | **+46 / −2** : import `afterEach`, imports des nouveaux symboles, **4 tests** d'aller-retour |

⚠️ **`src/data/apprentissageNav.lock.test.ts` est volontairement EXCLU du patch** : sa version chez vous diffère de la mienne sur une assertion de mise en forme (`rubriqueActive(tab)` sur deux lignes). L'inclure aurait cassé un test vert. Ajout manuel au §3.

## 2. `src/App.tsx` — 4 points d'appel (édition manuelle)

### 2.1 Imports (lignes 81-86 de votre fichier)

**Avant :**
```ts
import {
  resoudreRoute,
  pousserRoutePourTab,
  remplacerRoutePourTab,
} from './utils/navigationHash';
import { lireDeepLinkInterne, queryDeUrl } from './utils/deepLinkInterne';
```

**Après :**
```ts
import {
  resoudreRoute,
  pousserRoutePourTab,
  remplacerRoutePourTab,
  ecrireParametresPourTab,
} from './utils/navigationHash';
import {
  lireDeepLinkInterne,
  queryDeUrl,
  queryPourLecon,
  queryPourQcm,
  queryPourExamen,
  queryPourIdee,
} from './utils/deepLinkInterne';
```

### 2.2 Les 3 handlers (lignes 284-308)

Ajouter **une ligne APRÈS `navigateToTab(...)`** — jamais avant, sinon le `pushState` de `navigateToTab` écrase la query.

```ts
const ouvrirExamen = (mode: 'qcm' | 'bac') => {
  setParcoursMode(mode);
  setParcoursQcm(null);
  setParcoursLesson(null);
  navigateToTab('lesson');
  ecrireParametresPourTab('lesson', queryPourExamen(mode));   // ← ajout
};

const ouvrirLeçonDepuisParcours = (key: string, kind: 'html' | 'active', unitId: number) => {
  setParcoursLesson({ key, kind, unitId });
  setParcoursQcm(null);
  navigateToTab('lesson');
  ecrireParametresPourTab('lesson', queryPourLecon(key));      // ← ajout
};

const ouvrirQcmDepuisParcours = (unitId: number) => {
  setParcoursQcm(unitId);
  setParcoursLesson(null);
  navigateToTab('lesson');
  ecrireParametresPourTab('lesson', queryPourQcm(unitId));     // ← ajout
};
```

### 2.3 `onOpenRedaction` (lignes ~1458)

```tsx
<RevisionPlanView
  onBackToHome={() => navigateToTab('training')}
  onOpenRedaction={(ideaId) => {
    setBacIdeaFocus(ideaId);
    navigateToTab('bacideas');
    ecrireParametresPourTab('bacideas', queryPourIdee(ideaId)); // ← ajout
  }}
/>
```

### 2.4 Pourquoi l'ordre compte (constat, pas supposition)

Votre `navigateToTab` (ligne 242) fait `history.pushState(…, TAB_ROUTE[tab])`, avec des hashes historiques `#lesson`, `#bacideas`. `ecrireParametresPourTab` écrit ensuite le hash **canonique** `#/apprentissage/cours?lecon=…` via `replaceState`, donc sur la même entrée d'historique.

Points vérifiés compatibles sur votre branche :
- `resoudreRoute` conserve la query dans `canonique` → l'effet de montage (ligne 345) ne la supprime pas ;
- `remplacerRoutePourTab(currentTab)` (ligne 356) s'arrête quand la base est déjà la bonne → query conservée ;
- le test `?idee=` au montage (ligne 213 : `if (route && deepLinkInitial?.idee && route.tab === 'training') return 'bacideas'`) est **identique** au mien → `?idee=` continue d'ouvrir la banque.

⚠️ **Risque résiduel** : la coexistence des deux formats (`#lesson` vs `#/apprentissage/cours`) et le `popstate` qui relit `state.tab`. Le patch unitaire ne le couvre pas entièrement → test §3.3.

## 3. Tests

### 3.1 Déjà apportés par le patch
`src/utils/deepLinkInterne.lock.test.ts` : 13 → **17 tests** (aller-retour des 4 fabriques, écriture du hash sans historique, conservation par `remplacerRoutePourTab` + consommation par `pousserRoutePourTab`, onglet sans route).

### 3.2 À ajouter manuellement dans `src/data/apprentissageNav.lock.test.ts`

**Ne modifiez pas** le test existant « « المنهجية » a une mise en avant distincte… ». Ajoutez simplement, après lui :

```ts
it('les 4 raccourcis internes écrivent leur cible dans l’URL', () => {
  expect(APP).toContain("ecrireParametresPourTab('lesson', queryPourLecon(key))");
  expect(APP).toContain("ecrireParametresPourTab('lesson', queryPourQcm(unitId))");
  expect(APP).toContain("ecrireParametresPourTab('lesson', queryPourExamen(mode))");
  expect(APP).toContain("ecrireParametresPourTab('bacideas', queryPourIdee(ideaId))");
});
```

### 3.3 Test de non-régression recommandé (à adapter)

Votre `src/components/__tests__/navigation4Rubiques.test.tsx` possède déjà le test `?lecon= ouvre le Cours en gardant le paramètre dans l'URL` (ligne 80) — il couvre la **lecture**. Il faut aussi couvrir l'**écriture depuis un raccourci interne**. Proposition de squelette, à adapter au `data-testid` réel du raccourci « مساري / الدروس » de votre branche :

```tsx
it('un raccourci interne écrit ?lecon= dans une URL canonique', async () => {
  const lecon = PARCOURS_FLAT.find((i) => i.kind === 'lesson' && i.lessonKey)!;
  window.history.replaceState(null, '', '/');
  render(<App />);
  // fireEvent.click(screen.getByTestId('…')) : ouvrir la leçon depuis le parcours
  // puis :
  expect(window.location.hash.startsWith('#/apprentissage/cours?lecon=')).toBe(true);
  expect(lireDeepLinkInterne(queryDeUrl(window.location.hash, '')))
    .toEqual({ lecon: { key: lecon.lessonKey, kind: lecon.lessonKind ?? 'html', unitId: lecon.unitId } });
});
```

Ce test est le seul moyen de trancher le risque `TAB_ROUTE` / `navigateToTab` sur VOTRE base. Je ne peux pas le garantir d'ici : il dépend des `data-testid` et du câblage réels de votre branche.

### 3.4 Mise à jour documentaire

Reporter dans `SPEC_NAVIGATION_4_RUBRIQUES_2026-11-05.md` : §4 « Aller-retour complet », §6 chiffres de validation, §7 retrait de l'item « écriture des paramètres ».

## 4. Validation à exécuter (ordre `AGENTS.md`)

```bash
npm run lint                 # tsc --noEmit
npm run lint:eslint
npm run check:miftah
npx vitest run src/utils/deepLinkInterne.lock.test.ts \
               src/data/apprentissageNav.lock.test.ts \
               src/components/__tests__/navigation4Rubiques.test.tsx
npm test                     # vitest intégral + BOUSSOLE
npm run test:jest
npm run test:build
git diff --check
```

**Attendu** : les compteurs ne doivent pas baisser ; **+5 tests** côté vitest (4 du patch + 1 manuel, +1 si vous ajoutez le §3.3) ; l'entrée du bundle reste < 700 Ko. Sur votre base les chiffres annoncés sont 3897 vitest / 3833 jest — à confirmer par exécution, je ne les ai pas reproduits ici.

**Critère d'échec à surveiller** : si le test §3.3 échoue avec un hash `#lesson` au lieu de `#/apprentissage/cours?lecon=…`, c'est que `navigateToTab` reprend la main après l'écriture. Dans ce cas, déplacer l'appel à `ecrireParametresPourTab` dans un `useEffect` déclenché sur `currentTab === 'lesson'`, plutôt que dans le handler.

## 5. Ce que ce document ne fait pas / « Non vérifiable »

- Aucune application sur une branche, aucun commit, aucun push, aucune PR. Les deux fichiers livrés sont **non suivis** dans le workspace Arena.
- Le patch n'a été validé que sur une **copie `/tmp`** des blobs `e730d9c` ; son comportement une fois intégré à votre arbre complet, avec vos 4 814 fichiers et vos 97 commits d'historique, reste **Non vérifiable** depuis ce sandbox.
- Le caractère « vert » de `e730d9c`, la validation « CDP » et vos `data-testid` réels ne sont pas vérifiés ici.
- Aucune source externe consultée : uniquement l'API GitHub du dépôt et le clone local du sandbox.
