import { Injectable } from '@angular/core';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { MeasurementUnit } from '../enums/measurement-units.enum';
import { VATTypes } from '../enums/VAT.enum';
import { addDays } from 'date-fns';
import { ClientService } from '@optimo/core';

class Guid {
  static readonly characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (
      c
    ) {
      const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  static newBarCode() {
    return 'xxxxxxxxxxxx'.replace(/[x]/g, () =>
      Math.floor(Math.random() * 10).toString()
    );
  }
  static newName() {
    return 'xxxxx xxxxxxxxx'.replace(/[x]/g, () =>
      this.characters.charAt(Math.floor(Math.random() * this.characters.length))
    );
  }

  static randomEnum<T>(anEnum: T): T[keyof T] {
    const enumValues = (Object.keys(anEnum)
      .map((n) => Number.parseInt(n))
      .filter((n) => !Number.isNaN(n)) as unknown) as T[keyof T][];
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    const randomEnumValue = enumValues[randomIndex];
    return randomEnumValue;
  }
}

@Injectable({
  providedIn: 'root',
})
export class TestService {
  constructor(private client: ClientService) {}

  public async createTestSaleOrders(dateFrom: Date, dateTo: Date) {
    const stockItems = await this.client
      .get<any>('stockitems', {
        params: new HttpParams({
          fromObject: {
            sortField: 'id',
            sortOrder: 'ASC',
            pageIndex: '0',
            pageSize: '999',
          },
        }),
      })
      .toPromise();

    let date = dateFrom;

    while (date < dateTo) {
      for (const item of stockItems.data) {
        let promises = [];
        const count = Math.random() * 50;
        for (let i = 0; i < count; i++) {
          const rand = Math.random();
          const saleOrder = {
            orderDate: addDays(date, rand).toISOString(),
            paymentMethod: rand > 0.5 ? 'Cash' : 'Card',
            transactionId: Guid.newGuid(),
            orderLines: [
              {
                stockItemId: item.id,
                quantity: 1,
                unitPrice: item.unitPrice,
              },
            ],
          };

          promises.push(
            this.client.post<any>('pos/sale', saleOrder).toPromise()
          );
        }
        await Promise.all(promises);
        promises = [];
      }

      date = addDays(date, 1);
    }
  }

  public async createTestStockItems(quantity: number) {
    const suppliers = await this.client
      .get<any>('suppliers', {
        params: new HttpParams({
          fromObject: {
            sortField: 'id',
            sortOrder: 'ASC',
            pageIndex: '0',
            pageSize: '999',
          },
        }),
      })
      .toPromise();
    const categories = await this.client
      .get<any>('stockitemcategories', {
        params: new HttpParams({
          fromObject: {
            sortField: 'id',
            sortOrder: 'ASC',
            pageIndex: '0',
            pageSize: '999',
          },
        }),
      })
      .toPromise();

    for (let i = 0; i < quantity; i++) {
      const rand = Math.random();
      const supplier = suppliers.data[Math.floor(suppliers.totalCount * rand)];
      const category =
        categories.data[Math.floor(categories.totalCount * rand)];

      const cost = Math.max(Math.trunc(rand * 300) / 100, 1);
      const price = Math.max(Math.trunc(cost * (1 + rand) * 100) / 100, 1.1);
      const margin = price - cost;
      const percent = Math.trunc(rand * 10000) / 100;

      const item = {
        supplierIds: [supplier.id],
        photoId: '3f11b747-1f39-47a6-a838-25e2020a2e56',
        categoryId: category.id,
        supplierId: supplier.id,
        barcode: Guid.newBarCode(),
        name: Guid.newName(),
        description: '',
        lowStockThreshold: 100,
        unitOfMeasurment: Guid.randomEnum(MeasurementUnit),
        vatRateType: Guid.randomEnum(VATTypes),
        unitPrice: price,
        quantityOnHand: 20000,
        unitCost: cost,
        startDate: new Date().toISOString(),
        marginNumber: margin,
        marginPrecent: percent,
      };

      const result = await this.client
        .post<any>('stockitems', item)
        .toPromise();
      console.log(result);
    }
  }
}
