import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransactionHistoryRoutingModule } from './transaction-history-routing.module';
import { TransactionHistoryComponent } from './transaction-history.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { SaleOrderViewDialogComponent } from './sale-order-view-dialog/sale-order-view-dialog.component';
import { PurchaseOrderViewDialogComponent } from './purchase-order-view-dialog/purchase-order-view-dialog.component';
import { TableModule } from '@optimo/ui-table';

const MATERIAL_MODUELS = [
  MatDialogModule,
  MatTableModule,
  MatInputModule,
  MatPaginatorModule,
];

@NgModule({
  declarations: [
    TransactionHistoryComponent,
    SaleOrderViewDialogComponent,
    PurchaseOrderViewDialogComponent,
  ],
  imports: [
    CommonModule,
    TransactionHistoryRoutingModule,
    MATERIAL_MODUELS,
    TableModule,
  ],
  entryComponents: [
    PurchaseOrderViewDialogComponent,
    SaleOrderViewDialogComponent,
  ],
})
export class TransactionHistoryModule {}
