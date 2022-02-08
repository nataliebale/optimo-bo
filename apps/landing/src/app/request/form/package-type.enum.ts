export enum PackageType {
  Basic,
  Standard,
  Premium,
}

export const mapOfPackageTypes = [
  { value: PackageType.Basic, text: 'GENERAL.Basic' },
  { value: PackageType.Standard, text: 'GENERAL.Standart' },
  { value: PackageType.Premium, text: 'GENERAL.Premium', disabled: true },
];

export function isPackageType(value: any): value is PackageType {
  return Number.isInteger(value) && value in PackageType;
}
