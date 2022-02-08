import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YearSelectComponent } from './year-select.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  imports: [CommonModule, FormsModule, NgSelectModule],
  declarations: [YearSelectComponent],
  exports: [YearSelectComponent]
})
export class YearSelectModule {}
