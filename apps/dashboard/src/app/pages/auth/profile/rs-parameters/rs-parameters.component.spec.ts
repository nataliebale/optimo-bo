import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RsParametersComponent } from './rs-parameters.component';

describe('RsParametersComponent', () => {
  let component: RsParametersComponent;
  let fixture: ComponentFixture<RsParametersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RsParametersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RsParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
