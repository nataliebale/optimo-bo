import {
  Component,
  ChangeDetectionStrategy,
  Inject,
  OnDestroy,
  Type,
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router, ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetDispacherComponent implements OnDestroy {
  private unsubscribe$ = new Subject<void>();
  constructor(
    public dialog: MatBottomSheet,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: any,
    @Inject('DISPATCHED_COMPONENT') private dispatchedComponent: Type<any>
  ) {
    this.openDialog();
  }

  private openDialog(): void {
    const params = this.route.snapshot.params;
    const className = 'modal-open';
    this.document.body.classList.add(className);
    this.dialog
      .open(this.dispatchedComponent, {
        panelClass: 'dialog-full-page',
        closeOnNavigation: true,
        disableClose: true,
        data: params,
      })
      .afterDismissed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((route: string) => {
        this.document.body.classList.remove(className);
        if (route) {
          this.router.navigateByUrl(route);
          // this.router.navigate([route]);
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
