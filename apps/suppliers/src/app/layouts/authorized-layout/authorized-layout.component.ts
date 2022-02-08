import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ClientService, Service, StorageService } from '@optimo/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-authorized-layout',
  templateUrl: './authorized-layout.component.html',
  styleUrls: ['./authorized-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorizedLayoutComponent implements OnInit, OnDestroy {
  pageLoading: boolean;
  userDetails: any;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private storage: StorageService,
    private dialog: MatDialog,
    private bottomSeet: MatBottomSheet,
    private router: Router,
    private client: ClientService
  ) {}

  ngOnInit(): void {}

  onLogout(navigateToLogin: boolean = true): void {
    this.dialog.closeAll();
    this.bottomSeet.dismiss();
    this.client.get('user/SignOut', { service: Service.Auth }).subscribe();
    this.storage.deleteAccessToken();
    if (navigateToLogin) {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
