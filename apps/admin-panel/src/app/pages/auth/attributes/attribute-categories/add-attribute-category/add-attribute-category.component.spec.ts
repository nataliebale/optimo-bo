import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAttributeCategoryComponent } from './add-attribute-category.component';

describe('AddAttributeCategoryComponent', () => {
  let component: AddAttributeCategoryComponent;
  let fixture: ComponentFixture<AddAttributeCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAttributeCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAttributeCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
