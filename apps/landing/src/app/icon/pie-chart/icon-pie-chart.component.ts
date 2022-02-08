import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

export interface IconPieChartData {
  primaryColor?: string;
  secondaryColor?: string;
  rotate?: number;
}

@Component({
  selector: 'app-icon-pie-cart',
  templateUrl: './icon-pie-chart.component.svg',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPieChartComponent {
  // @ViewChild('firstAnimate', { static: true })
  // firstAnimate: ElementRef;
  // @ViewChild('secondAnimate', { static: true })
  // secondAnimate: ElementRef;
  private _data: IconPieChartData;
  @Input()
  set data(value: IconPieChartData) {
    this._data = {
      primaryColor: '#4562FF',
      secondaryColor: '#27D3A2',
      rotate: 0,
      ...value,
    };
  }
  get data(): IconPieChartData {
    return this._data;
  }
  // private unsubscribe$ = new Subject<void>();
  constructor(
    // @Inject(DOCUMENT) private document: any,
    // private el: ElementRef,
    private sanitizer: DomSanitizer
  ) {}
  // ngOnInit(): void {
  //   fromEvent(this.document, 'scroll', {
  //     passive: true
  //   })
  //     .pipe(
  //       map(() => this.isInViewport),
  //       filter(start => start),
  //       first(),
  //       takeUntil(this.unsubscribe$)
  //     )
  //     .subscribe(() => {
  //       this.firstAnimate.nativeElement.onend = () => {
  //         this.secondAnimate.nativeElement.beginElement();
  //       };
  //       this.firstAnimate.nativeElement.beginElement();
  //     });
  // }
  get transform(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(
      `rotate(${this.data.rotate}deg) scale(1, -1)`
    );
  }
  // private get isInViewport(): boolean {
  //   const bounding = this.el.nativeElement.getBoundingClientRect();
  //   return (
  //     bounding.top >= 0 &&
  //     bounding.left >= 0 &&
  //     bounding.bottom <=
  //       (window.innerHeight || document.documentElement.clientHeight) &&
  //     bounding.right <=
  //       (window.innerWidth || document.documentElement.clientWidth)
  //   );
  // }
  // ngOnDestroy(): void {
  // this.unsubscribe$.next();
  // this.unsubscribe$.complete();
  // }
}
