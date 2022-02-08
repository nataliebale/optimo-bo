import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ClientService, Service } from '@optimo/core';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailComponent implements OnInit {
  email: string;

  constructor(
    private client: ClientService,
    private notificator: NotificationsService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Takes email from route
    this.email = this.activatedRoute.snapshot.params.email;
  }

  async onResend() {
    try {
      const requestBody = {
        userName: this.email,
      };

      await this.client
        .post('User/ResendActivation', requestBody, { service: Service.Auth })
        .toPromise();
      this.notificator.saySuccess('კოდი გაიგზავნა ელ. ფოსტაზე');
    } catch {}
  }
}
