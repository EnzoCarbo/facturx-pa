import { z } from "zod";
import { hasValidQuantityPrecision, QUANTITY_DECIMALS } from "./money.js";

/**
 * Schémas de forme des données d'entrée.
 *
 * Zod vérifie la structure et les types (champs présents, entiers, dates ISO…).
 * Les règles métier (clé SIREN, taux autorisés, échéance >= émission…) sont dans `rules/`,
 * pour que toutes les erreurs soient remontées ensemble avec des messages explicites.
 *
 * Les objets sont stricts : un champ inconnu est refusé. En particulier, on ne peut pas
 * fournir de totaux : ils sont toujours calculés.
 */

const nonEmpty = z.string().trim().min(1);

/** Date calendaire ISO 8601 : "2026-10-07". */
export const IsoDateSchema = z.iso.date();

export const AddressSchema = z.strictObject({
  line1: nonEmpty,
  line2: z.string().optional(),
  postalCode: nonEmpty,
  city: nonEmpty,
  /** Code pays ISO 3166-1 alpha-2. */
  countryCode: z
    .string()
    .regex(/^[A-Z]{2}$/)
    .default("FR"),
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
  /** Prix unitaire hors taxes, en centimes. */
  unitPriceHT: z.int().nonnegative(),
  /** Taux de TVA en points de base : 2000 = 20 %. */
  vatRate: z.int().nonnegative(),
  nature: LineNatureSchema,
});

export const VatExemptionSchema = z.enum(["franchise_293B"]);

export const InvoiceInputSchema = z.strictObject({
  /** Numéro attribué par l'application appelante (le cœur ne numérote pas). */
  number: z.string(),
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
/** Données brutes avant parsing (les champs ayant une valeur par défaut y sont optionnels). */
export type InvoiceInputData = z.input<typeof InvoiceInputSchema>;
