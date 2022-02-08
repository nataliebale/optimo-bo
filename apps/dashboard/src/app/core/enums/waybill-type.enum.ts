export enum WaybillType {
  LocalShipping = 1,
  WithTransportation,
  WithoutTransportation,
  Distribution,
  Return,
  SubWaybill
}

export const waybillTypeData = {
  [WaybillType.LocalShipping]: 'შიდა გადაზიდვა',
  [WaybillType.WithTransportation]: 'ტრანსპორტირებით',
  [WaybillType.WithoutTransportation]: 'ტრანსპორტირების გარეშე',
  [WaybillType.Distribution]: 'დისტრიბუცია',
  [WaybillType.Return]: 'უკან დაბრუნება',
  [WaybillType.SubWaybill]: 'ქვე-ზედნადები'
};
