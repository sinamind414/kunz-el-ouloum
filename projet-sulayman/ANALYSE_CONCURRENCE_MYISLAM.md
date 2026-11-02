# Analyse concurrentielle — My Islam (myislam.org/fr)

**Relevé effectué le 2 novembre 2026.**
Pages examinées : l'index `/fr/histoires-des-prophetes/`, la fiche `/fr/prophete-souleymane/` (chunks 1 et 5), la fiche `/fr/histoire-de-bilqis-dans-le-coran/`.

---

## 1. Identité du concurrent

| | |
|---|---|
| Éditeur | My Islam (myislam.org), site islamique multilingue |
| Volume | **24 récits de prophètes** + 12 récits coraniques + douas + 99 noms + glossaire + quiz + outils (qibla, tasbih) |
| Langues | Anglais (origine) + FR (`/fr/`) et autres |
| Modèle | Contenu gratuit, financé par dons (« Nous soutenir ») |
| Page Sulaymân | ~5 000 mots, **narration audio de 32 minutes** (11 sections horodatées), quiz, FAQ, page « versets du Coran » dédiée |
| Source déclarée | « adapté du grand ouvrage d'Ibn Kathir » + « commentaires contemporains du Coran » |

**C'est un concurrent sérieux.** Pas un blog amateur : une plateforme structurée, avec audio, quiz et maillage interne dense.

---

## 2. Audit de la page Sulaymân

### Ce qu'ils font bien — et qu'il faut égaler

| Point | Preuve | Pourquoi c'est fort |
|---|---|---|
| **Avertissement explicite sur les Isrâ'îliyyât** | Sur 38:34 : « il existe de nombreuses narrations israïliyat… il s'agit souvent d'histoires forgées qui manquent de respect envers le prophète d'Allah » | Ils nomment le problème et refusent d'inventer. C'est exactement notre position. |
| **Renvoi à la méthode d'Ibn Kathîr** | « tout ce que le Coran a laissé dans l'ambiguïté doit être laissé tel quel » | Argument d'autorité bien utilisé. |
| **Divergence présentée, non tranchée** | Sur 38:31–33 : *mashan* = frapper (sacrifice des chevaux) **ou** caresser (Ibn Jarîr) | Les deux lectures, avec les noms. Bonne pratique. |
| **Sources hadith citées** | Bukhârî 6725 + Tirmidhî 2682 sur l'héritage des prophètes | Références numérotées, vérifiables. |
| **Prudence sur le nom de la reine** | « Bien que le Coran ne mentionne pas explicitement son nom, **on pense** qu'elle s'appelait Bilqis » | La bonne formulation. |
| **Format** | Audio 32 min, quiz, FAQ, index de versets | Ils jouent sur l'usage, pas seulement sur le texte. |

### Ce qu'ils font mal — et qui ouvre l'espace

**a) Légendes présentées comme des faits.** Deux exemples nets :

> « Il demanda si l'Ange de la mort pouvait prendre son âme tandis qu'il resterait assis, droit, appuyé sur son bâton. »

C'est une **tradition non coranique** (le Coran dit seulement qu'il mourut debout, appuyé sur son bâton — 34:14). Elle est racontée ici au même niveau narratif que le verset, sans étiquette.

> « Il était l'un des **19 fils** du prophète Dâwûd. »

Chiffre issu du tafsîr, présenté comme un fait établi.

**b) Images représentant le prophète.** Légendes d'images relevées :
- « Le prophète Sulaiman, **le visage voilé de lumière**, tendant la main vers la huppe »
- « Le prophète Dawud (AS) **écrivant** »
- « La reine Bilqis assise sur son trône doré »

Pour une large partie du public sunnite, **c'est disqualifiant**. Et c'est un point sur lequel notre livre peut être irréprochable — sans effort.

**c) Qualité de fabrication visible.** Sur la même page, le nom du prophète s'écrit **trois fois différemment** :
- titre : « Souleymane »
- H1 : « Sulaiman »
- corps : « Souleyman »

Autres défauts relevés :
- table de mots arabes concaténée : `unedomination`, `enversquelqu'un`
- « les djinns comprirent **qu's'ils** savaient l'avenir »
- FAQ vide livrée en production : « Actuellement, **0 question** a reçu une réponse ; bientôt, incha'Allah. »
- image de séparateur de paragraphe affichée avec son nom de fichier technique

**d) Pas de méthode.** Ils avertissent *ponctuellement* sur les Isrâ'îliyyât (38:34), puis racontent l'Ange de la mort sans avertissement. Il n'y a **aucun système** : le lecteur ne sort pas capable de trier par lui-même.

**e) Orientation théologique non signalée.** Ils citent le *Tafhîm ul-Qur'ân* de Mawdûdî sans situer l'auteur. Ce n'est pas une faute, mais un lecteur doit savoir d'où parle le commentaire.

---

## 3. Diagnostic : un pipeline, pas une rédaction

Les indices convergent : **traduction automatisée + images générées + assemblage**.

| Indice | Interprétation |
|---|---|
| Translittérations incohérentes sur une même page | Traduction par tronçons, sans harmonisation humaine |
| Coquilles de concaténation (`qu's'ils`, `unedomination`) | Rendu automatique, pas de relecture |
| Arborescence CDN `assets/2026/08/french/comp/assets/2024/...` | Images **générées et recomposées par langue** |
| FAQ vide, séparateurs avec noms de fichiers | Contrôle qualité absent |
| Volume : 24 prophètes × N langues | Impossible sans production industrielle |

C'est **exactement** le modèle « AI slop » que nous évoquions à propos du Kindle — appliqué cette fois au contenu religieux gratuit. Et c'est une **bonne nouvelle pour le projet** : le concurrent le plus visible sur ce créneau ne peut pas faire ce que nous faisons.

---

## 4. Cinq conséquences pour le livre

**1. La demande est prouvée.** Un site consacre 5 000 mots, 32 minutes d'audio et un quiz à Sulaymân. Le sujet n'est pas un désert.

**2. L'information seule ne se vend plus.** Un lecteur peut trouver ça gratuitement en 30 secondes. **Le livre ne doit pas être vendu comme une source d'information.** Il doit être vendu comme :
- une **méthode** (les 4 étiquettes),
- un **objet fini** (2 heures de lecture continue, contre une page qu'on survole),
- un **format familial** (papier, audio, école).

**3. La barre de rigueur monte.** Sur les points où ils sont bons — la divergence *mashan*, Bukhârî 6725, l'avertissement Isrâ'îliyyât sur 38:34 — **notre livre doit être au moins aussi précis.** S'il est moins rigoureux qu'une page gratuite, il n'a aucune raison d'exister.

**4. Trois contenus à ajouter au livre** (ils sont sur la page concurrente, donc le lecteur les attendra) :
- les **« 19 fils de Dâwûd »** → à traiter en 🟡 R, chiffre d'origine exégétique
- **l'Ange de la mort et le bâton** → à traiter en 🔴 L (c'est le cas d'école parfait)
- **les termites** (34:14) → le mot *dâbbat al-arḍ* est dans le verset ; distinguer ce qui est révélé de ce qu'on a brodé

**5. L'absence d'images de prophètes devient un argument.** À écrire noir sur blanc en 4ᵉ de couverture : *aucune représentation figurée*. Sur ce marché, c'est un signal de sérieux immédiat.

---

## 5. Verdict

| Critère | My Islam | Notre projet |
|---|---|---|
| Information brute | ✅ complète | ✅ complète |
| Méthode de tri | ❌ absente | ✅ **le cœur** |
| Co hérence des sources | ⚠️ irrégulière | ✅ systématique |
| Représentation du prophète | ❌ images figurées | ✅ aucune |
| Fabrication | ⚠️ coquilles visibles | ✅ relecture + réviseur |
| Format | ✅ audio + quiz | ⚠️ **à faire : audio** |
| Prix | gratuit | 7,99 € |

**Conclusion : le concurrent valide le projet et déplace la ligne de front.**

Il ne faut plus écrire *« voici l'histoire de Sulaymân »* — c'est déjà disponible, gratuitement, en cinq langues.
Il faut écrire *« voici pourquoi ce que vous avez lu sur Sulaymân n'est pas tout à fait Sulaymân »*.

Et il faut **prendre l'audio au sérieux** : ils ont 32 minutes de narration. Un livre sur ce sujet sans version audio perd la moitié de son usage réel (trajets, veillées, personnes âgées, enfants).

---

## 6. Actions immédiates

- [ ] Ajouter au **chapitre 10** le traitement de l'Ange de la mort (🔴 L) et des termites
- [ ] Ajouter au **chapitre 12** la ligne « 19 fils de Dâwûd » (🟡 R)
- [ ] Vérifier que notre traitement de **38:31–34** est au moins aussi précis que le leur (deux lectures de *mashan*, renvoi à Ibn Jarîr)
- [ ] Décider du **format audio** : narration complète ou version abrégée (≈ 40 min)
- [ ] Inscrire « aucune représentation figurée » dans les arguments de vente
- [ ] Ajouter une page de vente : *« Ce que les articles gratuits ne vous disent pas »*
