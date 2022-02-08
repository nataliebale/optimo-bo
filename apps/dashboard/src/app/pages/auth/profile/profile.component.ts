import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  pages = [
    { path: 'personal-information', text: 'GENERAL.PROFILE' },
    { path: 'change-password', text: 'PROFILE.CHANGE_PASSWORD' },
    { path: 'rs-parameters', text: 'PROFILE.RS_PARAMETERS' }
  ];
}
