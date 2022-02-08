import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VerifyEmailComponent } from './verify-email.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: VerifyEmailComponent
  }
];

@NgModule({
  declarations: [VerifyEmailComponent],
  exports: [VerifyEmailComponent],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class VerifyEmailModule {}
