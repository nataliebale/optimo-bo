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
import { UserDetails } from '../../../pages/auth/profile/personal-information/profile-personal-information.component';
import {
  IOptimoDashboardMenuItem,
  MENU_TREE as ORIGINAL_MENU_TREE,
} from './nested-menu.mock';
import { Title } from '@angular/platform-browser';
import {
  StorageService,
  filterNavsByProductType,
  filterNavsByRoles,
  RoleService,
} from '@optimo/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input()
  userDetails: UserDetails;
  
  @Input()
  hasGlovoIntegration: any;

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
    this.document.body.classList.remove('sidebar-fold-medium', 'modal-open');
  }

  get fold(): boolean {
    return this._fold;
  }

  set foldMedium(value: boolean) {
    this._foldMedium = value;
    const classNameStatus = value ? 'add' : 'remove';
    this.document.body.classList[classNameStatus]('sidebar-fold-medium');
    this.document.body.classList.remove('sidebar-fold', 'modal-open');
  }

  get foldMedium(): boolean {
    return this._foldMedium;
  }

  public MENU_TREE: IOptimoDashboardMenuItem[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) protected document: any,
    private router: Router,
    private _storageService: StorageService,
    private roleService: RoleService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.MENU_TREE = JSON.parse(JSON.stringify(ORIGINAL_MENU_TREE));
    this.MENU_TREE = filterNavsByProductType(
      this.MENU_TREE,
      this._storageService.currentProductType
    );
    this.MENU_TREE = filterNavsByRoles(
      this.MENU_TREE,
      this.roleService.getUserRole()
    );

    // translate menu items, add observable label if menu item describes translation id.
    this.MENU_TREE = this.MENU_TREE.map((menuItem) => ({
      ...menuItem,
      asyncLabel: menuItem.translateId
        ? this.translate.stream(menuItem.translateId)
        : undefined,
    }));

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
    this.cdr.markForCheck();
  }

  onToggleFoldMedium() {
    this.foldMedium = !this.foldMedium;
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
