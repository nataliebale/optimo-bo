import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { ColumnType, ColumnData } from '@optimo/ui-table';
import { PaymentMethods } from 'apps/dashboard/src/app/core/enums/payment-methods.enum';
import { ClientService } from '@optimo/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NumberColumnType } from 'src/app/shared-components/table/column/column-templates/number-column/number-column.component';

@Component({
  selector: 'app-public-order',
  templateUrl: './public-order.component.html',
  styleUrls: ['./public-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicOrderComponent implements OnInit, OnDestroy {
  stockItemsDisplayedColumns: ColumnData[] = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'პროდუქტის დასახელება',
      filterable: false,
      sortable: false,
    },
    {
      dataField: 'orderedQuantity',
      columnType: ColumnType.Number,
      caption: 'რაოდენობა',
      data: { type: NumberColumnType.Decimal },
      filterable: false,
      sortable: false,
    },
    {
      dataField: 'expectedUnitCost',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.Decimal },
      caption: 'თვითღირებულება',
      filterable: false,
      sortable: false,
    },
  ];

  private guid: number;
  private uid: any;
  order: any = {};

  rows: { key: string; value: string }[] = [];

  paymentMethods = {
    [PaymentMethods.Other]: 'სხვა',
    [PaymentMethods.Consignation]: 'კონსიგნაცია',
    [PaymentMethods.PrePayment]: 'წინასწარ გადახდა',
  };

  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.guid = this.route.snapshot.params.guid;
    this.uid = this.route.snapshot.params.uid;
    this.getData();
  }

  private async getData() {
    this.client
      .get(
        `public/purchaseorders/${this.guid}/${this.uid}`,
        'inventory-service'
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        this.order = result.order;

        this.rows = [
          {
            key: 'სახელი',
            value: result.businessOwnerCompanyName,
          },
          {
            key: 'საიდენტიფიკაციო კოდი',
            value: result.businessOwnerIdentificationNumber,
          },
          {
            key: 'გადახდის ტიპი',
            value: this.paymentMethods[this.order.paymentMethod],
          },
          {
            key: 'შეკვეთის მიტანის თარიღი',
            value: this.order.expectedReceiveDate,
          },
        ];

        this.cdr.markForCheck();
      });
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
