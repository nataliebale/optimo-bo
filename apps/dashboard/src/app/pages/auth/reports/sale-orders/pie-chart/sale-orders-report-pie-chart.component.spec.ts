import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleOrdersReportPieChartComponent } from './sale-orders-report-pie-chart.component';

describe('SaleOrderPieChartComponent', () => {
  let component: SaleOrdersReportPieChartComponent;
  let fixture: ComponentFixture<SaleOrdersReportPieChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SaleOrdersReportPieChartComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleOrdersReportPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
