import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenuesReportComponent } from './revenues-report.component';

describe('RevenuesReportComponent', () => {
  let component: RevenuesReportComponent;
  let fixture: ComponentFixture<RevenuesReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RevenuesReportComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevenuesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
