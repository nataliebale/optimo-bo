import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Input,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationStart, Router } from '@angular/router';
import { filter, takeUntil, takeWhile } from 'rxjs/operators';
import { Subject, fromEvent } from 'rxjs';
import { MENU_TREE } from './nested-menu.mock';
import { Title } from '@angular/platform-browser';
import { StorageService } from '@optimo/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  private _active: boolean;
  private _fold: boolean;
  private _foldMedium: boolean;

  set active(value: boolean) {
    this._active = value;
    const classNameStatus = value ? 'add' : 'remove';
    this.document.body.classList[classNameStatus]('modal-open');
    this.document.body.classList.remove('sidebar-fold-medium');
  }

  get active(): boolean {
    return this._active;
  }

  set fold(value: boolean) {
    this._fold = value;
    const classNameStatus = value ? 'add' : 'remove';
    this.document.body.classList[classNameStatus]('sidebar-fold');
    this.document.body.classList.remove('sidebar-fold-medium','modal-open');
  }

  get fold(): boolean {
    return this._fold;
  }

  set foldMedium(value: boolean) {
    this._foldMedium = value;
    const classNameStatus = value ? 'add' : 'remove';
    this.document.body.classList[classNameStatus]('sidebar-fold-medium');
    this.document.body.classList.remove('sidebar-fold','modal-open');
  }

  get foldMedium(): boolean {
    return this._foldMedium;
  }
  MENU_TREE = MENU_TREE;

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) protected document: Document,
    private router: Router,
    private _storageService: StorageService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((res) => res instanceof NavigationStart),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.active = false;
        this.cdr.markForCheck();
      });

    fromEvent(this.document.body, 'touchmove')
      .pipe(
        takeWhile(() => this.active),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((e: any) => {
        console.log('TCL: SidebarComponent -> e', e);
        e.preventDefault();
      });
  }

  onToggleActive() {
    this.active = !this.active;
    this.cdr.markForCheck();
  }

  onToggleFold() {
    this.fold = !this.fold;
    this.cdr.markForCheck()
  }

  onToggleFoldMedium() {
    this.foldMedium = !this.foldMedium;
    this.cdr.markForCheck()
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
