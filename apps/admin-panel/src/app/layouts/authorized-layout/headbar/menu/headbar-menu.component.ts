import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-headbar-menu',
  templateUrl: './headbar-menu.component.html',
  styleUrls: ['./headbar-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeadbarMenuComponent {
  @Output()
  logout = new EventEmitter();

  isMenuVisible: boolean;

  constructor(
    @Inject(DOCUMENT) protected document: Document,
    private cdr: ChangeDetectorRef
  ) {}

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
