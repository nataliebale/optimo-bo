import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationsComponent } from './locations.component';
import { TableModule } from '@optimo/ui-table';
import { IconModule } from '@optimo/ui-icon';
import { MatDialogModule } from '@angular/material/dialog';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { Routes, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMaskModule } from 'ngx-mask';
import { AddLocationModalComponent } from './add-location-modal/add-location-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';


const routes: Routes = [
  {
    path: '',
    component: LocationsComponent,
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
    NgSelectModule,
    NgxMaskModule.forRoot(),
    TranslateModule.forChild(),
  ],
  declarations: [LocationsComponent, AddLocationModalComponent],
  entryComponents: [AddLocationModalComponent],
})
export class LocationsModule {}
