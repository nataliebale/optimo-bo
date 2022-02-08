import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeCategoriesComponent } from './attribute-categories.component';

describe('AttributeCategoriesComponent', () => {
  let component: AttributeCategoriesComponent;
  let fixture: ComponentFixture<AttributeCategoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributeCategoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
