import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ClientService, Service } from '@optimo/core';
import { StorageService } from '@optimo/core';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CustomValidators } from 'apps/dashboard/src/app/core/helpers/validators/validators.helper';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  form: FormGroup;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private fb: FormBuilder,
    private storage: StorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    const { userName, password } = this.storage.get('firstLogin', true);
    this.form = this.fb.group(
      {
        userName: [userName],
        currentPassword: [
          password,
          [Validators.required, Validators.minLength(8)],
        ],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        repeatNewPassword: ['', [Validators.required, Validators.minLength(8)]],
      },
      {
        validator: CustomValidators.MustMatch(
          'newPassword',
          'repeatNewPassword'
        ),
      }
    );
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }
    const data = this.form.getRawValue();
    this.client
      .post('User/ChangePassword', data, { service: Service.Auth })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ accessToken }) => {
        this.saveToken(accessToken);
        this.storage.remove('firstLogin', true);
        this.router.navigate(['/']);
      });
  }

  private saveToken(accessToken: string): void {
    this.storage.setAccessToken(accessToken);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
