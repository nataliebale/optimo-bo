import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyNumberComponent } from './verify-number.component';

describe('VerifyNumberComponent', () => {
  let component: VerifyNumberComponent;
  let fixture: ComponentFixture<VerifyNumberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyNumberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
