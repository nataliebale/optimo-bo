import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
  OnInit,
  ChangeDetectorRef,
  HostListener,
  Inject
} from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { UserDetails } from '../../../pages/auth/profile/personal-information/profile-personal-information.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageTitleService } from '@optimo/core';
import { DOCUMENT } from '@angular/common';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';

@Component({
  selector: 'app-headbar',
  templateUrl: './headbar.component.html',
  styleUrls: ['./headbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HeadbarComponent implements OnInit {
  unsubscribe$ = new Subject<void>();
  
  title = 'abcd';

  scrolledToTop = true;

  statisticPages: string[]= ['/statistics/general', '/statistics/products', '/statistics/categories'];
  
  constructor(
    private titleService: PageTitleService,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    public notificator: NotificationsService,
  ) {}
  
  @Input()
  sidebarComponent: SidebarComponent;

  @Input()
  userDetails: UserDetails;

  @Output()
  logout = new EventEmitter();

  ngOnInit() {
    this.titleService.titleObserver
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        (title) => {
          this.title = title;
          this.cdr.markForCheck();
        },
        (error) => {
          console.log('error in set page title in header', error);
        }
      )
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
	  if(this.statisticPages.includes(window.location.pathname)){
		this.scrolledToTop = true;
	  } else {
		this.scrolledToTop = document.documentElement.scrollTop === 0;
	  }
  }
}
