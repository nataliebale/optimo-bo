export enum CompanyType {
  Individual,
  LTD,
  Other,
}

export const mapOfCompanyTypes = [
  { value: CompanyType.Individual, text: 'GENERAL.CompanyTypes.Individual' },
  { value: CompanyType.LTD, text: 'GENERAL.CompanyTypes.LTD' },
  { value: CompanyType.Other, text: 'GENERAL.CompanyTypes.Other' },
];

export function isPackageType(value: any): value is CompanyType {
  return Number.isInteger(value) && value in CompanyType;
}
