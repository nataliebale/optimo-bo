import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClientService } from '@optimo/core';
import { of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { IOffer } from './IOffer';
import { OfferDetailComponent } from './offer-detail/offer-detail.component';

@Component({
  selector: 'app-offers-component',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
})
export class OffersComponent implements OnDestroy {
  private unsubscribe$ = new Subject<void>();
  offers: IOffer[] = [];

  constructor(private client: ClientService, private dialog: MatDialog) {
    this.client
      .get<IOffer[]>('offers', {
        params: new HttpParams({ fromObject: { skip: '0', take: '100' } }),
      })
      .pipe(
        catchError(() => of([])),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data) => {
        console.log(data);
        this.offers = data;
      });
  }

  onClickMore(offer: IOffer) {
    this.dialog.open(OfferDetailComponent, {
      width: '100%',
      panelClass: 'offers-mat-popup',
      data: offer,
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
