import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationsComponent } from './applications.component';
import { Routes, RouterModule } from '@angular/router';
import { TableModule } from '@optimo/ui-table';
import { MatTooltipModule } from '@angular/material/tooltip';

const routes: Routes = [
  {
    path: '',
    component: ApplicationsComponent,
  },
];

@NgModule({
  declarations: [ApplicationsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    MatTooltipModule,
  ],
})
export class ApplicationsModule {}
