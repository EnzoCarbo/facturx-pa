import { addCents, applyRate, multiplyByQuantity, type BasisPoints, type Cents } from "./money.js";
import type { InvoiceLine } from "./model.js";

export interface LineTotal {
  /** Position de la ligne dans la facture (0-based). */
  index: number;
  totalHT: Cents;
}

export interface VatBreakdownEntry {
  rate: BasisPoints;
  /** Somme des HT des lignes à ce taux. */
  baseHT: Cents;
  /** TVA calculée sur la base regroupée (et non ligne par ligne). */
  vatAmount: Cents;
}

export interface InvoiceTotals {
  lines: LineTotal[];
  /** Un élément par taux présent, du plus élevé au plus bas. */
  vatBreakdown: VatBreakdownEntry[];
  totalHT: Cents;
  totalVAT: Cents;
  totalTTC: Cents;
}

export function computeLineTotal(line: Pick<InvoiceLine, "unitPriceHT" | "quantity">): Cents {
  return multiplyByQuantity(line.unitPriceHT, line.quantity);
}

/**
 * Calcule les totaux d'une facture.
 *
 * La TVA est calculée par taux sur la somme des HT de ce taux, puis arrondie une seule fois
 * (méthode EN 16931), ce qui évite le cumul des arrondis ligne par ligne.
 */
export function computeTotals(invoice: { lines: readonly InvoiceLine[] }): InvoiceTotals {
  const lines = invoice.lines.map((line, index) => ({ index, totalHT: computeLineTotal(line) }));

  const baseByRate = new Map<BasisPoints, Cents>();
  invoice.lines.forEach((line, index) => {
    const lineTotal = lines[index]!.totalHT;
    baseByRate.set(line.vatRate, addCents(baseByRate.get(line.vatRate) ?? 0, lineTotal));
  });

  const vatBreakdown = [...baseByRate.entries()]
    .sort(([rateA], [rateB]) => rateB - rateA)
    .map(([rate, baseHT]) => ({ rate, baseHT, vatAmount: applyRate(baseHT, rate) }));

  const totalHT = addCents(...lines.map((line) => line.totalHT));
  const totalVAT = addCents(...vatBreakdown.map((entry) => entry.vatAmount));

  return {
    lines,
    vatBreakdown,
    totalHT,
    totalVAT,
    totalTTC: addCents(totalHT, totalVAT),
  };
}
