import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceivedWaybillEditComponent } from './received-waybill-edit.component';
import { RouterModule, Routes } from '@angular/router';
import { TableModule } from '@optimo/ui-table';
import { MatDialogModule } from '@angular/material/dialog';
import { IconModule } from '@optimo/ui-icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { NgxMaskModule } from 'ngx-mask';
import { ReceivedWaybillEditSaveDialogComponent } from './save-dialog/received-waybill-edit-save-dialog.component';
import { ReceivedWaybillEditNewOrderComponent } from './new-order/received-waybill-edit-new-order.component';
import { ReceivedWaybillEditExistingOrderComponent } from './existing-order/received-waybill-edit-existing-order.component';
import { BottomSheetDispacherModule } from '@optimo/ui-bottom-sheet-dispacher';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: ReceivedWaybillEditComponent,
  },
];

const ENTRY_COMPONENTS = [
  ReceivedWaybillEditSaveDialogComponent,
  ReceivedWaybillEditNewOrderComponent,
  ReceivedWaybillEditExistingOrderComponent,
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    MatDialogModule,
    IconModule,
    MatTooltipModule,
    DynamicSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    DatePickerModule,

    NgxMaskModule.forRoot(),
    BottomSheetDispacherModule.forRoot(ReceivedWaybillEditComponent),
    TranslateModule.forChild(),
  ],
  declarations: [ReceivedWaybillEditComponent, ...ENTRY_COMPONENTS],
  entryComponents: ENTRY_COMPONENTS,
})
export class ReceivedWaybillEditModule {}
