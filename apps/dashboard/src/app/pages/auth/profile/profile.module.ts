import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { RsParametersComponent } from './rs-parameters/rs-parameters.component';
import { RouterModule, Routes } from '@angular/router';
import { IconModule } from '@optimo/ui-icon';
import { ProfilePersonalInformationComponent } from './personal-information/profile-personal-information.component';
import { ProfileEditBoxComponent } from './edit-box/profile-edit-box.component';
import { ProfileChangePasswordComponent } from './change-password/profile-change-password.component';
import { VerifyPhoneComponent } from './verify-phone/verify-phone.component';
import { NgxMaskModule } from 'ngx-mask';
import { PasswordEditBoxModule } from '@optimo/ui-password-edit-box';
import { FormFieldEditViewComponent } from './form-field-edit-view/form-field-edit-view.component';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  { path: '', redirectTo: 'personal-information' },
  {
    path: '',
    component: ProfileComponent,
    children: [
      {
        path: 'personal-information',
        component: ProfilePersonalInformationComponent,
      },
      {
        path: 'rs-parameters',
        component: RsParametersComponent,
      },
      {
        path: 'change-password',
        component: ProfileChangePasswordComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    ProfileComponent,
    ProfilePersonalInformationComponent,
    ProfileChangePasswordComponent,
    ProfileEditBoxComponent,
    RsParametersComponent,
    VerifyPhoneComponent,
    FormFieldEditViewComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    IconModule,
    NgxMaskModule.forRoot(),
    PasswordEditBoxModule,
    ClickOutsideModule,
    TranslateModule.forChild(),
  ],
  entryComponents: [VerifyPhoneComponent],
})
export class ProfileModule {}
