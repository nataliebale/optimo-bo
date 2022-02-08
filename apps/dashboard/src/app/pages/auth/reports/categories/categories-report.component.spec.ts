import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesReportComponent } from './categories-report.component';

describe('CategoriesReportComponent', () => {
  let component: CategoriesReportComponent;
  let fixture: ComponentFixture<CategoriesReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CategoriesReportComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoriesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
