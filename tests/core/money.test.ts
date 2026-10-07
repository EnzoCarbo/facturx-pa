import { describe, expect, it } from "vitest";
import {
  addCents,
  applyRate,
  divideAndRound,
  formatEuros,
  formatRate,
  hasValidQuantityPrecision,
  multiplyByQuantity,
} from "../../src/core/money.js";

describe("divideAndRound", () => {
  it("arrondit au plus proche", () => {
    expect(divideAndRound(14, 10)).toBe(1);
    expect(divideAndRound(16, 10)).toBe(2);
  });

  it("arrondit la demi-unité en s'éloignant de zéro", () => {
    expect(divideAndRound(15, 10)).toBe(2);
    expect(divideAndRound(-15, 10)).toBe(-2);
    expect(divideAndRound(25, 10)).toBe(3);
  });

  it("refuse un diviseur nul ou négatif", () => {
    expect(() => divideAndRound(10, 0)).toThrow(RangeError);
    expect(() => divideAndRound(10, -1)).toThrow(RangeError);
  });

  it("refuse un numérateur hors des entiers sûrs", () => {
    expect(() => divideAndRound(Number.MAX_SAFE_INTEGER + 2, 10)).toThrow(RangeError);
  });
});

describe("multiplyByQuantity", () => {
  it("multiplie par une quantité entière", () => {
    expect(multiplyByQuantity(1_999, 3)).toBe(5_997);
  });

  it("gère les quantités décimales sans erreur de flottant", () => {
    // 0.1 * 3 vaut 0.30000000000000004 en flottant
    expect(multiplyByQuantity(300, 0.1)).toBe(30);
    expect(multiplyByQuantity(6_499, 3.5)).toBe(22_747); // 22 746,5 → 22 747
    expect(multiplyByQuantity(1_000, 0.333)).toBe(333);
  });

  it("refuse plus de 3 décimales", () => {
    expect(() => multiplyByQuantity(1_000, 0.1234)).toThrow(/3 décimales/);
  });

  it("refuse un prix non entier", () => {
    expect(() => multiplyByQuantity(19.99, 1)).toThrow(/entier de centimes/);
  });
});

describe("applyRate", () => {
  it("applique les taux français usuels", () => {
    expect(applyRate(10_000, 2000)).toBe(2_000);
    expect(applyRate(10_000, 1000)).toBe(1_000);
    expect(applyRate(10_000, 550)).toBe(550);
    expect(applyRate(10_000, 210)).toBe(210);
    expect(applyRate(10_000, 0)).toBe(0);
  });

  it("arrondit au centime", () => {
    expect(applyRate(140_197, 2000)).toBe(28_039); // 28 039,4
    expect(applyRate(1_999, 550)).toBe(110); // 109,945
    expect(applyRate(1_990, 550)).toBe(109); // 109,45
  });

  it("refuse un taux non entier ou négatif", () => {
    expect(() => applyRate(100, 5.5)).toThrow(RangeError);
    expect(() => applyRate(100, -2000)).toThrow(RangeError);
  });
});

describe("addCents", () => {
  it("additionne des centimes", () => {
    expect(addCents(1, 2, 3)).toBe(6);
    expect(addCents()).toBe(0);
  });

  it("refuse un montant non entier", () => {
    expect(() => addCents(1, 0.5)).toThrow(RangeError);
  });
});

describe("hasValidQuantityPrecision", () => {
  it("accepte jusqu'à 3 décimales", () => {
    expect(hasValidQuantityPrecision(1)).toBe(true);
    expect(hasValidQuantityPrecision(2.125)).toBe(true);
    expect(hasValidQuantityPrecision(2.1255)).toBe(false);
    expect(hasValidQuantityPrecision(Number.NaN)).toBe(false);
  });
});

describe("formatEuros", () => {
  it("formate à la française", () => {
    expect(formatEuros(168_236)).toBe("1 682,36 €");
    expect(formatEuros(5)).toBe("0,05 €");
    expect(formatEuros(0)).toBe("0,00 €");
    expect(formatEuros(123_456_789)).toBe("1 234 567,89 €");
    expect(formatEuros(-1_050)).toBe("-10,50 €");
  });
});

describe("formatRate", () => {
  it("formate les taux en pourcentage", () => {
    expect(formatRate(2000)).toBe("20 %");
    expect(formatRate(550)).toBe("5,5 %");
    expect(formatRate(210)).toBe("2,1 %");
    expect(formatRate(0)).toBe("0 %");
  });
});
