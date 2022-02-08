import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleOrderViewDialogComponent } from './sale-order-view-dialog.component';

describe('SaleOrderViewDialogComponent', () => {
  let component: SaleOrderViewDialogComponent;
  let fixture: ComponentFixture<SaleOrderViewDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaleOrderViewDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleOrderViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
