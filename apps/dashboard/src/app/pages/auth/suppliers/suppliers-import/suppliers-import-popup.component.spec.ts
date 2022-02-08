/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SuppliersImportPopupComponent } from './suppliers-import-popup.component';

describe('SuppliersImportPopupComponent', () => {
  let component: SuppliersImportPopupComponent;
  let fixture: ComponentFixture<SuppliersImportPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SuppliersImportPopupComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuppliersImportPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
