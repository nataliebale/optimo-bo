import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateChartComponent } from './date-chart.component';

describe('DateChartComponent', () => {
  let component: DateChartComponent;
  let fixture: ComponentFixture<DateChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
