import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges
} from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginatorComponent extends MatPaginator implements OnChanges {
  @Input()
  showNextPrevButtons: boolean;

  @Input()
  autohide = false;

  pagesArray: number[];

  constructor(_intl: MatPaginatorIntl, private cdr: ChangeDetectorRef) {
    super(_intl, cdr);
  }

  get showPaginator() {
    return !this.autohide || this.pagesArray?.length > 1;
  }

  ngOnChanges(): void {
    this.fillPagesArray();
  }

  private fillPagesArray() {
    this.pagesArray = Array.from(
      { length: this.getNumberOfPages() },
      (v, k) => k + 1
    );
    console.log(
      'PaginatorComponent -> ngOnChanges -> this.pagesArray',
      this.pagesArray
    );
  }

  goTo(index: number): void {
    if (this.pageIndex + 1 === index) {
      return;
    }
    const pageIndex = index - 1;
    this.page.emit({
      pageIndex,
      pageSize: this.pageSize,
      length: this.length,
      previousPageIndex: this.pageIndex
    });
    this.cdr.detectChanges();
  }

  changePageSize($event) {
    this._changePageSize($event);
    this.fillPagesArray();
  }

  // get rangeLabel(): string {
  //   if (this.length === 0 || this.pageSize === 0) {
  //     return '0 დან 0';
  //   }

  //   const startIndex = this.pageIndex * this.pageSize;

  //   const endIndex =
  //     startIndex < this.length
  //       ? Math.min(startIndex + this.pageSize, this.length)
  //       : startIndex + this.pageSize;

  //   return `${startIndex + 1}-${endIndex} ${this.length}-დან`;
  // }

  get shownPages(): Array<number> {
    return this.pagination(this.pageIndex + 1, this.getNumberOfPages());
  }

  private pagination(
    currentPage: number,
    numberOfPages: number
  ): Array<number> {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l: number;

    range.push(1);
    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i < numberOfPages && i > 1) {
        range.push(i);
      }
    }
    if (numberOfPages > 1) {
      range.push(numberOfPages);

      for (const i of range) {
        if (l) {
          if (i - l === 0) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push(-1);
          }
        }
        rangeWithDots.push(i);
        l = i;
      }

      return rangeWithDots;
    }
    return range;
  }
}
