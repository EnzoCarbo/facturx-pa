# facturx-pa

[![CI](https://github.com/EnzoCarbo/facturx-pa/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/EnzoCarbo/facturx-pa/actions/workflows/ci.yml)

Package TypeScript de facturation électronique (réforme française) : préparation de factures conformes et envoi vers des Plateformes Agréées (PA) via des adaptateurs.

> Projet personnel étudiant, en cours de construction.

## Principes

- Le cœur (`src/core`) ne fait aucun accès réseau, ne stocke rien et ne numérote pas les factures.
- Tous les montants sont en centimes (entiers) ; les taux de TVA en points de base (`2000` = 20 %).
- Les totaux sont toujours calculés, jamais fournis.

## Scripts

```bash
pnpm install
pnpm build       # tsup → dist/ (ESM + CJS + .d.ts)
pnpm test        # vitest
pnpm typecheck   # tsc --noEmit
pnpm check       # les trois à la suite
```

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md).
