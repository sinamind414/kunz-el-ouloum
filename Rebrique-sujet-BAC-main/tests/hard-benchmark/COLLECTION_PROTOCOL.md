# Protocole opérationnel de collecte et d'annotation

Ce protocole ne remplace ni l'autorisation de l'établissement ni le consentement exigé par le droit applicable. Les pièces justificatives restent dans un stockage protégé, hors Git.

## Rôles séparés

- **Collecteur** : obtient l'autorisation, anonymise la copie et produit la transcription.
- **Correcteurs A et B** : évaluent séparément, sans voir l'autre correction ni le résultat du moteur.
- **Vérificateur** : contrôle les pièces et les empreintes. Il ne peut être ni collecteur ni correcteur.
- **Arbitre**, si nécessaire : tranche un désaccord matériel selon le barème documenté.

Un pseudonyme différent n'est pas une preuve d'indépendance. Le vérificateur doit contrôler la séparation réelle des opérations.

## Procédure par copie

1. Attribuer un `auditId` non signifiant, sans donnée personnelle.
2. Obtenir et archiver l'autorisation/consentement ; ne publier qu'une référence opaque `consentRef`.
3. Supprimer du scan le nom, le numéro de candidat, l'établissement, la signature et toute métadonnée identifiante.
4. Calculer `sha256` sur le scan anonymisé, puis sur la transcription fidèle.
5. Transmettre aux deux correcteurs la même transcription et le barème, sans score moteur.
6. Recueillir deux formulaires horodatés distincts. Chaque correcteur atteste `blindedToPeer: true` et `blindedToEngine: true`.
7. Calculer l'empreinte SHA-256 de chaque formulaire final.
8. Faire vérifier les pièces par le vérificateur indépendant et ajouter l'enregistrement au manifeste public.
9. Importer la copie anonymisée. L'import doit échouer si l'audit manque ou ne correspond pas.

Commande d'empreinte :

```bash
sha256sum scan-anonymise.pdf transcription.txt correction-A.json correction-B.json
```

## Formulaire de correction hors dépôt

```json
{
  "auditId": "AUD-2026-0001",
  "annotator": "correcteur-A",
  "score": 0.5,
  "note": "Justification pédagogique factuelle",
  "completedAt": "2026-08-26T10:00:00.000Z",
  "blindedToPeer": true,
  "blindedToEngine": true
}
```

Ne placez aucune identité civile dans ce formulaire. Les quatre catégories contrôlées sont `strong`, `weak`, `scientifically-wrong` et `off-topic`.
