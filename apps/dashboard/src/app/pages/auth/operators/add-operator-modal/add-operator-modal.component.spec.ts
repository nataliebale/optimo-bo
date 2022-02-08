import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOperatorModalComponent } from './add-operator-modal.component';

describe('AddOperatorModalComponent', () => {
  let component: AddOperatorModalComponent;
  let fixture: ComponentFixture<AddOperatorModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddOperatorModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOperatorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
