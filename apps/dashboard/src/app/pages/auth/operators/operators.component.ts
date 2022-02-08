import {
  Component,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ClientService } from '@optimo/core';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { AddOperatorModalComponent } from './add-operator-modal/add-operator-modal.component';
import { ColumnType, ColumnData } from '@optimo/ui-table';
import { Observable } from 'rxjs';
import { OperatorStatuses } from 'apps/dashboard/src/app/core/enums/operator-statuses.enum';
import { BaseListComponent } from '../base-list.component';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil, switchMap, map } from 'rxjs/operators';
import { OperatorTempPrivilegeModalComponent } from './temp-privilege-modal/operator-temp-privilege-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { MixpanelService } from '@optimo/mixpanel';

export enum OperatorPermission {
  CanReceivePurchaseOrders = 'canReceivePurchaseOrders',
  CanSetDiscount = 'canSetDiscount',
  CanChangePrice = 'canChangePrice',
  CanDeleteFromBasket = 'canDeleteFromBasket',
  CanDeleteBasket = 'canDeleteBasket',
  CanSeeAllOrders = 'canSeeAllOrders',
  CanOrder = 'canOrder',
  CanOpenShift = 'canOpenShift',
  CanSeeShiftSums = 'canSeeShiftSums',
  CanWithdrawCash = 'canWithdrawCash',
}

@Component({
  selector: 'app-operators',
  templateUrl: './operators.component.html',
  styleUrls: ['./operators.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperatorsComponent extends BaseListComponent {
  permissionsMap = {
    [OperatorPermission.CanReceivePurchaseOrders]: 'CanReceivePurchaseOrders',
    [OperatorPermission.CanSetDiscount]: 'CanSetDiscount',
    [OperatorPermission.CanChangePrice]: 'CanChangePrice',
    [OperatorPermission.CanDeleteFromBasket]: 'CanDeleteFromBasket',
    [OperatorPermission.CanDeleteBasket]: 'CanDeleteBasket',
    [OperatorPermission.CanSeeAllOrders]: 'CanSeeAllOrders',
    [OperatorPermission.CanOrder]: 'CanOrder',
    [OperatorPermission.CanOpenShift]: 'CanOpenShift',
    [OperatorPermission.CanSeeShiftSums]: 'CanSeeShiftSums',
    [OperatorPermission.CanWithdrawCash]: 'CanWithdrawCash',
  };
  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME_2',
      filterable: true,
      sortable: true,
    },
    // {
    //   dataField: 'canReceivePurchaseOrders',
    //   columnType: ColumnType.Dropdown,
    //   caption: 'შეკვეთების ჩვენება',
    //   data: {
    //     true: 'კი',
    //     false: 'არა',
    //   },
    //   filterable: true,
    //   sortable: true,
    //   className: 'text-right',
    // },
    {
      dataField: 'permissions',
      columnType: ColumnType.Dropdown,
      caption: 'OPERATORS.PERMISSIONS',
      data: this.permissionsMap,
      filterable: true,
      sortable: false,
      className: 'text-right',
      widthCoefficient: 2,
    },
    {
      dataField: 'dateBegin',
      columnType: ColumnType.Date,
      caption: 'OPERATORS.LAST_LOGIN_DATE',
      filterable: true,
      sortable: true,
      data: {
        type: 'dateTime',
      },
    },
  ];
  constructor(
    private client: ClientService,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private translate: TranslateService,
    private _mixpanelService: MixpanelService
  ) {
    super(notificator, cdr, route, dialog, router);
    this._mixpanelService.track('Employees');
  }

  protected get httpGetItems(): Observable<any> {
    return this.client
      .get('operators', {
        params: new HttpParams({
          fromObject: {
            ...this.currentState,
            status: `${OperatorStatuses.Enabled}`,
          },
        }),
      })
      .pipe(
        map((data: any) => {
          data.data.forEach((operator) => {
            const permissions = [];
            for (const permission in operator.permissions) {
              if (operator.permissions[permission]) {
                permissions.push(this.permissionsMap[permission]);
              }
            }
            // operator.permissions = permissions.join(', ');
            operator.permissions = permissions
              .map(value => this.translate.instant('OPERATORS.PERMISSION_VALUES.' + value))
              .join(', ');
          });
          return data;
        })
      );
  }

  addNewItem(): void {
    this.dialog
      .open(AddOperatorModalComponent, {
        width: '548px',
        panelClass: 'overflow-visible',
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.requestItems.next();
        }
      });
  }

  goToEdit(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    this.dialog
      .open(AddOperatorModalComponent, {
        width: '548px',
        data: id,
        panelClass: 'overflow-visible',
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.requestItems.next();
        }
      });
  }

  onTempPrivile(row: any): void {
    console.log('TCL: OperatorsComponent -> row', row);
    if (!row || !row.id) {
      return;
    }
    this.dialog.open(OperatorTempPrivilegeModalComponent, {
      width: '548px',
      data: row.id,
    });
  }

  protected requestDeleteItems(row?: any): Observable<any> {
    if (Array.isArray(row)) {
      for (let index = 0; index < row.length; index++) {
        const element = row[index];
        if (element.isLoggedIn) {
          this.notificator.sayError(
            this.translate.instant('OPERATORS.OPERATOR_CAN_BE_REMOVED_AFTER_SESSION_ENDS')
          );
          return;
        }
      }
    } else {
      if (row.isLoggedIn) {
        this.notificator.sayError(
          this.translate.instant('OPERATORS.OPERATOR_CAN_BE_REMOVED_AFTER_SESSION_ENDS')
        );
        return;
      }
    }
    const data =
      row && row.id
        ? { operatorIds: [row.id] }
        : {
            operatorIds: this.idsOfSelectedItems,
          };
    return this.client.delete('operators', data);
  }
}
