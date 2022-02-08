import { MatTooltipModule } from '@angular/material/tooltip';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { OperatorsComponent } from './operators.component';
import { AddOperatorModalComponent } from './add-operator-modal/add-operator-modal.component';
import { FileUploaderModule } from '@optimo/ui-file-uploader';
import { TableModule } from '@optimo/ui-table';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { IconModule } from '@optimo/ui-icon';
import { Routes, RouterModule } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask';
import { NgSelectModule } from '@ng-select/ng-select';
import { OperatorTempPrivilegeModalComponent } from './temp-privilege-modal/operator-temp-privilege-modal.component';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: OperatorsComponent,
  },
];

const ENTRY_COMPONENTS = [
  AddOperatorModalComponent,
  OperatorTempPrivilegeModalComponent,
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FileUploaderModule,
    TableModule,
    ApproveDialogModule,
    IconModule,
    NgxMaskModule.forRoot(),
    NgSelectModule,
    MatTooltipModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    OperatorsComponent,
    AddOperatorModalComponent,
    ENTRY_COMPONENTS,
  ],
  entryComponents: ENTRY_COMPONENTS,
})
export class OperatorsModule {}
