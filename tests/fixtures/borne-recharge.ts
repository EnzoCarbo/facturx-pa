import type { InvoiceInputData } from "../../src/index.js";
import { buyerLogistiqueDuRhone, sellerVoltInstall } from "./parties.js";

/** Pose d'une borne de recharge pour une entreprise : matériel + main-d'œuvre, TVA 20 %. */
export const borneRechargeInvoice: InvoiceInputData = {
  number: "FAC-2026-0042",
  issueDate: "2026-10-07",
  dueDate: "2026-11-06",
  seller: sellerVoltInstall,
  buyer: buyerLogistiqueDuRhone,
  lines: [
    {
      label: "Borne de recharge murale 7,4 kW",
      quantity: 1,
      unitPriceHT: 89_900,
      vatRate: 2000,
      nature: "bien",
    },
    {
      label: "Disjoncteur différentiel type A et câblage",
      quantity: 1,
      unitPriceHT: 18_550,
      vatRate: 2000,
      nature: "bien",
    },
    {
      label: "Main-d'œuvre installation (heures)",
      quantity: 3.5,
      unitPriceHT: 6_499,
      vatRate: 2000,
      nature: "service",
    },
    {
      label: "Mise en service et attestation de conformité",
      quantity: 1,
      unitPriceHT: 9_000,
      vatRate: 2000,
      nature: "service",
    },
  ],
  deliveryAddress: {
    line1: "4 avenue des Entrepôts, parking P2",
    postalCode: "69007",
    city: "Lyon",
    countryCode: "FR",
  },
  paymentTerms: "Paiement à 30 jours par virement. Pénalités de retard : 3 fois le taux d'intérêt légal. Indemnité forfaitaire pour frais de recouvrement : 40 €.",
};

// Main-d'œuvre : 3,5 × 64,99 = 227,465 → 227,47 € ; TVA : 1 401,97 × 20 % = 280,394 → 280,39 €
export const BORNE_RECHARGE_EXPECTED = {
  lineTotals: [89_900, 18_550, 22_747, 9_000],
  totalHT: 140_197,
  totalVAT: 28_039,
  totalTTC: 168_236,
} as const;
