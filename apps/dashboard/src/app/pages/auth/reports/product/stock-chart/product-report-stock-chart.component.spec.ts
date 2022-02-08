import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductReportStockChartComponent } from './product-report-stock-chart.component';

describe('ProductReportStockChartComponent', () => {
  let component: ProductReportStockChartComponent;
  let fixture: ComponentFixture<ProductReportStockChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductReportStockChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductReportStockChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
