import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { ClientService, Service } from '@optimo/core';
import { NotificationsService } from '../../core/services/notifications/notifications.service';
import { PasswordStrengthService } from '../../core/services/password-strength/password-strength.service';
import { CustomValidators } from 'apps/dashboard/src/app/core/helpers/validators/validators.helper';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit {
  companyTypes = [
    { value: 0, label: 'ინდივიდუალური მეწარმე' },
    { value: 1, label: 'ნებისმიერი სხვა' },
  ];
  activeCompanyType: number;
  registerForm: FormGroup;
  idString: string;
  idMaxLength = 11;
  idMinLength = 11;
  passwordStrength = '';

  constructor(
    private passwordStrengthService: PasswordStrengthService,
    private notificator: NotificationsService,
    private formBuilder: FormBuilder,
    private client: ClientService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required, CustomValidators.OnlyLetters]],
        lastName: ['', [Validators.required, CustomValidators.OnlyLetters]],
        companyType: ['', [Validators.required]],
        companyName: ['', [Validators.required]],
        businessType: ['', [Validators.required]],
        userName: ['', [Validators.required, CustomValidators.EmailOrPhone]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        repeatPassword: ['', [Validators.required, Validators.minLength(8)]],
        identificationNumber: [
          '',
          [Validators.required, CustomValidators.OnlyNumbers],
        ],
        terms: [false, [Validators.required]],
      },
      {
        validator: CustomValidators.MustMatch('password', 'repeatPassword'),
      }
    );
  }

  onCompanyTypeChange(type): void {
    this.activeCompanyType = type.value;

    this.registerForm.controls.identificationNumber.setValue('');
    if (this.isIndividualEntrepreneurActive) {
      this.idString = 'პირადი ნომერი';
      this.idMaxLength = 11;
      this.idMinLength = 11;
      this.onNameChange();
    } else {
      this.idString = 'საიდენტიფიკაციო ნომერი';
      this.idMaxLength = 9;
      this.idMinLength = 9;
      this.registerForm.controls.companyName.setValue('');
    }
  }

  async onSubmit() {
    if (!this.registerForm.valid) {
      return;
    }

    const requestBody = this.registerForm.getRawValue();
    requestBody.businessType = [requestBody.businessType];
    const userName = this.registerForm.controls.userName.value;

    try {
      await this.client
        .post('User/SignUp', requestBody, { service: Service.Auth })
        .toPromise();
      this.notificator.saySuccess('Register Successed');
      this.redirectToNeededPath(userName);
    } catch {}
  }

  private redirectToNeededPath(userName: string): void {
    if (userName.indexOf('@') > -1) {
      this.router.navigate([`/verify/email/${userName}`]);
    } else {
      this.router.navigate([`/verify/number/${userName}`]);
    }
  }

  onPasswordChange(password: string): void {
    this.passwordStrength = this.passwordStrengthService.checkPassStrength(
      password
    );
    this.cdr.markForCheck();
  }

  onNameChange(): void {
    if (this.isIndividualEntrepreneurActive) {
      this.setCompanyNameToIndividualEntrepreneur();
    }
  }

  private get isIndividualEntrepreneurActive() {
    return this.activeCompanyType === 0;
  }

  private setCompanyNameToIndividualEntrepreneur(): void {
    const firstName = this.registerForm.controls.firstName.value;
    const lastName = this.registerForm.controls.lastName.value;
    this.registerForm.controls.companyName.setValue(
      `ი/მ ${firstName} ${lastName}`
    );
  }
}
