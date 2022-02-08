import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ViewEncapsulation,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PrintBarocdeData } from './print-barcode.module';

@Component({
  selector: 'app-print-barcode',
  templateUrl: './print-barcode.component.html',
  styleUrls: ['./print-barcode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PrintBarcodeComponent implements OnInit, OnDestroy {
  @Input()
  print$: Observable<PrintBarocdeData>;

  data: PrintBarocdeData;

  private unsubscribe$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.print$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.data = data;
      this.cdr.detectChanges();
      window.print();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
