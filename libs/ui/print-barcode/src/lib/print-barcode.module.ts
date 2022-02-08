import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrintBarcodeComponent } from './print-barcode.component';
import { NgxBarcode6Module } from 'ngx-barcode6';

export interface PrintBarocdeData {
  name: string;
  barcode: string;
  unitPrice: string;
}

@NgModule({
  imports: [CommonModule, NgxBarcode6Module],
  declarations: [PrintBarcodeComponent],
  exports: [PrintBarcodeComponent],
})
export class PrintBarcodeModule {}
