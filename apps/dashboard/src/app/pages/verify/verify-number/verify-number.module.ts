import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VerifyNumberComponent } from './verify-number.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule, Routes } from '@angular/router';
import { IconModule } from '@optimo/ui-icon';
import { NgxMaskModule } from 'ngx-mask';

const routes: Routes = [
  {
    path: '',
    component: VerifyNumberComponent,
  },
];

@NgModule({
  declarations: [VerifyNumberComponent],
  exports: [VerifyNumberComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    IconModule,
    NgxMaskModule.forRoot(),
  ],
})
export class VerifyNumberModule {}
