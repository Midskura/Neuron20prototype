/**
 * Canonical company list for JJB OS
 * Use full names in forms and popovers, short codes in tight spaces (table chips, badges)
 */

export interface Company {
  id: string;
  name: string;
  short: string;
}

export const COMPANIES: Company[] = [
  {
    id: "cce",
    name: "Conforme Cargo Express",
    short: "CCE",
  },
  {
    id: "znicf",
    name: "ZN International Cargo Forwarding Company",
    short: "ZNICF",
  },
  {
    id: "jlcs",
    name: "Juan Logistica Courier Services",
    short: "JLCS",
  },
  {
    id: "zomi",
    name: "Zeuj One Marketing International",
    short: "ZOMI",
  },
  {
    id: "cptc",
    name: "Conforme Packaging and Trading Corporation",
    short: "CPTC",
  },
];

export const getCompanyById = (id: string): Company | undefined => {
  return COMPANIES.find((c) => c.id === id);
};

export const getCompanyByName = (name: string): Company | undefined => {
  return COMPANIES.find((c) => c.name === name);
};

export const getCompanyShort = (id: string): string => {
  return getCompanyById(id)?.short || id;
};

export const getCompanyName = (id: string): string => {
  return getCompanyById(id)?.name || id;
};
