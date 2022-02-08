import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleOrdersReportLineChartComponent } from './sale-orders-report-line-chart.component';

describe('SaleOrderChartComponent', () => {
  let component: SaleOrdersReportLineChartComponent;
  let fixture: ComponentFixture<SaleOrdersReportLineChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SaleOrdersReportLineChartComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleOrdersReportLineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
