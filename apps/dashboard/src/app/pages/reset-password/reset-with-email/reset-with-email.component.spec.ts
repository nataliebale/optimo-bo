import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetWithEmailComponent } from './reset-with-email.component';

describe('ResetWithEmailComponent', () => {
  let component: ResetWithEmailComponent;
  let fixture: ComponentFixture<ResetWithEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetWithEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetWithEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
