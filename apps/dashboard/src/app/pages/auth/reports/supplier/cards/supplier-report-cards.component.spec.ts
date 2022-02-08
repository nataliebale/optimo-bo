/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SupplierReportCardsComponent } from './supplier-report-cards.component';

describe('SupplierReportCardsComponent', () => {
  let component: SupplierReportCardsComponent;
  let fixture: ComponentFixture<SupplierReportCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SupplierReportCardsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierReportCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
