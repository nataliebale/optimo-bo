/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SupplierReportGridsComponent } from './supplier-report-grids.component';

describe('SupplierReportGridsComponent', () => {
  let component: SupplierReportGridsComponent;
  let fixture: ComponentFixture<SupplierReportGridsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SupplierReportGridsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierReportGridsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
