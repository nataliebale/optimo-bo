export enum MeasurementUnit {
  Piece = 1,
  Kilogram,
  Liter,
  Meter,
  SquareMeter,
  Gram,
  Milliliter
}

export const mapOfMeasurementUnits = [
  { value: MeasurementUnit.Piece, label: 'ცალი' },
  { value: MeasurementUnit.Kilogram, label: 'კილოგრამი' },
  { value: MeasurementUnit.Liter, label: 'ლიტრი' },
  { value: MeasurementUnit.Meter, label: 'მეტრი' },
  { value: MeasurementUnit.SquareMeter, label: 'კვადრატული მეტრი' },
  { value: MeasurementUnit.Gram, label: 'გრამი' },
  { value: MeasurementUnit.Milliliter, label: 'მილილიტრი' }
];

export const mapOfMeasurementUnitsShort = [
  { value: MeasurementUnit.Piece, label: 'ც' },
  { value: MeasurementUnit.Kilogram, label: 'კგ' },
  { value: MeasurementUnit.Liter, label: 'ლ' },
  { value: MeasurementUnit.Meter, label: 'მ' },
  { value: MeasurementUnit.SquareMeter, label: 'კვ.მ' },
  { value: MeasurementUnit.Gram, label: 'გ' },
  { value: MeasurementUnit.Milliliter, label: 'მლ' }
];

export const measurementUnitsData = {
  [MeasurementUnit.Piece]: 'ცალი',
  [MeasurementUnit.Kilogram]: 'კილოგრამი',
  [MeasurementUnit.Liter]: 'ლიტრი',
  [MeasurementUnit.Meter]: 'მეტრი',
  [MeasurementUnit.SquareMeter]: 'კვადრატული მეტრი',
  [MeasurementUnit.Gram]: 'გრამი',
  [MeasurementUnit.Milliliter]: 'მილილიტრი'
};

export function getUMOAcronym(UMO: MeasurementUnit): string {
  switch (UMO) {
    case MeasurementUnit.Piece: {
      return 'ც';
    }
    case MeasurementUnit.Kilogram: {
      return 'კგ';
    }
    case MeasurementUnit.Liter: {
      return 'ლ';
    }
    case MeasurementUnit.Meter: {
      return 'მ';
    }
    case MeasurementUnit.SquareMeter: {
      return 'კვ.მ';
    }
    case MeasurementUnit.Gram: {
      return 'გ';
    }
    case MeasurementUnit.Milliliter: {
      return 'მლ';
    }
    default:
      return '';
  }
}

export function getUMOFullName(UMO: MeasurementUnit): string {
  switch (UMO) {
    case MeasurementUnit.Piece: {
      return 'ცალი';
    }
    case MeasurementUnit.Kilogram: {
      return 'კილოგრამი';
    }
    case MeasurementUnit.Liter: {
      return 'ლიტრი';
    }
    case MeasurementUnit.Meter: {
      return 'მეტრი';
    }
    case MeasurementUnit.SquareMeter: {
      return 'კვადრატული მეტრი';
    }
    case MeasurementUnit.Gram: {
      return 'გრამი';
    }
    case MeasurementUnit.Milliliter: {
      return 'მილილიტრი';
    }
    default:
      return '';
  }
}
