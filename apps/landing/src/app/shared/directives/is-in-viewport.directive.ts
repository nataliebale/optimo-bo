import {
  Directive,
  ElementRef,
  Output,
  Inject,
  OnInit,
  OnDestroy,
  EventEmitter,
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { map, filter, first, takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[isInViewport]',
})
export class IsInViewportDirective implements OnInit, OnDestroy {
  @Output()
  isInViewport = new EventEmitter<ElementRef>();

  private unsubscribe$ = new Subject<void>();

  constructor(
    @Inject(DOCUMENT) private document: any,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    fromEvent(this.document, 'scroll', {
      passive: true,
    })
      .pipe(
        map(() => this.inViewport),
        filter((start) => start),
        first(),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.isInViewport.emit(this.el);
      });
  }

  private get inViewport(): boolean {
    const bounding = this.el.nativeElement.getBoundingClientRect();
    return (
      bounding.top >= 0 &&
      bounding.left >= 0 &&
      bounding.bottom - bounding.height <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      bounding.right <=
        (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
