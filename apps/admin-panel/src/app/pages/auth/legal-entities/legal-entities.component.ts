import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { IChunkedResponse } from '../../../models/response/IChunkedResponse';
import { Router } from '@angular/router';
import { Subject, EMPTY } from 'rxjs';
import { debounceTime, takeUntil, catchError } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { ColumnData, ColumnType, SelectionData } from '@optimo/ui-table';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { NotificationsService } from './../../../core/services/notifications/notifications.service';
import { mapValues, pickBy } from 'lodash-es';

interface ITableState {
  pageIndex: number;
  pageSize: number;
  sortField: string;
  sortOrder: string;
  length?: number;
  previousPageIndex?: number;
}

@Component({
  selector: 'app-legal-entities',
  templateUrl: './legal-entities.component.html',
  styleUrls: ['./legal-entities.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalEntitiesComponent implements OnInit, OnDestroy {
  protected unsubscribe$ = new Subject<void>();
  protected requestItems = new Subject<void>();

  isLoading: boolean;
  selectedRows: any[];
  curTableState: Partial<ITableState> = {};

  displayedColumns: ColumnData[] = [
    {
      dataField: 'LegalEntityIdOrName',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'fullNameOrId',
      columnType: ColumnType.Text,
      caption: 'საკონტაქტო პირი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'userEmailOrPhoneNumber',
      columnType: ColumnType.Text,
      caption: 'საკონტაქტო ინფორმაცია',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'packageType',
      columnType: ColumnType.Dropdown,
      caption: 'პაკეტის ტიპი',
      filterable: true,
      sortable: true,
      widthCoefficient: 0.8,
      data: {
        0: 'Basic',
        1: 'Standard',
        2: 'Premium',
      },
    },
    {
      dataField: 'status',
      columnType: ColumnType.Dropdown,
      caption: 'სტატუსი',
      filterable: true,
      sortable: true,
      widthCoefficient: 0.7,
      data: {
        0: 'Active',
        1: 'Suspended',
        99: 'Deleted',
      },
    },
    {
      dataField: 'companyType',
      columnType: ColumnType.Dropdown,
      caption: 'კომპანიის ტიპი',
      filterable: true,
      sortable: true,
      widthCoefficient: 0.8,
      data: {
        0: 'Individual',
        1: 'LTD',
        2: 'Other',
      },
    },
    {
      dataField: 'isForTesting',
      columnType: ColumnType.Dropdown,
      caption: 'სატესტო',
      filterable: true,
      sortable: true,
      widthCoefficient: 0.5,
      data: {
        false: 'false',
        true: 'true',
      },
    },
    {
      dataField: 'creationDate',
      columnType: ColumnType.Date,
      caption: 'თარიღი',
      filterable: true,
      sortable: true,
      widthCoefficient: 0.8,
    },
    // {
    //   dataField: 'view',
    //   columnType: ColumnType.Text,
    //   caption: 'view as',
    //   filterable: false,
    //   sortable: false,
    //   widthCoefficient: 1.3,
    // },
    // {
    //   dataField: 'extra',
    //   columnType: ColumnType.Text,
    //   caption: '',
    //   filterable: false,
    //   sortable: false,
    //   widthCoefficient: 0.5,
    // },
  ];

  datasource: any[] = [];
  totalCount = 0;
  isAllSelected: boolean;
  private openedView: MatDialogRef<any, any>;

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private title: Title,
    private dialog: MatDialog,
    private notifier: NotificationsService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('კომპანიები');
  }

  onSelectionChanged(selectionData: SelectionData): void {
    this.selectedRows = selectionData.selected;
    this.isAllSelected = selectionData.isAllSelected;
  }

  goViewAs(user: any): void {
    console.log(
      '🚀 ~ file: legal-entities.component.ts ~ line 170 ~ LegalEntitiesComponent ~ goViewAs ~ user',
      user
    );

    this.client
      .get(`legalentities/viewas?id=${user.id}`)
      .pipe(
        catchError(() => {
          this.notifier.sayError('ლინკი ვერ დაგენერირდა');
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result: any) => {
        if (result && result.url) {
          window.open(result.url, '_blank');
          return;
        }
        // result.Cookies.Append(_authConfig.CookieName, token.RefreshToken, new CookieOptions
        //   {
        //       Domain = _authConfig.CookieDomain,
        //       HttpOnly = true,
        //       Expires = DateTimeOffset.Now.AddDays(7),
        //       SameSite = SameSiteMode.None
        //   });
        this.notifier.sayError('ლინკი ვერ დაგენერირდა');
      });
  }

  goToEdit(user: any): void {
    console.log('Go to edit ->', user);
    this.router.navigate(['/legal-entities/edit/', user.id]);
  }

  openRemovalDialog(rows?: any): void {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          title: `ნამდვილად გსურს წაშლა?`,
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.deleteAndRefreshItems(rows);
        }
      });
  }

  protected deleteAndRefreshItems(rows?: any): void {
    const requestBody = {
      ids: rows
        .filter((singleItem) => singleItem)
        .map((singleItem) => singleItem.id),
    };

    this.client
      .delete(`legalentities`, requestBody)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        console.log('ჩანაწერი წარმატებით წაიშალა');
        this.fetchItems(this.curTableState as ITableState);
      });
  }

  onEditSelected(): void {
    console.log('edit selected: ', this.selectedRows);
    if (this.selectedRows.length !== 1) {
      console.log('invalid selection for edit');
      return;
    }
    this.router.navigate(['legal-entities/edit/', this.selectedRows[0].id]);
  }

  onTableStateChanged(newTableState: ITableState): void {
    this.curTableState = {
      ...this.curTableState,
      ...newTableState,
    };
    this.fetchItems(this.curTableState);
  }

  private fetchItems(tableState: any): void {
    const params = new HttpParams({
      fromObject: {
        ...mapValues(pickBy(this.curTableState, value => value?.toString && value?.toString().trim() !== ''), val => val.toString()),
        sortField: this.getSortField(tableState.sortField),
      },
    });

    this.client
      .get<IChunkedResponse<any>>('legalentities', { params })
      .pipe(debounceTime(200), takeUntil(this.unsubscribe$))
      .subscribe(
        (data) => {
          this.datasource = data.data;
          this.totalCount = data.totalCount;
          this.cdr.markForCheck();
          console.log(data);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  private getSortField(sortField: string): string {
    const sortFieldTransformMap: Map<string, string> = new Map([
      ['legalEntityIdOrName', 'CompanyName'],
      ['fullNameOrId', 'ContactPersonFirstName'],
      ['emailOrPhoneNumber', 'ContactPersonEmail'],
    ])
    return sortFieldTransformMap.get(sortField) || sortField
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.requestItems.complete();
  }
}
