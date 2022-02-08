import {
  Component,
  OnInit,
  Inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  QueryList,
  ViewChildren,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ClientService } from '@optimo/core';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { LoadingPopupComponent } from '../../../../popups/loading-popup/loading-popup.component';
import { FileDownloadHelper } from '../../../../core/helpers/file-download/file-download.helper.ts';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { NumberColumnType } from '@optimo/ui-table';
import {
  getUMOAcronym,
  MeasurementUnit,
} from '../../../../core/enums/measurement-units.enum';
import { NgModel } from '@angular/forms';
import {
  MAP_OF_INVENTORISATION_REASONS,
  InventorisationReason,
} from '../../../../core/enums/inventorisation-reason.enum';
import { drop } from 'lodash-es';
import { RoutingStateService } from '@optimo/core';
import { textIsTruncated } from '@optimo/util/text-is-truncated';
import { MixpanelService } from '@optimo/mixpanel';
@Component({
  selector: 'app-inventorisation-mismatches',
  templateUrl: './inventorisation-mismatches.component.html',
  styleUrls: ['./inventorisation-mismatches.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventorisationMismatchesComponent implements OnInit, OnDestroy {
  public textIsTruncated = textIsTruncated;
  @ViewChildren('reason')
  reasonSelects: QueryList<any>;

  @ViewChild('confirmPopupWithErrors', {
    read: TemplateRef,
  })
  confirmPopupWithErrorsTemplate: TemplateRef<any>;

  MAP_OF_INVENTORISATION_NEGATIVE_REASONS = drop(
    MAP_OF_INVENTORISATION_REASONS
  );
  MAP_OF_INVENTORISATION_POSITIVE_REASONS = [MAP_OF_INVENTORISATION_REASONS[0]];
  getUMOAcronym = getUMOAcronym;
  MeasurementUnit = MeasurementUnit;
  Math = Math;
  item: any;
  isSubmited: boolean;
  requestIsSent: boolean;

  mismatches: any[];
  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'Inventorisations.Mismatches.List.TableColumns.name',
      filterable: false,
      sortable: false,
      widthCoefficient: 2,
    },
    {
      dataField: 'quantityOnHand',
      columnType: ColumnType.Number,
      caption: 'Inventorisations.Mismatches.List.TableColumns.quantityOnHand',
      data: {
        type: NumberColumnType.Quantity,
        UOMFieldName: 'unitOfMeasurement',
      },
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
    {
      dataField: 'stocktakeQuantity',
      columnType: ColumnType.Number,
      caption:
        'Inventorisations.Mismatches.List.TableColumns.stocktakeQuantity',
      data: {
        type: NumberColumnType.Quantity,
        UOMFieldName: 'unitOfMeasurement',
      },
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
    {
      dataField: 'mismatch',
      columnType: ColumnType.Number,
      caption: 'Inventorisations.Mismatches.List.TableColumns.mismatch',
      data: {
        type: NumberColumnType.Quantity,
        UOMFieldName: 'unitOfMeasurement',
      },
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
    // { // to be removed
    //   dataField: 'approvedQuantity',
    //   columnType: ColumnType.Text,
    //   caption: 'Inventorisations.Mismatches.List.TableColumns.approvedQuantity',
    //   filterable: false,
    //   sortable: false,
    //   widthCoefficient: 1,
    // },
    // {
    //   dataField: 'unapprovedQuantity',
    //   columnType: ColumnType.Number,
    //   caption: 'Inventorisations.Mismatches.List.TableColumns.unapprovedQuantity',
    //   data: {
    //     type: NumberColumnType.Quantity,
    //     UOMFieldName: 'unitOfMeasurement',
    //   },
    //   filterable: false,
    //   sortable: false,
    //   widthCoefficient: 1,
    // },
    {
      dataField: 'reason',
      columnType: ColumnType.Text,
      caption: 'Inventorisations.Mismatches.List.TableColumns.reason',
      filterable: false,
      sortable: false,
      widthCoefficient: 1.3,
    },
  ];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private bottomSheetRef: MatBottomSheetRef<
      InventorisationMismatchesComponent
    >,
    @Inject(MAT_BOTTOM_SHEET_DATA) public params: any,
    private dialog: MatDialog,
    private client: ClientService,
    private fileDownloadHelper: FileDownloadHelper,
    private cdr: ChangeDetectorRef,
    private routingState: RoutingStateService,
    private _mixpanelService: MixpanelService
  ) {}

  ngOnInit(): void {
    this.mismatches =
      this.params &&
      this.params.data.map((item) => {
        const mismatch = item.stocktakeQuantity - item.quantityOnHand;
        return {
          ...item,
          mismatch,
          reason:
            mismatch > 0
              ? InventorisationReason.StocktakePlus
              : mismatch < 0
              ? InventorisationReason.StocktakeMinus
              : null,
        };
      });
    this.getItem();
  }

  private getItem(): void {
    this.client
      .get(`stocktakeorders/${this.params.id}`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (!result) {
          this.close();
        }
        this.item = result;
        this.cdr.markForCheck();
      }, () => this.close());
  }

  onConfirm(): void {
    this.isSubmited = true;
    if (this.isFormInvalid) {
      this.markFormGroupTouched();
      return;
    }
    this.openApproveDialog();
  }

  private openApproveDialog(): void {
    const config = this.params.hasErrors
      ? {
          panelClass: 'mismatches-popup',
          data: {
            templateRef: this.confirmPopupWithErrorsTemplate,
            approveBtnLabel: 'Inventorisations.Mismatches.confirm',
            denyBtnLabel: 'Inventorisations.Mismatches.deny',
          } as any,
        }
      : {
          data: {
            title: 'Inventorisations.Mismatches.ApproveDialog.title',
            message: 'Inventorisations.Mismatches.ApproveDialog.message',
            approveBtnLabel: 'Inventorisations.Mismatches.ApproveDialog.yes',
            denyBtnLabel: 'Inventorisations.Mismatches.ApproveDialog.no',
          },
        };

    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        ...config,
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.confirm();
        }
      });
  }

  private confirm(): void {
    this.requestIsSent = true;
    this.cdr.markForCheck();

    const request = this.client.put('stocktakeorders/finish', {
      id: this.params.id,
      orderLines: this.mismatches,
    });

    this.dialog
      .open(LoadingPopupComponent, {
        width: '548px',
        data: {
          observable: request,
          message: 'მიმდინარეობს პროდუქტების ინვენტარიზაცია',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (data) => {
          this._mixpanelService.track('Edit Stock Take (Success)');
          this.bottomSheetRef.dismiss(
            data!==undefined ? (this.routingState.getPreviousUrlTree() || true) : false
          );
        },
        () => {
          this.requestIsSent = false;
          this.cdr.markForCheck();
        }
      );

    // this.client
    //   .put('stocktakeorders/finish', {
    //     id: this.params.id,
    //     orderLines: this.mismatches,
    //   })
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe(
    //     () => {
    //       this.bottomSheetRef.dismiss(
    //         this.routingState.getPreviousUrlTree() || true
    //       );
    //     },
    //     () => {
    //       this.requestIsSent = false;
    //       this.cdr.markForCheck();
    //     }
    //   );
  }

  onExcelDownload(): void {
    const request = this.client.post(
      `stocktakeorders/${this.params.id}/excel/errors`,
      this.params.formData,
      { responseType: 'blob', file: true }
    );
    this.dialog
      .open(LoadingPopupComponent, {
        width: '548px',
        data: {
          observable: request,
          message: 'Inventorisations.Mismatches.Downloading',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: HttpResponse<Blob>) => {
        if (response) {
          this.fileDownloadHelper.downloadFromResponse(
            response,
            'application/ms-excel'
          );
        }
      });
  }

  markFormGroupTouched(): void {
    this.reasonSelects.forEach((model: NgModel) => {
      model.control.markAllAsTouched();
    });
    this.cdr.markForCheck();
  }

  parseFloatWithCommas(value: string): number {
    return Number.parseFloat(value.replace(/,/g, ''));
  }

  get isFormInvalid(): boolean {
    return this.reasonSelects.some((model: NgModel) => {
      return !model.control.value;
    });
  }

  getDecimalType(unitOfMeasurement: MeasurementUnit): string {
    let lenght;
    switch (unitOfMeasurement) {
      case MeasurementUnit.Kilogram: {
        lenght = 3;
        break;
      }
      case MeasurementUnit.Piece: {
        lenght = 0;
        break;
      }
      default: {
        lenght = 2;
      }
    }
    return 'separator.' + lenght;
  }

  onCancel(): void {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          title: 'DefaultApproveDialog.title',
          message: 'DefaultApproveDialog.message',
          approveBtnLabel: 'DefaultApproveDialog.yes',
          denyBtnLabel: 'DefaultApproveDialog.no',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.close();
        }
      });
  }

  private close(): void {
    this.bottomSheetRef.dismiss();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
