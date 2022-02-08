import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Inject,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { UserDetails } from 'apps/dashboard/src/app/pages/auth/profile/personal-information/profile-personal-information.component';

@Component({
  selector: 'app-headbar-menu',
  templateUrl: './headbar-menu.component.html',
  styleUrls: ['./headbar-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeadbarMenuComponent {
  @Input()
  userDetails: UserDetails;

  @Output()
  logout = new EventEmitter();

  isMenuVisible: boolean;

  constructor(
    @Inject(DOCUMENT) protected document: any,
    private cdr: ChangeDetectorRef
  ) {}

  get avatarText() {
    let avatarName = '';
    const brandName = this?.userDetails?.brandName
      ?.trim()
      .replace(/[-_.]/g, '');
    if (brandName?.indexOf(' ') > 0) {
      avatarName = brandName
        .split(' ')
        .reduce((previousValue, currentValue) => {
          if (previousValue.length >= 2) return previousValue;
          else if (currentValue === '') return previousValue;
          else return previousValue + currentValue.substring(0, 1);
        }, '');
    } else {
      avatarName = brandName ? brandName.substring(0, 2) : '';
    }
    return avatarName;
  }

  onToggleMenu(e?: Event) {
    this.isMenuVisible = !this.isMenuVisible;
    this.cdr.markForCheck();
    if (e) {
      e.stopPropagation();
      if (this.isMenuVisible) {
        this.document.getElementsByTagName('html')[0].click();
      }
    }
  }
}
