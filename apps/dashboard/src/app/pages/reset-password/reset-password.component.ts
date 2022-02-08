import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { ClientService, Service } from '@optimo/core';
import { NotificationsService } from '../../core/services/notifications/notifications.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'apps/dashboard/src/app/core/helpers/validators/validators.helper';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;

  constructor(
    private client: ClientService,
    private notificator: NotificationsService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.resetForm = this.formBuilder.group({
      userName: ['', [Validators.required, CustomValidators.EmailOrPhone]],
    });
  }

  async onSubmit() {
    console.log('PasswordResetRequest -> identity -> Service.Auth');
    if (this.resetForm.invalid) {
      return;
    }

    try {
      const userName = this.resetForm.controls.userName.value;
      const requestBody = {
        userName,
      };

      await this.client
        .post('User/PasswordResetRequest', requestBody, {
          service: Service.Auth,
        })
        .toPromise();

      this.redirectToNeededPath(userName);
    } catch (err) {}
  }

  private redirectToNeededPath(userName): void {
    if (userName.indexOf('@') > -1) {
      this.notificator.saySuccess(
        'პაროლის აღდგენის ინსტრუქცია გამოგზავნილია ელ. ფოსტაზე'
      );
      // this.router.navigate([`/reset-password/withmail/${userName}`]);
    } else {
      // If he registered with phone redirects to phone validation
      this.router.navigate([`/reset-password/withphone/${userName}`]);
    }
  }
}
