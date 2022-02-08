import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResetPasswordComponent } from './reset-password.component';
import { ResetWithPhoneComponent } from './reset-with-phone/reset-with-phone.component';
import { ResetWithEmailComponent } from './reset-with-email/reset-with-email.component';
import { NewPasswordComponent } from './new-password/new-password.component';

const routes: Routes = [
  {
    path: '',
    component: ResetPasswordComponent
  },
  {
    path: 'withmail/:email',
    component: ResetWithEmailComponent
  },
  {
    path: 'withphone/:number',
    component: ResetWithPhoneComponent
  },
  {
    path: 'withphone/:number/verified',
    component: NewPasswordComponent
  },
  {
    path: 'new-password/:token',
    component: NewPasswordComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResetPasswordRoutingModule { }
