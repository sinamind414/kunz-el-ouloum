**Problème:**
Le workflow quality.yml ne tourne que sur arena/01a0376b-rebrique-sujet-bac, et pas sur main.

**Impact:**
- Après un merge sur main, la CI ne s'exécute pas
- On peut merger du code non validé

**Solution:**
Modifier la ligne 4 du workflow:
- branches: [arena/01a0376b-rebrique-sujet-bac]
+ branches: [main, arena/**]

**Fichier:** .github/workflows/quality.yml

**Note:** Cette modification nécessite la permission workflows sur le dépôt.