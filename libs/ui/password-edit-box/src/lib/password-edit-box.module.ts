import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '@optimo/ui-icon';
import { PasswordEditBoxComponent } from './password-edit-box.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, FormsModule, IconModule],
  declarations: [PasswordEditBoxComponent],
  exports: [PasswordEditBoxComponent],
})
export class PasswordEditBoxModule {}
