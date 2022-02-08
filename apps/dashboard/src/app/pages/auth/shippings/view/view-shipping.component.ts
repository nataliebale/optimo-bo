import {
  Component,
  OnInit,
  Inject,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { ClientService, Service } from '@optimo/core';
import { ColumnType, ColumnData } from '@optimo/ui-table';
import { OrderStatuses } from '../../../../core/enums/order-status.enum';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { NumberColumnType } from '@optimo/ui-table';
import { IViewAttributeItem } from '@optimo/ui/view-attributes';
import { takeUntil, tap } from 'rxjs/operators';
import { ShippingStatuses } from '../../../../core/enums/shipping-status.enum';
import { Router } from '@angular/router';
import { DialogAction, DialogActionTypes } from '../../base-list.component';
import { textIsTruncated } from '@optimo/util/text-is-truncated';
import { HttpParams } from '@angular/common/http';
import { MixpanelService } from '@optimo/mixpanel';
import { TranslateService } from '@ngx-translate/core';

export interface ScrollState<T> {
  items: T[];
  requestIsSent: boolean;
  allFetched: boolean;
  chunkSize: number;
}

@Component({
  selector: 'app-view-shipping',
  templateUrl: './view-shipping.component.html',
  styleUrls: ['./view-shipping.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewShippingComponent implements OnInit, OnDestroy {
  public textIsTruncated = textIsTruncated;
  shipping: any;
  private unsubscribe$ = new Subject<void>();

  private scrollState: ScrollState<any> = {
    requestIsSent: false,
    allFetched: false,
    chunkSize: 20,
    items: [],
  };

  get orderLines(): any[] {
    return this.scrollState.items;
  }

  displayedColumns: ColumnData[] = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'Shipping.Item.List.TableColumns.stockItemName',
      filterable: false,
      sortable: false,
    },
    {
      dataField: 'quantity',
      columnType: ColumnType.Number,
      caption: 'Shipping.Item.List.TableColumns.quantity',
      data: {
        type: NumberColumnType.Quantity,
        UOMFieldName: 'unitOfMeasurement',
      },
      filterable: false,
      sortable: false,
    },
  ];

  orderStatuses = OrderStatuses;

  constructor(
    private client: ClientService,
    private dialogRef: MatDialogRef<ViewShippingComponent, DialogAction>,
    @Inject(MAT_DIALOG_DATA) private itemId: number,
    protected router: Router,
    protected cdr: ChangeDetectorRef,
    private _mixpanelService: MixpanelService,
    private _translate: TranslateService,
  ) {
    	this._mixpanelService.track('View Stock Transfer');
  }

  ngOnInit(): void {
    this.client
      .get(`stocktransferorders/${this.itemId}`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((shipping) => {
        this.shipping = shipping;
        this.cdr.markForCheck();
      });
    this.fetchOrderLines(this.scrollState);
  }

  fetchOrderLines(scrollState: ScrollState<any>): void {
    this.client
      .get(`stocktransferorders/orderlines/${this.itemId}`, {
        params: new HttpParams({
          fromObject: {
            skip: scrollState.items.length.toString(),
            take: '20',
          },
        }),
        service: Service.Main,
      })
      .pipe(
        tap((_) => (scrollState.requestIsSent = true)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((orderLines: any[]) => {
        console.log('dev => fetched items:', orderLines);
        scrollState.allFetched = orderLines.length < scrollState.chunkSize;
        scrollState.items = [...scrollState.items, ...orderLines];
        scrollState.requestIsSent = false;
        console.log(
          'dev => scrollState.items.length',
          scrollState.items.length
        );
        this.cdr.detectChanges();
      });
  }

  onScroll() {
    console.log('dev => onScroll', 123);
    this.fetchOrderLines(this.scrollState);
  }

  get shippingAttributeItems(): IViewAttributeItem[] {

    return [
      {
        title: this._translate.instant('Shipping.Item.Details.locationNameFrom'),
        value: this?.shipping?.locationNameFrom,
      },
      {
        title: this._translate.instant('Shipping.Item.Details.locationNameTo'),
        value: this?.shipping?.locationNameTo,
      },
      ...(this?.shipping?.transportationType === 2
          ? [
            {
              title: this._translate.instant('Shipping.Item.Details.TransportationMethod'),
              value: this._translate.instant('Shipping.Item.Details.OtherTransportation'),
            },
            {
              title: this._translate.instant('Shipping.Item.Details.TransportName'),
              value: this?.shipping?.transportName,
            },
            {
              title: this._translate.instant('Shipping.Item.Details.EndAddress'),
              value: this?.shipping?.endAddress,
            },
          ]
          : [
            {
              title: this._translate.instant('Shipping.Item.Details.TransportationMethod'),
              value: this._translate.instant('Shipping.Item.Details.CarTransportation'),
            },
            {
              title: this._translate.instant('Shipping.Item.Details.DriverName'),
              value: this?.shipping?.driverName,
            },
            {
              title: this._translate.instant('Shipping.Item.Details.DriverPin'),
              value: this?.shipping?.driverPIN,
            },
            {
              title: this._translate.instant('Shipping.Item.Details.DriverCarNumber'),
              value: this?.shipping?.driverCarNumber,
            },
            {
              title: this._translate.instant('Shipping.Item.Details.EndAddress'),
              value: this?.shipping?.endAddress,
            },
          ]),
      
    ];
  }

  onBack(): void {
    this.dialogRef.close({
      actionType: DialogActionTypes.close,
      id: this?.shipping?.id,
    });
  }

  onDelete(): void {
    // this.client.delete('stocktransferorders', {ids: [this?.shipping?.id,]})
    //   .pipe(
    //     takeUntil(this.unsubscribe$),
    //   )
    //   .subscribe(
    //     () => {
    //       this.dialogRef.close({
    //         actionType: DialogActionTypes.delete,
    //         id: this?.shipping?.id
    //       });
    //       this.notificator.saySuccess('ჩანაწერი წარმატებით წაიშალა');
    //     }
    //   )
    this.dialogRef.close({
      actionType: DialogActionTypes.delete,
      id: this?.shipping?.id,
    });
  }

  onEdit(): void {
    this.dialogRef.close({
      actionType: DialogActionTypes.close,
      id: this?.shipping?.id,
    });

    this.router.navigate(['/shippings/edit', this.shipping?.id]).then(() => {
      this.dialogRef.close({
        actionType: DialogActionTypes.close,
        id: this?.shipping?.id,
      });
    });
  }

  get isDraft(): boolean {
    return this.shipping?.status === ShippingStatuses.Draft;
  }

  onDraftFinish(id: number) {
    this.dialogRef.close({ actionType: DialogActionTypes.draftFinish, id: id });
  }

  onExcelDownload() {
    window.open(this.shipping.excelFileUrl);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
