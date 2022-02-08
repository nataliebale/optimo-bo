import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { VerifyTokenComponent } from './verify-token.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: VerifyTokenComponent
  }
];

@NgModule({
  declarations: [VerifyTokenComponent],
  imports: [CommonModule, RouterModule.forChild(routes), MatButtonModule]
})
export class VerifyTokenModule {}
