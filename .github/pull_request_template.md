## Quoi

<!-- Ce que change cette PR, en une ou deux phrases. -->

## Pourquoi

<!-- Le besoin ou le problème. Lier l'issue si elle existe : "Closes #12". -->

## Comment tester

<!-- Commandes ou cas à vérifier. -->

```bash
pnpm check
```

## Checklist

- [ ] `pnpm check` passe en local (typecheck, tests, build)
- [ ] Tests ajoutés ou mis à jour pour chaque règle / comportement modifié
- [ ] Montants en centimes, aucun calcul monétaire hors de `src/core/money.ts`
- [ ] Aucun accès réseau ni stockage dans `src/core`
- [ ] Uniquement des données fictives (SIREN fictifs, aucune clé réelle)
- [ ] Messages d'erreur métier en français
