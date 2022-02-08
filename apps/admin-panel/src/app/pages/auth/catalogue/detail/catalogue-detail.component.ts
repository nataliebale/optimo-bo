import {
  Component,
  OnInit,
  Inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ClientService } from '@optimo/core';
import { catchError, takeUntil } from 'rxjs/operators';
import { EMPTY, Subject, Observable } from 'rxjs';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { CATALOGUE_STOCKITEM_STATUS } from './../../../../core/enums/catalogue-stockitem-status.enum';

@Component({
  selector: 'app-catalogue-detail',
  templateUrl: './catalogue-detail.component.html',
  styleUrls: ['./catalogue-detail.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueDetailComponent implements OnInit {
  catalogueStockitemStatus = CATALOGUE_STOCKITEM_STATUS;
  private unsubscribe$ = new Subject<void>();
  form: FormGroup;
  editId: number;
  editCatalogue: any;
  isSubmited: boolean;
  // businessTypes: any;

  constructor(
    private location: Location,
    private bottomSheetRef: MatBottomSheetRef<CatalogueDetailComponent>,
    private fb: FormBuilder,
    private clientService: ClientService,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.editId = this.params && this.params.id;
    if (this.editId) {
      this.getItemForEdit();
    } else {
      this.createForm(null);
    }
  }

  createForm(Catalogue: any) {
    this.form = this.fb.group({
      name: [Catalogue && Catalogue.name, [Validators.required]],
      barcode: [Catalogue && Catalogue.barcode, [Validators.required]],
      photoId: [Catalogue && Catalogue.photoId],
      photo: [Catalogue && Catalogue.photoUrl],
      category: [Catalogue && Catalogue.category],
      unitPrice: [Catalogue && Catalogue.unitPrice],
      unitCost: [Catalogue && Catalogue.unitCost],
      distributor: [Catalogue && Catalogue.supplierId, [Validators.required]],
      description: [Catalogue && Catalogue.description],
      status: [(Catalogue && Catalogue.status) || 0, [Validators.required]],
    });
    console.log('form values:', this.form.getRawValue());
    this.cdr.markForCheck();
  }

  onPhotoUploaded(event: any) {
    const imageControl = this.form.get('photoId');
    imageControl.setValue(event.response);
    imageControl.markAsDirty();
    console.log('picture set:', imageControl.value);
  }

  onCancel(): void {
    this.location.back();
  }

  onClose(): void {
    this.bottomSheetRef.dismiss('/catalogue');
  }

  getItemForEdit(): void {
    this.clientService
      .get(`catalogstockitems/${this.editId}`)
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result: any) => {
        if (!result) {
          this.close();
        }
        console.log('business type -> ', result);
        this.editCatalogue = result;
        this.createForm(result);
      });
  }

  private close(): void {
    this.bottomSheetRef.dismiss(true);
  }

  async onSubmit() {
    this.isSubmited = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.cdr.markForCheck();
      console.log('form is invalid');
      return;
    }

    const formRawValues = this.form.getRawValue();
    const requestBody = {
      name: formRawValues.name,
      barcode: formRawValues.barcode,
      photoId: formRawValues.photoId,
      category: formRawValues.category,
      supplierId: formRawValues.distributor,
      description: formRawValues.description,
      status: formRawValues.status,
      unitPrice: formRawValues.unitPrice,
      unitCost: formRawValues.unitCost,
    };

    if (this.editId) {
      this.clientService
        .put<any>(`catalogstockitems/${this.editId}`, requestBody)
        .pipe(
          catchError(() => {
            return EMPTY;
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((result) => {
          if (!result) {
            this.onCancel();
          }
          this.onClose();
        });
    } else {
      this.clientService
        .post<any>('catalogstockitems', requestBody)
        .pipe(
          catchError(() => {
            return EMPTY;
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((result) => {
          if (!result) {
            this.onCancel();
          }
          this.onClose();
        });
    }
  }

  get title(): string {
    return this.editId ? 'რედაქტირება' : 'დამატება';
  }

  getDistributors = (state: any): Observable<any> => {
    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
      },
    });

    if (state.searchValue) {
      params = params.append('name', state.searchValue);
    }

    return this.clientService.get<any>('supplier', { params });
  };

  getDistributorById = (id: number): Observable<any> => {
    return this.clientService.get<any>(`supplier/single?id=${id}`);
  };
}
