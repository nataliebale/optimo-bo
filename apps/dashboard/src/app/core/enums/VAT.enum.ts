export enum VATTypes {
  Zero = 0,
  Standard = 18,
  Exempt = -1
}

export const mapOfVATTypes = {
  [VATTypes.Standard]: 'ჩვეულებრივი',
  [VATTypes.Zero]: 'ნულოვანი',
  [VATTypes.Exempt]: 'დაუბეგრავი'
};

export const arrayOfVATTypes = [
  { value: VATTypes.Standard, label: 'ჩვეულებრივი' },
  { value: VATTypes.Zero, label: 'ნულოვანი' },
  { value: VATTypes.Exempt, label: 'დაუბეგრავი' }
];
export const RSVATTypes = {
  0: 'ჩვეულებრივი',
  1: 'ნულოვანი',
  2: 'დაუბეგრავი'
};
