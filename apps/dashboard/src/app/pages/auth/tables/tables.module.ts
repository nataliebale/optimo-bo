import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule, Routes } from '@angular/router';
import { IconModule } from '@optimo/ui-icon';
import { TablesComponent } from './tables.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AutofocusModule } from 'apps/dashboard/src/app/directives/auto-focus/auto-focus.module';
import { SpaceDetailsModule } from '../../../popups/space-details-dialog/space-details.module';
import { ResizableDraggableComponent } from './resizable-draggable/resizable-draggable.component';
import { TranslateModule } from '@ngx-translate/core';
const routes: Routes = [
  {
    path: '',
    component: TablesComponent,
  },
];

@NgModule({
  declarations: [TablesComponent, ResizableDraggableComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    IconModule,
    NgSelectModule,
    AutofocusModule,
    SpaceDetailsModule,
    TranslateModule.forChild(),
  ],
  entryComponents: [],
})
export class TablesModule {}
