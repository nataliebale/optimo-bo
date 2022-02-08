import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { ClientService, Service } from '@optimo/core';

@Component({
  selector: 'app-verify-phone',
  templateUrl: './verify-phone.component.html',
  styleUrls: ['./verify-phone.component.scss'],
})
export class VerifyPhoneComponent implements OnInit {
  token: FormControl = new FormControl();

  constructor(
    private client: ClientService,
    public dialogRef: MatDialogRef<VerifyPhoneComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {}

  ngOnInit() {}

  async onSubmit() {
    try {
      await this.client
        .post(
          'User/ConfirmChangePhoneNumber',
          {
            token: this.token.value,
          },
          { service: Service.Auth }
        )
        .toPromise();

      this.dialogRef.close(true);
    } catch (e) {
      this.dialogRef.close(false);
    }
  }
}
