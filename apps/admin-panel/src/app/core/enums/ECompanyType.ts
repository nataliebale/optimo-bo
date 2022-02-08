export enum ECompanyType {
  Individual,
  LTD,
  Other,
}

export const CompanyTypeTitles = [
  { id: ECompanyType.Individual.toString(), name: 'ინდ. მეწარმე' },
  { id: ECompanyType.LTD.toString(), name: 'შპს' },
  { id: ECompanyType.Other.toString(), name: 'სხვა' },
];

export function getCompanyType(status: number): string {
  switch (status) {
    case ECompanyType.Individual: {
      return 'Individual';
    }
    case ECompanyType.LTD: {
      return 'LTD';
    }
    case ECompanyType.Other: {
      return 'Other';
    }
    default:
      return '';
  }
}
