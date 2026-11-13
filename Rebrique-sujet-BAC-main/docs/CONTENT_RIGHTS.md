# Droits des contenus et procédure de retrait

_Version 1.1 — 19 septembre 2026._

## Périmètre des licences

- `LICENSE` couvre uniquement le code original et la documentation originale du dépôt.
- Les textes pédagogiques originaux et les métadonnées produites par les contributeurs sont proposés sous **CC BY-NC-SA 4.0**, sauf mention contraire. Cette mention ne donne aucun droit sur un sujet ministériel, un corrigé, un logo ou un scan.
- Les sujets et corrigés d’examen sont des contenus tiers. Une URL publique ne prouve pas un droit de redistribution. Ils ne doivent être embarqués ou redistribués qu’après autorisation écrite du titulaire compétent.

## Inventaire

### Retrait du 19 septembre 2026 — 32 PDF bruts, non servis

Retrait effectué par le commit `97e60c4` — index Git uniquement.

Les 32 PDF bruts (`M/` : 15 fichiers, 29,92 Mio ; `SE/` : 17 fichiers, 50,08 Mio ; soit
80,00 Mio) ont été **retirés de l'index Git** faute de preuve de redistribution. Ils
n'étaient ni servis (`PUBLIC_DIRECTORIES`, `server.mjs:52`) ni lus à l'exécution : un seul
fichier les citait en chemin local, `subjects/manifest.json`, à titre de provenance.

La provenance est désormais portée par le champ `"source"` de `subjects/manifest.json`, qui
renvoie vers les URL publiques dzexams. Sur 58 entrées, **44** disposent d'une URL
effectivement observée dans ce dépôt ; les **14** autres n'en ont aucune de documentée, et le
champ a été retiré plutôt que de laisser un chemin mort. **Aucune URL n'a été inventée.**

> **Ces fichiers restent présents dans l'historique Git.** `git rm --cached` retire de
> l'index, il ne purge rien : les 80 Mio demeurent clonables tant qu'une réécriture
> d'historique (`git filter-repo`) n'est pas explicitement décidée — opération destructive
> qui réécrit tous les SHA et impose une rotation des clones.

### Contenus tiers encore présents — 58 PDF servis au public

`subjects/` contient 58 PDF (41,10 Mio) **servis au public**. Ce sont des sujets d'examen
tiers. Aucune autorisation écrite de redistribution n'est documentée à ce jour : le dépôt
contrevient donc encore à `LICENSE-CONTENT` pour ces fichiers.

C'est l'étape A restante, décrite dans `PROMPT_DECISIONS_PROPRIETAIRE.md` : obtenir une
autorisation écrite du titulaire, ou renoncer à servir ces fichiers et les remplacer par des
liens externes — ce que `data/archive.js` fait déjà pour une partie des années.

## Retrait ou correction

1. Ouvrir une issue intitulée `[DROITS]` ou contacter le responsable indiqué dans
   `docs/LEGAL_NOTICE.md`.
2. Indiquer le fichier ou le passage concerné, la qualité de titulaire ou de représentant, et une preuve de droit lorsque cela est possible. Ne pas joindre de données personnelles.
3. À réception d’une demande crédible, désactiver le lien ou retirer le fichier de la branche de publication sans attendre la fin de l’examen.
4. Documenter la décision et mettre à jour cet inventaire et les sommes de contrôle de la version publiée.

Aucun contenu tiers ne doit être présenté comme produit par MIFTAH. Les liens externes sont fournis comme références et peuvent changer ou devenir indisponibles.
