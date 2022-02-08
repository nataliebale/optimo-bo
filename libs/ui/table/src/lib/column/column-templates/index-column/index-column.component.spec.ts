/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { IndexColumnComponent } from './index-column.component';

describe('IndexColumnComponent', () => {
  let component: IndexColumnComponent;
  let fixture: ComponentFixture<IndexColumnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndexColumnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndexColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
