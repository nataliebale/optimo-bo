export interface ICatalogueStockItem {
  id: number;
  name: string;
  barcode: string;
  category: string;
  businessType: Array<any>;
  description: string;
  photoUrl: string;
  photoId: string;
  status: number;
}
