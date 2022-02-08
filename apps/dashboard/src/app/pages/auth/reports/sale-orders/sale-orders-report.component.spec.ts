import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleOrdersReportComponent } from './sale-orders-report.component';

describe('SaleOrderComponent', () => {
  let component: SaleOrdersReportComponent;
  let fixture: ComponentFixture<SaleOrdersReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SaleOrdersReportComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleOrdersReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
