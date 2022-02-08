import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenuesReportLineChartComponent } from './revenues-report-line-chart.component';

describe('RevenuesReportLineChartComponent', () => {
  let component: RevenuesReportLineChartComponent;
  let fixture: ComponentFixture<RevenuesReportLineChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RevenuesReportLineChartComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevenuesReportLineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
