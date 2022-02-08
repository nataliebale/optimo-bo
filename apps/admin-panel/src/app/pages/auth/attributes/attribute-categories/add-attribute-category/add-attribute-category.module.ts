import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddAttributeCategoryComponent } from './add-attribute-category.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { IconModule } from '@optimo/ui-icon';



@NgModule({
  declarations: [AddAttributeCategoryComponent],
  exports: [AddAttributeCategoryComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    IconModule
  ]
})
export class AddAttributeCategoryModule { }
