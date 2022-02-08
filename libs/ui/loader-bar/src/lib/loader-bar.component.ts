import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Input,
} from '@angular/core';
import { of, Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterEvent,
} from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-loader-bar',
  templateUrl: './loader-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderBarComponent implements OnInit, OnDestroy {
  @Input()
  color: string;

  progress = 0;
  loading: boolean;
  private fastSpeed = 1;
  private slowSpeed = 3;

  speed = this.slowSpeed;
  private unsubscribe$ = new Subject<void>();

  constructor(
    // tslint:disable-next-line: ban-types
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: any,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((event: RouterEvent) => {
          if (event instanceof NavigationStart) {
            this.start();
          }
          if (event instanceof NavigationEnd) {
            window.scrollTo(0, 0);
            this.document.body.classList.remove('modal-open');
          }

          if (
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
          ) {
            this.stop();
          }
        });
    }
  }

  private start(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.progress = Math.random() * 20 + 60;
    this.cdr.detectChanges();
  }

  private stop(): void {
    this.speed = this.fastSpeed;
    this.progress = 100;
    this.cdr.detectChanges();

    of(null)
      .pipe(delay(this.speed * 1000), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.speed = this.slowSpeed;
        this.loading = false;
        this.progress = 0;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
