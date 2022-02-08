import { ViewRegistrationRequestComponent } from './view/view-registration-request.component';
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
import { keyBy, mapValues } from 'lodash-es';

interface ITableState {
  pageIndex: number;
  pageSize: number;
  sortField: string;
  sortOrder: string;
  length?: number;
  previousPageIndex?: number;
}

@Component({
  selector: 'app-registration-requests',
  templateUrl: './registration-requests.component.html',
  styleUrls: ['./registration-requests.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationRequestsComponent implements OnInit, OnDestroy {
  protected unsubscribe$ = new Subject<void>();
  protected requestItems = new Subject<void>();

  isLoading: boolean;
  selectedRows: any[];
  curTableState: Partial<ITableState> = {};

  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'companyName',
      columnType: ColumnType.Text,
      caption: 'კომპანიის დასახელება',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
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
      dataField: 'businessTypes',
      columnType: ColumnType.Dropdown,
      caption: 'ბიზნეს ტიპი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
      data: {}
    },
    {
      dataField: 'phoneNumberOrEmail',
      columnType: ColumnType.Text,
      caption: 'კონტაქტი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'isUsingManagementSoftware',
      columnType: ColumnType.Dropdown,
      caption: 'Has Soft',
      filterable: true,
      sortable: true,
      widthCoefficient: 0.5,
      data: {
        false: 'false',
        true: 'true',
      },
    },
    {
      dataField: 'registrationRequestStatus',
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
      dataField: 'requestDate',
      columnType: ColumnType.Date,
      caption: 'თარიღი',
      filterable: true,
      sortable: true,
      widthCoefficient: 0.8,
    },
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
  ) {}

  ngOnInit(): void {
    this.title.setTitle('რეგისტრაციის მოთხოვნები');

    this.fetchBusinessTypes();
  }

  private fetchBusinessTypes() {
    const params = new HttpParams({fromObject: {
      pageIndex: '0',
      pageSize: '1000',
      sortField: 'id',
      sortOrder: 'ASC',
    }})
    this.client.get('businesstypes', {params})
      .pipe(
        takeUntil(this.unsubscribe$),
      )
      .subscribe(({data}) => {
        // console.log('dev => fetchBusinessTypes, res', data);
        if (data) this.setBusinessTypeOptions(data);
        else console.error('business types fetch failed');
      })
  }

  private setBusinessTypeOptions(options: any[]): void {
    const optionsObj = mapValues(keyBy(options, 'id'), 'name');
    this.displayedColumns.find(col => col.dataField === 'businessTypes').data = optionsObj;
  }

  onSelectionChanged(selectionData: SelectionData): void {
    this.selectedRows = selectionData.selected;
    this.isAllSelected = selectionData.isAllSelected;
  }

  openRemovalDialog(rows?: any): void {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '400px',
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

  onSubmitClick() {
    this.router.navigate(['/legal-entities/create', this.selectedRows[0].id]);
  }

  onRowClick(stockItemId: string): void {
    console.log(stockItemId);
    this.openView(stockItemId);
  }

  protected openView(id: string): void {
    if (this.openedView) {
      this.openedView.close();
    }
    try {
      this.openedView = this.dialog.open(ViewRegistrationRequestComponent, {
        width: '768px',
        data: id,
      });
      this.openedView
        .afterClosed()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((r) => {
          if (r) {
            this.fetchItems(this.curTableState);
          }
          this.router.navigate([], {
            queryParamsHandling: 'merge',
            queryParams: null,
            replaceUrl: true,
          });
        });
    } catch {
      this.router.navigate([], {
        queryParamsHandling: 'merge',
        queryParams: null,
        replaceUrl: true,
      });
    }
  }

  protected deleteAndRefreshItems(rows?: any): void {
    const requestBody = {
      ids: rows
        .filter((singleItem) => singleItem)
        .map((singleItem) => singleItem.id),
    };

    this.client
      .delete(`registrationrequests`, requestBody)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        console.log('ჩანაწერი წარმატებით წაიშალა');
        this.fetchItems(this.curTableState as ITableState);
      });
  }

  onTableStateChanged(newTableState: ITableState): void {
    this.curTableState = {
      ...this.curTableState,
      ...newTableState,
    };
    this.fetchItems(this.curTableState);
  }

  private fetchItems(tableState: any): void {
    console.log('fetch with state', tableState);
    const params = new HttpParams({
      fromObject: {
        SortField: this.getSortField(tableState.sortField),
        SortOrder: tableState.sortOrder,
        PageIndex: tableState.pageIndex.toString(),
        PageSize: tableState.pageSize.toString(),

        ...(tableState.name && { FirstNameOrLastName: tableState.name }),
        ...(tableState.companyName && {
          CompanyName: tableState.companyName,
        }),
        ...(tableState.companyType && { CompanyType: tableState.companyType }),
        ...(tableState.businessTypes && {
          BusinessType: tableState.businessTypes,
        }),
        ...(tableState.phoneNumberOrEmail && {
          PhoneNumberOrEmail: tableState.phoneNumberOrEmail,
        }),
        ...(tableState.isUsingManagementSoftware && {
          IsUsingManagementSoftware: tableState.isUsingManagementSoftware,
        }),
        ...(tableState.registrationRequestStatus && {
          RegistrationRequestStatus: tableState.registrationRequestStatus,
        }),
        ...(tableState.requestDateFrom && {
          RequestDateFrom: tableState.requestDateFrom,
        }),
        ...(tableState.requestDateTo && {
          RequestDateTo: tableState.requestDateTo,
        }),
      },
    });

    this.client
      .get<IChunkedResponse<any>>('registrationrequests', { params })
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

  private getSortField(sortField) {
    switch (sortField) {
      case 'name':
        return 'firstName';
      case 'phoneNumberOrEmail':
        return 'email';
      default:
        return sortField;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.requestItems.complete();
  }
}
