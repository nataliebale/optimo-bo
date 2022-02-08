import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSupplierProductsComponent } from './add-supplier-products.component';

describe('AddSupplierProductsComponent', () => {
  let component: AddSupplierProductsComponent;
  let fixture: ComponentFixture<AddSupplierProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSupplierProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSupplierProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
