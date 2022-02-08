import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ResetPasswordRoutingModule } from './reset-password-routing.module';

import { ResetPasswordComponent } from './reset-password.component';
import { ResetWithPhoneComponent } from './reset-with-phone/reset-with-phone.component';
import { ResetWithEmailComponent } from './reset-with-email/reset-with-email.component';
import { NewPasswordComponent } from './new-password/new-password.component';
import { VerifyNumberModule } from '../verify/verify-number/verify-number.module';
import { VerifyEmailModule } from '../verify/verify-email/verify-email.module';
import { IconModule } from '@optimo/ui-icon';
import { PasswordEditBoxModule } from '@optimo/ui-password-edit-box';
import { NgSelectModule } from '@ng-select/ng-select';

const COMPONENTS = [
  ResetPasswordComponent,
  ResetWithPhoneComponent,
  ResetWithEmailComponent,
  NewPasswordComponent,
];

@NgModule({
  declarations: COMPONENTS,
  imports: [
    CommonModule,
    ResetPasswordRoutingModule,
    VerifyNumberModule,
    VerifyEmailModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    IconModule,
    PasswordEditBoxModule,
    NgSelectModule,
  ],
})
export class ResetPasswordModule {}
