import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { MenuItem } from '../nested-menu.module';
import { SidebarStateService, StorageService } from '@optimo/core';
import { INestedMenuItem } from '../interface/INestedMenuItem';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemComponent implements OnInit {
  @Input()
  item: INestedMenuItem;

  @Input()
  hasGlovoIntegration: any;

  @Input()
  level: number;

  @Input()
  userDetails: object;

  active = false;
  locationId: string;

  navigatedToChild = false;

  mouseOverItem = new Subject<boolean>();
  mouseIsOver = false;

  constructor(
    private sidebarStateService: SidebarStateService,
    private cdr: ChangeDetectorRef,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    this.locationId = this.getLocationId();
    if (this.item.children) {
      this.sidebarStateService.selectedMenuItem.subscribe(
        (menuItem: MenuItem) => {
          this.active = this.item?.children.find(
            (curItem) =>
              menuItem.text === menuItem.text && curItem.path === menuItem.path
          )
            ? true
            : false;
          this.navigatedToChild = this.active;
          this.cdr.markForCheck();
        }
      );
    }
    this.mouseOverItem.pipe(debounceTime(10)).subscribe((mouseIsOver) => {
      this.setHoveredState(mouseIsOver);
    });
  }

  isGlovoIntegration(item: any) {
    return (
      !item.checkGlovoIntegration ||
      (item.checkGlovoIntegration && this.hasGlovoIntegration)
    );
  }

  private setHoveredState(mouseIsOver: boolean): void {
    this.mouseIsOver = mouseIsOver;
    this.cdr.markForCheck();
  }

  private getLocationId(): string {
    if (this.storage.get('locationId') === null) {
      return '1';
    }
    return this.storage.get('locationId');
  }

  toggleSubNav() {
    this.active = !this.active;
  }
}
