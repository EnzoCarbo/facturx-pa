// Seul fichier qui fait des calculs d'argent. Tout est en entiers, jamais de flottants.

/** Montant en centimes : 899,00 € = 89900. */
export type Cents = number;

/** Taux en points de base : 20 % = 2000, 5,5 % = 550. */
export type BasisPoints = number;

/** Une quantité a au plus 3 décimales (ex. 3,5 heures). */
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

export function hasValidQuantityPrecision(quantity: number): boolean {
  if (!Number.isFinite(quantity)) return false;
  const scaled = quantity * QUANTITY_SCALE;
  return Math.abs(scaled - Math.round(scaled)) < 1e-6;
}

/** Division arrondie au plus proche ; 0,5 s'arrondit en s'éloignant de zéro. */
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

/** Montant × taux, arrondi au centime. */
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

/** 168236 → "1 682,36 €" */
export function formatEuros(amount: Cents): string {
  assertCents(amount);
  const sign = amount < 0 ? "-" : "";
  const absolute = Math.abs(amount);
  const euros = Math.trunc(absolute / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const cents = (absolute % 100).toString().padStart(2, "0");
  return `${sign}${euros},${cents} €`;
}

/** 550 → "5,5 %" */
export function formatRate(rate: BasisPoints): string {
  const whole = Math.trunc(rate / 100);
  const decimals = (rate % 100).toString().padStart(2, "0").replace(/0+$/, "");
  return `${whole}${decimals ? `,${decimals}` : ""} %`;
}
