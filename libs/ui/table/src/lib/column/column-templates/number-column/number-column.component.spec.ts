/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NumberColumnComponent } from './number-column.component';

describe('NumberColumnComponent', () => {
  let component: NumberColumnComponent;
  let fixture: ComponentFixture<NumberColumnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NumberColumnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
