# Sécurité des données — brouillon du formulaire Play (H2)

**But :** répondre au questionnaire « Sécurité des données » de la Play Console **d'après le code**,
pas d'après l'intention. Chaque ligne cite sa preuve. Remplir ce formulaire de façon inexacte est un
motif de rejet ou de retrait — c'est le point où le plus d'applications se font prendre.

**Règle du dépôt appliquée ici :** le texte de confidentialité affiché aux élèves
(`src/data/politiqueConfidentialite.ts`, verrouillé par `politiqueConfidentialite.lock.test.ts`) doit
décrire ce que le code fait. Ce brouillon reprend les mêmes faits.

---

## 1. Collecte et partage

| Question Play | Réponse | Preuve dans le code |
|---|---|---|
| L'application collecte-t-elle des données ? | **Oui** — uniquement si l'élève crée un compte | `server.ts` : `POST /api/auth/register`, `POST /api/student/sync` |
| …en **mode invité** (sans compte) ? | **Non, aucune** — tout reste sur l'appareil | `politiqueConfidentialite.ts` §3 « وضع الزائر » ; le stockage est `localStorage` |
| Les données sont-elles **partagées** avec des tiers ? | **Non** | aucune dépendance d'analytique ni de publicité ; `package.json` : supabase-js est présent mais **inerte** (aucun appel, aucune clé requise) |
| Y a-t-il de la **publicité** ? | **Non** | audit §8 ; aucune régie dans le code |
| Y a-t-il un **traceur tiers** (analytics, crash, attribution) ? | **Non** | aucun SDK de ce type dans `package.json` |
| Les données sont-elles **chiffrées en transit** ? | **Oui, si le déploiement est en HTTPS** — dépend du déploiement, pas du code | `server.ts` documente que le cookie est `Secure` derrière un proxy TLS (`TRUST_PROXY=1`). ⚠️ Si l'instance est servie en clair, la réponse doit être **Non** : à vérifier avant de cocher. |
| Les données sont-elles **chiffrées au repos** ? | **Non** (fichier SQLite local ou base PostgreSQL du déployeur) — le mot de passe, lui, est haché (bcrypt, coût 10) | `server.ts` : `bcrypt.hashSync(password, 10)` |
| Peut-on **demander la suppression** des données ? | **Oui** | `politiqueConfidentialite.ts` §5 ; la suppression passe par l'enseignant superviseur (pas d'auto-suppression dans l'interface) |

## 2. Types de données (à cocher dans le formulaire)

| Catégorie Play | Concernée ? | Détail |
|---|---|---|
| Nom | **Oui** | « nom d'affichage » saisi à l'inscription |
| Adresse e-mail | **Oui** | identifiant de connexion |
| Informations personnelles — autres | **Non** | ni téléphone, ni adresse, ni date de naissance |
| Informations financières | **Non** | aucun achat |
| Santé et forme physique | **Non** | — |
| Messages / contenus créés par l'utilisateur | **Oui** | productions écrites (réponses rédigées) et activité d'apprentissage |
| Fichiers et documents | **Non** | — |
| Contacts, calendrier, photos, vidéos, audio | **Non** | aucune permission de ce type |
| Localisation | **Non** | — |
| Identifiants de l'appareil ou autres identifiants | **Non** | ⚠️ à revérifier si un jour un cookie technique est ajouté |
| Données d'usage de l'application (analytique) | **Non** | pas d'outil d'analytique embarqué |
| Diagnostics (rapports de plantage) | **Non** | — |

**Finalités à déclarer :** « Fonctionnalité de l'application » (compte + progression) et
« Statistiques » (agrégats d'activité pour améliorer le contenu) — cf. `politiqueConfidentialite.ts` §2.

**Facultatif ou obligatoire :** l'application fonctionne **sans compte** (mode invité) ⇒ les données
déclarées sont **facultatives** au sens de Play, puisqu'une utilisation complète est possible sans elles.
C'est un point à expliciter dans le champ libre du formulaire : cela réduit le niveau de risque affiché.

## 3. Public visé (questionnaire « Contenu »)

| Question | Réponse | Pourquoi |
|---|---|---|
| Public cible déclaré | **13 ans et plus** (tranche 13-15 / 16-17 / 18+) | public réel : élèves de terminale (≈ 17-19 ans). Déclarer une tranche incluant les moins de 13 ans déclencherait les obligations « Families » (COPPA/RGPD-K) sans aucune fonctionnalité conçue pour ce public. |
| L'application est-elle destinée aux enfants ? | **Non** | usage scolaire de fin de secondaire, sous supervision d'un adulte |
| Contient-elle des publicités ? | **Non** | — |
| Contient-elle des achats intégrés ? | **Non** | — |
| Contient-elle des contenus générés par les utilisateurs **partagés publiquement** ? | **Non** | aucune fonction sociale, aucun forum, aucun chat public (le tuteur est local) |

## 4. Compte de test pour la revue

Google exige des **identifiants de test** quand une connexion est nécessaire pour examiner
l'application. L'application fonctionne **sans compte**, ce qui est à indiquer explicitement dans le
champ « Instructions d'accès » — c'est une simplification réelle, pas une omission.

---

**À vérifier avant soumission :** (1) le domaine sert bien `/privacy` en HTTPS ;
(2) `store/assetlinks.json` est renseigné (nom de paquet + empreinte) ;
(3) l'instance déployée est en HTTPS, sinon corriger la ligne « chiffrées en transit ».
