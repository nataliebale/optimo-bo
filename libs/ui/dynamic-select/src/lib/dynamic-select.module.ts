import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DynamicSelectComponent,
  DynamicSelectFooterTemplateDirective,
  DynamicSelectOptionTemplateDirective
} from './dynamic-select.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  imports: [CommonModule, FormsModule, NgSelectModule],
  declarations: [
    DynamicSelectComponent,
    DynamicSelectFooterTemplateDirective,
    DynamicSelectOptionTemplateDirective
  ],
  exports: [
    DynamicSelectComponent,
    DynamicSelectFooterTemplateDirective,
    DynamicSelectOptionTemplateDirective
  ]
})
export class DynamicSelectModule {}
