import { describe, expect, it } from "vitest";
import { InvoiceInputSchema, type InvoiceLine } from "../../src/core/model.js";
import { computeTotals } from "../../src/core/totals.js";
import { BORNE_RECHARGE_EXPECTED, borneRechargeInvoice } from "../fixtures/borne-recharge.js";

function line(unitPriceHT: number, vatRate: number, quantity = 1): InvoiceLine {
  return { label: "Ligne", quantity, unitPriceHT, vatRate, nature: "bien" };
}

describe("computeTotals", () => {
  it("calcule la facture de pose de borne au centime près", () => {
    const invoice = InvoiceInputSchema.parse(borneRechargeInvoice);
    const totals = computeTotals(invoice);

    expect(totals.lines.map((l) => l.totalHT)).toEqual(BORNE_RECHARGE_EXPECTED.lineTotals);
    expect(totals.vatBreakdown).toEqual([{ rate: 2000, baseHT: 140_197, vatAmount: 28_039 }]);
    expect(totals.totalHT).toBe(BORNE_RECHARGE_EXPECTED.totalHT);
    expect(totals.totalVAT).toBe(BORNE_RECHARGE_EXPECTED.totalVAT);
    expect(totals.totalTTC).toBe(BORNE_RECHARGE_EXPECTED.totalTTC);
  });

  it("regroupe la TVA par taux, du plus élevé au plus bas", () => {
    const totals = computeTotals({
      lines: [line(10_000, 550), line(20_000, 2000), line(5_000, 1000), line(3_000, 2000)],
    });

    expect(totals.vatBreakdown).toEqual([
      { rate: 2000, baseHT: 23_000, vatAmount: 4_600 },
      { rate: 1000, baseHT: 5_000, vatAmount: 500 },
      { rate: 550, baseHT: 10_000, vatAmount: 550 },
    ]);
    expect(totals.totalHT).toBe(38_000);
    expect(totals.totalVAT).toBe(5_650);
    expect(totals.totalTTC).toBe(43_650);
  });

  it("arrondit la TVA une fois par taux, pas ligne par ligne", () => {
    // 3 lignes à 0,99 € à 5,5 % : par ligne 5,445 → 5 c × 3 = 15 c ; par taux 16,335 → 16 c
    const totals = computeTotals({ lines: [line(99, 550), line(99, 550), line(99, 550)] });
    expect(totals.totalVAT).toBe(16);
  });

  it("reste cohérent : TTC = HT + TVA, HT = somme des lignes", () => {
    const totals = computeTotals({
      lines: [line(1_234, 2000, 1.5), line(999, 550, 2.25), line(4_321, 210, 0.333)],
    });
    const sumLines = totals.lines.reduce((sum, l) => sum + l.totalHT, 0);
    const sumBases = totals.vatBreakdown.reduce((sum, e) => sum + e.baseHT, 0);

    expect(totals.totalHT).toBe(sumLines);
    expect(sumBases).toBe(totals.totalHT);
    expect(totals.totalTTC).toBe(totals.totalHT + totals.totalVAT);
  });

  it("donne une TVA nulle quand toutes les lignes sont à 0 % (franchise)", () => {
    const totals = computeTotals({ lines: [line(50_000, 0), line(12_345, 0)] });
    expect(totals.vatBreakdown).toEqual([{ rate: 0, baseHT: 62_345, vatAmount: 0 }]);
    expect(totals.totalTTC).toBe(62_345);
  });

  it("renvoie des totaux nuls sans ligne", () => {
    expect(computeTotals({ lines: [] })).toEqual({
      lines: [],
      vatBreakdown: [],
      totalHT: 0,
      totalVAT: 0,
      totalTTC: 0,
    });
  });
});
