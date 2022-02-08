import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierReportChartComponent } from './supplier-report-chart.component';

describe('SupplierReportChartComponent', () => {
  let component: SupplierReportChartComponent;
  let fixture: ComponentFixture<SupplierReportChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SupplierReportChartComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierReportChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
