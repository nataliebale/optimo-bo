import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderLinesExcelImportComponent } from './order-lines-excel-import.component';

describe('OrderLinesExcelImportComponent', () => {
  let component: OrderLinesExcelImportComponent;
  let fixture: ComponentFixture<OrderLinesExcelImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderLinesExcelImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderLinesExcelImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
