import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ColumnType, ColumnData } from '@optimo/ui-table';

import { NumberColumnType } from '@optimo/ui-table';

@Component({
  selector: 'app-categories-report-grids',
  templateUrl: './categories-report-grids.component.html',
  styleUrls: ['./categories-report-grids.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesReportGridsComponent {
  @Input()
  totalCount = 10;

  @Input()
  categoryId: number;

  @Input()
  dateRange: Date[];

  activeTab: 'income' | 'revenue' = 'revenue';

  topCategoriesByRevenueColumns: ColumnData[] = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
      filterable: false,
      sortable: false,
      widthCoefficient: 2,
    },
    {
      dataField: 'totalRevenue',
      columnType: ColumnType.Number,
      caption: 'შემოსავალი',
      data: { type: NumberColumnType.Float },
      filterable: false,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'share',
      columnType: ColumnType.Number,
      caption: 'წილი',
      data: { type: NumberColumnType.Percent },
      filterable: false,
      sortable: true,
      widthCoefficient: 1,
    },
  ];

  topCategoriesByIncomeColumns: ColumnData[] = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
      filterable: false,
      sortable: false,
      widthCoefficient: 2,
    },
    {
      dataField: 'totalIncome',
      columnType: ColumnType.Number,
      caption: 'მარჟა',
      data: { type: NumberColumnType.Float },
      filterable: false,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'share',
      columnType: ColumnType.Number,
      caption: 'წილი',
      data: { type: NumberColumnType.Percent },
      filterable: false,
      sortable: true,
      widthCoefficient: 1,
    },
  ];

  topSuppliersByDelayColumns: ColumnData[] = [
    {
      dataField: 'supplierName',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
      filterable: false,
      sortable: false,
      widthCoefficient: 2,
    },
    {
      dataField: 'delayRate',
      columnType: ColumnType.Number,
      caption: 'დაგვიანების სიხშირე',
      data: { type: NumberColumnType.Float },
      filterable: false,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'totalRevenue',
      columnType: ColumnType.Number,
      caption: 'შემოსავალი',
      data: { type: NumberColumnType.Float },
      filterable: false,
      sortable: true,
      widthCoefficient: 1,
    },
  ];

  toggleTab(tab: 'income' | 'revenue'): void {
    this.activeTab = tab;
  }
}
