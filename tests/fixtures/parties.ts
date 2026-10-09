import type { InvoiceInputData } from "../../src/index.js";

type PartyData = InvoiceInputData["seller"];

/** SIREN inventés, mais valides (clé de Luhn). */
export const FICTIVE_SIRENS = {
  seller: "123456782",
  buyer: "987654324",
  other: "555444330",
} as const;

export const sellerVoltInstall: PartyData = {
  kind: "entreprise",
  name: "Volt Install SAS",
  siren: FICTIVE_SIRENS.seller,
  vatNumber: "FR11123456782",
  address: {
    line1: "12 rue des Électriciens",
    postalCode: "69003",
    city: "Lyon",
    countryCode: "FR",
  },
};

export const buyerLogistiqueDuRhone: PartyData = {
  kind: "entreprise",
  name: "Logistique du Rhône SARL",
  siren: FICTIVE_SIRENS.buyer,
  vatNumber: "FR14987654324",
  address: {
    line1: "4 avenue des Entrepôts",
    postalCode: "69007",
    city: "Lyon",
    countryCode: "FR",
  },
};

export const buyerParticulier: PartyData = {
  kind: "particulier",
  name: "Camille Martin",
  address: {
    line1: "8 chemin des Lilas",
    postalCode: "69100",
    city: "Villeurbanne",
    countryCode: "FR",
  },
};
