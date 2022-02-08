import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    OnInit
} from '@angular/core';
import { Observable } from 'rxjs';
import { ClientService, Service } from '@optimo/core';
import { ColumnType, ColumnData } from '@optimo/ui-table';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { BaseListComponent } from '../base-list.component';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { takeUntil, map } from 'rxjs/operators';
import { AddSubUserModalComponent } from './add-sub-user-modal/add-sub-user-modal.component';
import { pickBy } from 'lodash-es';
import { TranslateService } from '@ngx-translate/core';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { MixpanelService } from '@optimo/mixpanel';
@Component({
    selector: 'app-sub-users',
    templateUrl: './sub-users.component.html',
    styleUrls: ['./sub-users.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubUsersComponent extends BaseListComponent implements OnInit {
public textIsTruncated = textIsTruncated;
    displayedColumns: ColumnData[] = [
        {
            dataField: 'fullName',
            columnType: ColumnType.Text,
            caption: 'GENERAL.NAME',
            filterable: true,
            sortable: true,
        },
        {
            dataField: 'phoneNumber',
            columnType: ColumnType.Text,
            caption: 'GENERAL.INFORMATION',
            filterable: true,
            sortable: true,
        },
        {
            dataField: 'permission',
            columnType: ColumnType.Text,
            caption: 'GENERAL.BRANCHES',
            filterable: false,
            sortable: false,
        },
        {
            dataField: 'lastLoginDate',
            columnType: ColumnType.Date,
            caption: 'SUB_USERS.LAST_LOGIN_DATE',
            filterable: true,
            sortable: true,
            data: {
                type: 'dateTime',
            },
        },
    ];


    private locationsMap: {};


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
    this._mixpanelService.track('Sub Users');
    }


    ngOnInit() {

        super.ngOnInit();
        const params = new HttpParams({
            fromObject: {
                sortField: 'id',
                sortOrder: 'ASC',
            },
        });

        this.client.get('locations', { params }).pipe(
            map(locations => locations['data']),
            takeUntil(this.unsubscribe$)
        ).subscribe(locations => {
                const locationsMap = {};

                locations.forEach(element => {
                    locationsMap[ element['id'] ] = element['name'];
                });

                this.locationsMap = locationsMap;
            });
    }


    public getLocationItem( id: number ): string {
        return this.locationsMap[id] || '';
    }


    
    openAddNewModal(): void {
        this.dialog
            .open(AddSubUserModalComponent, {
                width: '548px',
                panelClass: 'overflow-visible'
            })
            .afterClosed()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((result) => {
                if (result) {
                    this.requestItems.next();
                }
            });
    }

    isRowDeletable(row): boolean {
        return row.canDelete;
    }


    onEdit(row?: any): void {
        const id =
            (row && row.userId) ||
            (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].userId);

        this.dialog
            .open(AddSubUserModalComponent, {
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


    onDelete(row: any): void {

    }


    protected get httpGetItems(): Observable<any> {
        return this.client.get('user/staff', {
            service: Service.Auth,
            params: this.requestBody,
        }).pipe(
            map((data: any) => {

              data.data.forEach((staff) => {
                const permissions = [];

                for (const [key, value] of Object.entries(staff.permission)) {
                    permissions.push( this.locationsMap[ value['locationId'] ] );
                }

                staff.permission = permissions.join(', ');
              });
              return data;
            })
          );
    }


    private get requestBody(): HttpParams {
        const { phoneNumber, ...state } = this.currentState;
    
        const data = pickBy(
          {
            phoneNumberOrEmail: phoneNumber,
            // dashboardPriority: dashboardPriority === 'null' ? -1 : dashboardPriority,
            ...state,
            // status: [
            //   this._ItemStatus.Disabled.toString(),
            //   this._ItemStatus.Enabled.toString(),
            // ],
            // withTypeFlag: StockItemType.Product.toString(),
          },
          (val) => val || val === 0
        );
    
        return new HttpParams({
          fromObject: data as any,
        });
      }

    protected requestDeleteItems(ids: any): Observable<any> {

        const data: { userIds } = {
            userIds: []
        }

        if (Array.isArray(ids)) {
            ids.forEach(userItem => {
                data.userIds.push(
                    userItem.userId
                )
            })
        }
        else {
            data.userIds.push(ids.userId)
        }

        return this.client.delete('user/staff', data, {
            service: Service.Auth
        });
    }
}
