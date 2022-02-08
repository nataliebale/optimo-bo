import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
} from '@angular/core';
import { Subject } from 'rxjs';
import { ClientService, Service } from '@optimo/core';
import { HttpParams } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-categories-report-card',
  templateUrl: './categories-report-card.component.html',
  styleUrls: ['./categories-report-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesReportCardComponent implements OnDestroy {
  private _category: any;

  imgSrc = 'assets/images/no-image.png';

  @Input()
  set category(value: any) {
    this._category = value;
    this.imgSrc =
      (this.category && this.category.photoUrl) || 'assets/images/no-image.png';
    this.getCardData();
  }

  get category(): any {
    return this._category;
  }

  // private _dateRange: Date[];

  // @Input()
  // set dateRange(value: Date[]) {
  //   this._dateRange = value;
  //   this.getCardData();
  // }

  // get dateRange(): Date[] {
  //   return this._dateRange;
  // }

  categorysummary: any;
  private unsubscribe$ = new Subject<void>();

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  private getCardData(): void {
    this.clearData();
    if (!this.category) {
      return;
    }
    this.unsubscribe$.next();

    this.client
      .get('warehouse/categorysummary', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            stockItemCategoryId: this.category.id,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.categorysummary = res;
        this.cdr.markForCheck();
      });
  }

  private clearData(): void {
    this.categorysummary = null;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
