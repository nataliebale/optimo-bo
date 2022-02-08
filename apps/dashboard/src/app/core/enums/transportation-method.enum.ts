export enum TransportationMethod {
  RoadTransportation = 1,
  Other = 2,
}

export const TRANSPORTATION_METHOD_DATA = {
  [TransportationMethod.RoadTransportation]: 'საავტომობილო გადაზიდვა',
  [TransportationMethod.Other]: 'სხვა',
};

export const MAP_OF_TRANSPORTATION_METHODS = [
  {
    label: 'საავტომობილო გადაზიდვა',
    value: TransportationMethod.RoadTransportation,
  },
  { label: 'სხვა', value: TransportationMethod.Other },
];
