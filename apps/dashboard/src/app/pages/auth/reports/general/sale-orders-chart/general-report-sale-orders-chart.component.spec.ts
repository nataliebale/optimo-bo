/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GeneralReportSaleOrdersChartComponent } from './general-report-sale-orders-chart.component';

describe('GeneralReportSaleOrdersChartComponent', () => {
  let component: GeneralReportSaleOrdersChartComponent;
  let fixture: ComponentFixture<GeneralReportSaleOrdersChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralReportSaleOrdersChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralReportSaleOrdersChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
