import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductReportSoldChartComponent } from './product-report-sold-chart.component';

describe('ProductReportSoldChartComponent', () => {
  let component: ProductReportSoldChartComponent;
  let fixture: ComponentFixture<ProductReportSoldChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductReportSoldChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductReportSoldChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
