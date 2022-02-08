import {
  Component,
  OnInit,
  Inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { ColumnType, ColumnData } from '@optimo/ui-table';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { NumberColumnType } from '@optimo/ui-table';
import { InventorisationType } from '../../../../core/enums/inventorisation-type.enum';
import {
  INVENTORISATION_CRITERIAS_DATA,
  InventorisationCriteria,
} from '../../../../core/enums/inventorisation-criteria.enum';
import { tap, map, takeUntil } from 'rxjs/operators';
import { getUMOAcronym } from '../../../../core/enums/measurement-units.enum';
import { INVENTORISATION_REASONS_DATA } from '../../../../core/enums/inventorisation-reason.enum';
import {
  IViewAttributeItem,
  ViewAttributeType,
} from '@optimo/ui/view-attributes';
import { Router } from '@angular/router';
import { NotificationsService } from '../../../../core/services/notifications/notifications.service';
import {
  INVENTORISATION_STATUS_DATA,
  InventorisationStatus,
} from '../../../../core/enums/inventorisation-status.enum';
import { TranslateService } from '@ngx-translate/core';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { MixpanelService } from '@optimo/mixpanel';
@Component({
  selector: 'app-view-inventorisation',
  templateUrl: './view-inventorisation.component.html',
  styleUrls: ['./view-inventorisation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewInventorisationComponent implements OnInit, OnDestroy {
public textIsTruncated = textIsTruncated;
  protected unsubscribe$ = new Subject<void>();

  InventorisationType = InventorisationType;
  INVENTORISATION_CRITERIAS_DATA = INVENTORISATION_CRITERIAS_DATA;
  getUMOAcronym = getUMOAcronym;
  // inventorisation$: Observable<any>;
  inventorisation: any;

  displayedColumns: ColumnData[];

  constructor(
    private client: ClientService,
    private dialogRef: MatDialogRef<ViewInventorisationComponent>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) private itemId: number,
    private router: Router,
    private notificator: NotificationsService,
    private _translateService: TranslateService,
    private _mixpanelService: MixpanelService
  ) {
    	this._mixpanelService.track('View Stock Take');
  }

  get inventorisationAttributeItems(): IViewAttributeItem[] {
    return [
      {
        title: 'Inventorisations.Item.Attributes.type',
        value: this._translateService.instant(
          'Inventorisations.Item.Attributes.typeHardValue'
        ),
      },
      {
        title: 'Inventorisations.Item.Attributes.criteria',
        value: INVENTORISATION_CRITERIAS_DATA[this.inventorisation?.criteria],
      },
      {
        title: 'Inventorisations.Item.Attributes.orderDate',
        value: this.inventorisation?.orderDate,
        type: ViewAttributeType.date,
      },
    ];
  }

  ngOnInit(): void {
    this.client
      .get<any>(`stocktakeorders/${this.itemId}`)
      .pipe(
        map((res) => ({
          ...res,
          orderLines: res.orderLines.map((line) => ({
            ...line,
            mismatch: line.stocktakeQuantity - line.quantityOnHand,
          })),
        })),
        tap((res) => {
          if (res.orderLines.length) {
            this.displayedColumns = [
              {
                dataField: 'stockItemName',
                columnType: ColumnType.Text,
                caption:
                  'Inventorisations.Item.List.TableColumns.stockItemName',
                filterable: false,
                sortable: false,
                widthCoefficient: 1.2,
              },
              {
                dataField: 'quantityOnHand',
                columnType: ColumnType.Number,
                caption:
                  'Inventorisations.Item.List.TableColumns.quantityOnHand',
                data: {
                  type: NumberColumnType.Quantity,
                  UOMFieldName: 'unitOfMeasurement',
                  isHeaderRight: true,
                },
                filterable: false,
                sortable: false,
                widthCoefficient: 0.7,
              },
              {
                dataField: 'stocktakeQuantity',
                columnType: ColumnType.Number,
                caption:
                  'Inventorisations.Item.List.TableColumns.stocktakeQuantity',
                data: {
                  type: NumberColumnType.Quantity,
                  UOMFieldName: 'unitOfMeasurement',
                },
                filterable: false,
                sortable: false,
                widthCoefficient: 1.2,
              },
              {
                dataField: 'mismatch',
                columnType: ColumnType.Number,
                caption: 'Inventorisations.Item.List.TableColumns.mismatch',
                data: {
                  type: NumberColumnType.Quantity,
                  UOMFieldName: 'unitOfMeasurement',
                },
                filterable: false,
                sortable: false,
                widthCoefficient: 0.8,
              },
              // {
              //   dataField: 'approvedQuantity',
              //   columnType: ColumnType.Number,
              //   caption: 'Inventorisations.Item.List.TableColumns.approvedQuantity',
              //   data: {
              //     type: NumberColumnType.Quantity,
              //     UOMFieldName: 'unitOfMeasurement',
              //   },
              //   filterable: false,
              //   sortable: false,
              // },
              // {
              //   dataField: 'unapprovedQuantity',
              //   columnType: ColumnType.Number,
              //   caption: 'Inventorisations.Item.List.TableColumns.unapprovedQuantity',
              //   data: {
              //     type: NumberColumnType.Quantity,
              //     UOMFieldName: 'unitOfMeasurement',
              //   },
              //   filterable: false,
              //   sortable: false,
              // },
              {
                dataField: 'reason',
                columnType: ColumnType.Dropdown,
                caption: 'Inventorisations.Item.List.TableColumns.reason',
                filterable: false,
                sortable: false,
                data: INVENTORISATION_REASONS_DATA,
                widthCoefficient: 0.9,
              },
            ];
          } else {
            this.displayedColumns = [
              {
                dataField: 'description',
                columnType: ColumnType.Text,
                caption:
                  'Inventorisations.Item.List.TableColumns.stockItemName',
                filterable: false,
                sortable: false,
              },
            ];
          }
        })
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((inventorisation) => {
        this.inventorisation = inventorisation;
        this.cdr.markForCheck();
      });
  }

  onBack(): void {
    this.dialogRef.close(false);
  }

  private getEndpoint(criteria: InventorisationCriteria): string {
    switch (criteria) {
      case InventorisationCriteria.Category: {
        return 'stockitemcategories';
      }
      case InventorisationCriteria.Supplier: {
        return 'suppliers';
      }
      case InventorisationCriteria.StockItem: {
        return 'stockitems';
      }
    }
  }

  onEdit(): void {
    const id = this.inventorisation.id;
    this.router.navigate(['/inventorisations/edit', id]).then(() => {
      this.dialogRef.close(true);
    });
  }

  onDelete(): void {
    this.client
      .delete<any>('stocktakeorders', { ids: [this.inventorisation.id] })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.notificator.saySuccess(
          this._translateService.instant(
            'Inventorisations.Item.SuccessMessageForDelete'
          )
        );
        this.dialogRef.close(true);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get isDraft(): boolean {
    return this?.inventorisation?.status === InventorisationStatus.Draft;
  }
}
