import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OffersComponent } from './offers.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { OfferDetailComponent } from './offer-detail/offer-detail.component';
import { IconModule } from '../icon/icon.module';
import { PushPipeModule } from '../shared/pipes/push.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';

const routes: Routes = [
  {
    path: '',
    component: OffersComponent,
  },
];

@NgModule({
  declarations: [OffersComponent, OfferDetailComponent],
  entryComponents: [OfferDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatDialogModule,
    IconModule,
    PushPipeModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
  ],
})
export class OffersModuleModule {}
