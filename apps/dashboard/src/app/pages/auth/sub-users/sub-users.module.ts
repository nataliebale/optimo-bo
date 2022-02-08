import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubUsersComponent } from './sub-users.component';
import { TableModule } from '@optimo/ui-table';
import { IconModule } from '@optimo/ui-icon';
import { MatDialogModule } from '@angular/material/dialog';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { Routes, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMaskModule } from 'ngx-mask';
import { AddSubUserModalComponent } from './add-sub-user-modal/add-sub-user-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
 

const routes: Routes = [
  {
    path: '',
    component: SubUsersComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatDialogModule,
    TableModule,
    IconModule,
    ReactiveFormsModule,
    ApproveDialogModule,
    MatTooltipModule,
    NgxMaskModule.forRoot(),
    DynamicSelectModule,
    NgSelectModule,
    TranslateModule.forChild(),
	 
  ],
  declarations: [SubUsersComponent, AddSubUserModalComponent],
  entryComponents: [AddSubUserModalComponent],
})
export class SubUsersModule {}
