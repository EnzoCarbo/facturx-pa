# Contribuer à facturx-pa

## Prérequis

- Node.js 22 ou plus
- pnpm 9

```bash
pnpm install
pnpm check   # typecheck + tests + build
```

## Branches

| Branche | Rôle |
|---|---|
| `main` | Versions publiées. Mise à jour uniquement par PR depuis `dev` (merge commit). |
| `dev` | Intégration. Mise à jour uniquement par PR (squash). |
| `feat/…`, `fix/…`, `chore/…`, `docs/…` | Une branche par changement, créée depuis `dev`. |

Aucun push direct sur `main` ni `dev` : tout passe par une Pull Request avec la CI au vert.

## Commits

Format [Conventional Commits](https://www.conventionalcommits.org/fr/) :

```
feat(core): calcul des totaux par taux de TVA
fix(rules): accepter un acheteur particulier sans SIREN
chore(deps): mise à jour de vitest
```

Types utilisés : `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.

## Règles du projet

- TypeScript strict, aucun `any`.
- Tous les montants en **centimes** (entiers), taux de TVA en **points de base** (`2000` = 20 %). Aucun calcul monétaire hors de `src/core/money.ts`.
- Le cœur (`src/core`) n'accède ni au réseau ni à une base de données, ne stocke rien et ne numérote pas les factures.
- Une règle de validation = un fichier dans `src/core/rules/` = au moins un test valide et un test cassé.
- Tout nouvel adaptateur de PA doit passer la suite `runProviderContract`.
- Données de test **fictives uniquement**. Aucune clé ni secret commité (`.env` est ignoré).
- Messages d'erreur métier en français ; code et noms techniques en anglais.
