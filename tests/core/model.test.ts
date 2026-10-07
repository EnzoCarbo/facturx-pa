import { describe, expect, it } from "vitest";
import { InvoiceInputSchema } from "../../src/core/model.js";
import { borneRechargeInvoice } from "../fixtures/borne-recharge.js";
import { buyerParticulier } from "../fixtures/parties.js";

function withLine(patch: Record<string, unknown>) {
  const [first, ...rest] = borneRechargeInvoice.lines;
  return { ...borneRechargeInvoice, lines: [{ ...first, ...patch }, ...rest] };
}

describe("InvoiceInputSchema", () => {
  it("accepte la facture d'exemple", () => {
    expect(InvoiceInputSchema.safeParse(borneRechargeInvoice).success).toBe(true);
  });

  it("accepte un acheteur particulier sans SIREN", () => {
    const result = InvoiceInputSchema.safeParse({ ...borneRechargeInvoice, buyer: buyerParticulier });
    expect(result.success).toBe(true);
  });

  it("met FR comme pays par défaut", () => {
    const { countryCode: _, ...addressWithoutCountry } = borneRechargeInvoice.seller.address;
    const result = InvoiceInputSchema.parse({
      ...borneRechargeInvoice,
      seller: { ...borneRechargeInvoice.seller, address: addressWithoutCountry },
    });
    expect(result.seller.address.countryCode).toBe("FR");
  });

  it("rejette une entrée qui n'est pas un objet", () => {
    expect(InvoiceInputSchema.safeParse(null).success).toBe(false);
    expect(InvoiceInputSchema.safeParse("facture").success).toBe(false);
  });

  it("rejette une facture sans vendeur", () => {
    const { seller: _, ...withoutSeller } = borneRechargeInvoice;
    const result = InvoiceInputSchema.safeParse(withoutSeller);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["seller"]);
  });

  it("rejette un prix unitaire en euros décimaux au lieu de centimes", () => {
    const result = InvoiceInputSchema.safeParse(withLine({ unitPriceHT: 899.0 + 0.5 }));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["lines", 0, "unitPriceHT"]);
  });

  it("rejette un taux de TVA exprimé en décimal (5.5 au lieu de 550)", () => {
    expect(InvoiceInputSchema.safeParse(withLine({ vatRate: 5.5 })).success).toBe(false);
  });

  it("rejette une quantité nulle ou avec plus de 3 décimales", () => {
    expect(InvoiceInputSchema.safeParse(withLine({ quantity: 0 })).success).toBe(false);
    expect(InvoiceInputSchema.safeParse(withLine({ quantity: 1.2345 })).success).toBe(false);
  });

  it("rejette une nature de ligne inconnue", () => {
    expect(InvoiceInputSchema.safeParse(withLine({ nature: "location" })).success).toBe(false);
  });

  it("rejette une date mal formée", () => {
    const result = InvoiceInputSchema.safeParse({ ...borneRechargeInvoice, issueDate: "07/10/2026" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["issueDate"]);
  });

  it("rejette une exonération inconnue", () => {
    const result = InvoiceInputSchema.safeParse({ ...borneRechargeInvoice, vatExemption: "autre" });
    expect(result.success).toBe(false);
  });

  it("rejette des totaux fournis en entrée (ils sont toujours calculés)", () => {
    const result = InvoiceInputSchema.safeParse({ ...borneRechargeInvoice, totalTTC: 168_236 });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.code).toBe("unrecognized_keys");
  });

  it("remonte toutes les erreurs, pas seulement la première", () => {
    const result = InvoiceInputSchema.safeParse({
      ...borneRechargeInvoice,
      issueDate: "hier",
      dueDate: "demain",
      paymentTerms: "",
    });
    expect(result.error?.issues).toHaveLength(3);
  });
});
