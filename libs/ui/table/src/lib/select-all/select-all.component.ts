import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import { TableComponent } from '../table.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-select-all',
  templateUrl: './select-all.component.html',
  styleUrls: ['./select-all.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectAllComponent implements OnInit, OnDestroy {
  @Input()
  table: TableComponent;

  private unsubscribe$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.table.selectionChanged
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
