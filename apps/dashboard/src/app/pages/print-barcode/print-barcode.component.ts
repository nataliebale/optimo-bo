import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PrintBarocdeData } from './print-barcode.module';

@Component({
  selector: 'app-print-barcode',
  templateUrl: './print-barcode.component.html',
  styleUrls: ['./print-barcode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrintBarcodeComponent implements OnInit {

  data: PrintBarocdeData[];

  constructor(
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.data = JSON.parse(localStorage.getItem('print-data'));
    console.log('print-barcode => data from storage:', this.data);
    this.cdr.markForCheck();
    window.print();
  }

}
