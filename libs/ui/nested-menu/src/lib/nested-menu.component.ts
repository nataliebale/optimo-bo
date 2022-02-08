import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { ClientService, Service } from '@optimo/core';
import { Providers } from 'apps/dashboard/src/app/core/enums/providers.enum';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MenuItem } from './nested-menu.module';

@Component({
  selector: 'app-nested-menu',
  templateUrl: './nested-menu.component.html',
  styleUrls: ['./nested-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NestedMenuComponent implements OnInit {
  @Input()
  menu: Array<MenuItem>;
  private unsubscribe$ = new Subject<void>();

  @Input()
  userDetails: any;

  @Input()
  hasGlovoIntegration: any;
  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log(33333333333,this.hasGlovoIntegration);
    // this.getUserDetails();
  }

  // private getUserDetails(): void {
  //   this.client
  //     .get<any>('user/getuserdetails', { service: Service.Auth })
  //     .pipe(takeUntil(this.unsubscribe$))
  //     .subscribe((userDetails) => {
  //       if(userDetails && userDetails.integrationData){
  //         userDetails.integrationData.map((item) => {
  //           if (item && item.provider && item.provider === Providers.Glovo) {
  //             this.glovoIntegration = item;
  //             this.cdr.markForCheck();
  //           }
  //         });
  //       }
  //     });
  // }
}
