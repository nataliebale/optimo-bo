import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangePasswordComponent } from './change-password.component';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { PasswordEditBoxModule } from '@optimo/ui-password-edit-box';
const routes: Routes = [
  {
    path: '',
    component: ChangePasswordComponent,
  },
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    PasswordEditBoxModule,
  ],
  declarations: [ChangePasswordComponent],
})
export class ChangePasswordModule {}
