import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrintBarcodeComponent } from './print-barcode.component';
import { RouterModule, Routes } from '@angular/router';
import { NgxBarcode6Module } from 'ngx-barcode6';

const routes: Routes = [
  {
    path: '',
    component: PrintBarcodeComponent,
  },
];

export interface PrintBarocdeData {
  name: string;
  barcode: string;
  unitPrice: string;
}

@NgModule({
  declarations: [PrintBarcodeComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxBarcode6Module
  ],
})
export class PrintBarcodeModule { }
