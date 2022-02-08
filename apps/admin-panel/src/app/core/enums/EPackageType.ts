export enum EPackageType {
  Basic,
  Standard,
  Premium,
}

export const PackageTypeTitles = [
  { id: EPackageType.Basic.toString(), name: 'Basic' },
  { id: EPackageType.Standard.toString(), name: 'Standard' },
  { id: EPackageType.Premium.toString(), name: 'Premium' },
];

export function getPackageType(status: number): string {
  switch (status) {
    case EPackageType.Basic: {
      return 'Individual';
    }
    case EPackageType.Standard: {
      return 'LTD';
    }
    case EPackageType.Premium: {
      return 'Other';
    }
    default:
      return '';
  }
}
