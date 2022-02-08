import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { getUMOAcronym } from 'apps/dashboard/src/app/core/enums/measurement-units.enum';
import { ClientService } from '@optimo/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
@Component({
  selector: 'app-lots-history-card',
  templateUrl: './lots-history-card.component.html',
  styleUrls: ['./lots-history-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LotsHistoryCardComponent implements OnDestroy {
  public textIsTruncated = textIsTruncated;
  getUMOAcronym = getUMOAcronym;

  private _stockItemId: number;

  @Input()
  set stockItemId(value: any) {
    this.stockItem = null;
    this._stockItemId = value;
    if (value) {
      this.getStockItem();
    }
  }

  get stockItemId(): any {
    return this._stockItemId;
  }

  stockItem: any;

  imgSrc = 'assets/images/no-image.png';

  private unsubscribe$ = new Subject<void>();

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  private getStockItem(): void {
    this.client
      .get<any>(`stockitems/${this.stockItemId}`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((stockItem) => {
        this.stockItem = stockItem;
        this.imgSrc =
          (stockItem && stockItem.photoUrl) || 'assets/images/no-image.png';
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
