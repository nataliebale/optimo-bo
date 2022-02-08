import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClientService } from '@optimo/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IOffer } from '../IOffer';

@Component({
  selector: 'app-offer-detail',
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.sass'],
})
export class OfferDetailComponent implements OnInit {
  unsubscribe$ = new Subject<void>();

  form: FormGroup;

  _offer: IOffer;

  constructor(
    @Inject(MAT_DIALOG_DATA) public offer: IOffer,
    private dialogRef: MatDialogRef<OfferDetailComponent>,
    private formBuilder: FormBuilder,
    private client: ClientService
  ) {
    this.createForm();
    console.log(offer);
    this._offer = offer;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    console.log('submit application');
    this.client
      .post('offerapplications', {
        SenderName: this.form.get('nameSurname').value,
        SenderPhone: this.form.get('mobileNumber').value,
        offerId: this.offer.id,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        if (data) {
          this.dismissDialog();
        }
      });
  }

  dismissDialog(): void {
    console.log('close dialog');
    this.dialogRef.afterClosed().subscribe(() => {
      console.log('closed');
    });
    this.dialogRef.close(true);
  }

  updatePhoneValidity() {
    this.form.get('mobileNumber').updateValueAndValidity();
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      mobileNumber: ['', [Validators.required, Validators.minLength(9)]],
      nameSurname: ['', [Validators.required]],
    });
  }

  ngOnInit() {}
}
