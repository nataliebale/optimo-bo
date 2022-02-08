import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderViewDialogComponent } from './purchase-order-view-dialog.component';

describe('PurchaseOrderViewDialogComponent', () => {
  let component: PurchaseOrderViewDialogComponent;
  let fixture: ComponentFixture<PurchaseOrderViewDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderViewDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
