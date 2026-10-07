/**
 * Seul module autorisé à faire des calculs monétaires.
 *
 * - Les montants sont des centimes (entiers).
 * - Les taux sont des points de base (entiers) : 2000 = 20 %, 550 = 5,5 %.
 * - Les quantités acceptent au plus 3 décimales (ex. 3,5 heures).
 * - Arrondi commercial : au plus proche, demi-unité éloignée de zéro (0,5 → 1 ; -0,5 → -1).
 *
 * Tous les calculs passent par des entiers : aucun flottant n'intervient dans un montant.
 */

/** Montant en centimes d'euro (entier). */
export type Cents = number;

/** Taux en points de base (entier) : 10 000 = 100 %. */
export type BasisPoints = number;

/** Nombre maximal de décimales autorisées pour une quantité. */
export const QUANTITY_DECIMALS = 3;
const QUANTITY_SCALE = 10 ** QUANTITY_DECIMALS;
const BASIS_POINTS_SCALE = 10_000;

export function isCents(value: unknown): value is Cents {
  return typeof value === "number" && Number.isSafeInteger(value);
}

export function assertCents(value: number, label = "montant"): asserts value is Cents {
  if (!isCents(value)) {
    throw new RangeError(`Le ${label} doit être un nombre entier de centimes (reçu : ${value}).`);
  }
}

/** Vrai si la quantité a au plus QUANTITY_DECIMALS décimales. */
export function hasValidQuantityPrecision(quantity: number): boolean {
  if (!Number.isFinite(quantity)) return false;
  const scaled = quantity * QUANTITY_SCALE;
  return Math.abs(scaled - Math.round(scaled)) < 1e-6;
}

/**
 * Division entière arrondie au plus proche, demi-unité éloignée de zéro.
 * `numerator` doit être un entier sûr, `denominator` un entier strictement positif.
 */
export function divideAndRound(numerator: number, denominator: number): number {
  if (!Number.isSafeInteger(numerator)) {
    throw new RangeError(`Dépassement de capacité dans un calcul monétaire (${numerator}).`);
  }
  if (!Number.isSafeInteger(denominator) || denominator <= 0) {
    throw new RangeError(`Diviseur invalide dans un calcul monétaire (${denominator}).`);
  }
  const quotient = Math.trunc(numerator / denominator);
  const remainder = numerator - quotient * denominator;
  if (2 * Math.abs(remainder) >= denominator) {
    return quotient + Math.sign(numerator);
  }
  return quotient;
}

/** Prix unitaire × quantité, arrondi au centime. */
export function multiplyByQuantity(unitPrice: Cents, quantity: number): Cents {
  assertCents(unitPrice, "prix unitaire");
  if (!hasValidQuantityPrecision(quantity)) {
    throw new RangeError(
      `La quantité doit avoir au plus ${QUANTITY_DECIMALS} décimales (reçu : ${quantity}).`,
    );
  }
  const scaledQuantity = Math.round(quantity * QUANTITY_SCALE);
  return divideAndRound(unitPrice * scaledQuantity, QUANTITY_SCALE);
}

/** Applique un taux (en points de base) à un montant, arrondi au centime. */
export function applyRate(amount: Cents, rate: BasisPoints): Cents {
  assertCents(amount);
  if (!Number.isSafeInteger(rate) || rate < 0) {
    throw new RangeError(`Le taux doit être un entier positif en points de base (reçu : ${rate}).`);
  }
  return divideAndRound(amount * rate, BASIS_POINTS_SCALE);
}

export function addCents(...amounts: Cents[]): Cents {
  let total = 0;
  for (const amount of amounts) {
    assertCents(amount);
    total += amount;
  }
  assertCents(total, "total");
  return total;
}

/**
 * Formate un montant en euros à la française : "1 234,56 €".
 * Séparateur de milliers : espace fine insécable (U+202F) ; avant le symbole : espace insécable (U+00A0).
 */
export function formatEuros(amount: Cents): string {
  assertCents(amount);
  const sign = amount < 0 ? "-" : "";
  const absolute = Math.abs(amount);
  const euros = Math.trunc(absolute / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const cents = (absolute % 100).toString().padStart(2, "0");
  return `${sign}${euros},${cents} €`;
}

/** Formate un taux en pourcentage : 2000 → "20 %", 550 → "5,5 %". */
export function formatRate(rate: BasisPoints): string {
  const whole = Math.trunc(rate / 100);
  const decimals = (rate % 100).toString().padStart(2, "0").replace(/0+$/, "");
  return `${whole}${decimals ? `,${decimals}` : ""} %`;
}
