import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetWithPhoneComponent } from './reset-with-phone.component';

describe('ResetWithPhoneComponent', () => {
  let component: ResetWithPhoneComponent;
  let fixture: ComponentFixture<ResetWithPhoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetWithPhoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetWithPhoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
