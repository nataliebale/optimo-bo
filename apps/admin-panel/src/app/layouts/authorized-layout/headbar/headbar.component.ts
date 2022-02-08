import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { PageTitleService } from '@optimo/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-headbar',
  templateUrl: './headbar.component.html',
  styleUrls: ['./headbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HeadbarComponent implements OnInit{
  unsubscribe$ = new Subject<void>();
  constructor(
    private titleService: PageTitleService,
    private cdr: ChangeDetectorRef,
  ) {}

  @Input()
  sidebarComponent: SidebarComponent;

  @Output()
  logout = new EventEmitter();

  title: string;

  onBurgerClick() {
    this.sidebarComponent.onToggleActive();
  }

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
}
