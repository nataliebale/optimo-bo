import { EOptimoProductType } from './EOptimoProductType';

export function filterNavsByProductType(
  navs: any[],
  currentProductType: EOptimoProductType
) {
  return navs.filter((mavItem) => {
    if (mavItem.children) {
      mavItem.children = filterNavsByProductType(
        mavItem.children,
        currentProductType
      );
    }
    return mavItem.productTypes.includes(currentProductType);
  });
}
