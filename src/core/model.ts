import { z } from "zod";
import { hasValidQuantityPrecision, QUANTITY_DECIMALS } from "./money.js";

// Forme d'une facture. Les règles métier (SIREN, taux autorisés…) sont dans rules/.
// Objets stricts : un champ inconnu (ex. totalTTC) est refusé.

const nonEmpty = z.string().trim().min(1);

/** "2026-10-07" */
export const IsoDateSchema = z.iso.date();

export const AddressSchema = z.strictObject({
  line1: nonEmpty,
  line2: z.string().optional(),
  postalCode: nonEmpty,
  city: nonEmpty,
  countryCode: z
    .string()
    .regex(/^[A-Z]{2}$/)
    .default("FR"), // code pays ISO : FR, BE…
});

export const PartyKindSchema = z.enum(["entreprise", "particulier"]);

export const PartySchema = z.strictObject({
  kind: PartyKindSchema,
  name: nonEmpty,
  siren: z.string().optional(),
  vatNumber: z.string().optional(),
  address: AddressSchema,
});

export const LineNatureSchema = z.enum(["bien", "service"]);

export const InvoiceLineSchema = z.strictObject({
  label: z.string(),
  quantity: z
    .number()
    .positive()
    .refine(hasValidQuantityPrecision, {
      error: `La quantité doit avoir au plus ${QUANTITY_DECIMALS} décimales.`,
    }),
  unitPriceHT: z.int().nonnegative(), // centimes
  vatRate: z.int().nonnegative(), // points de base : 2000 = 20 %
  nature: LineNatureSchema,
});

export const VatExemptionSchema = z.enum(["franchise_293B"]);

export const InvoiceInputSchema = z.strictObject({
  number: z.string(), // fourni par l'application appelante
  issueDate: IsoDateSchema,
  dueDate: IsoDateSchema,
  seller: PartySchema,
  buyer: PartySchema,
  lines: z.array(InvoiceLineSchema),
  deliveryAddress: AddressSchema.optional(),
  vatExemption: VatExemptionSchema.optional(),
  paymentTerms: nonEmpty,
});

export type Address = z.infer<typeof AddressSchema>;
export type PartyKind = z.infer<typeof PartyKindSchema>;
export type Party = z.infer<typeof PartySchema>;
export type LineNature = z.infer<typeof LineNatureSchema>;
export type InvoiceLine = z.infer<typeof InvoiceLineSchema>;
export type VatExemption = z.infer<typeof VatExemptionSchema>;
export type InvoiceInput = z.infer<typeof InvoiceInputSchema>;
/** Données brutes, avant parsing. */
export type InvoiceInputData = z.input<typeof InvoiceInputSchema>;
