import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from './chart.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { ChartExportComponent } from './export/chart-export.component';

@NgModule({
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    FormsModule,
    DynamicSelectModule,
  ],
  declarations: [ChartComponent, ChartExportComponent],
  exports: [ChartComponent, ChartExportComponent],
})
export class ChartModule {}
