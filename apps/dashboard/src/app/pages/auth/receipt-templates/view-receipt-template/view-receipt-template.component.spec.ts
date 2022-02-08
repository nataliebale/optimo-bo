import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewReceiptTemplateComponent } from './view-receipt-template.component';

describe('ViewReceiptTemplateComponent', () => {
  let component: ViewReceiptTemplateComponent;
  let fixture: ComponentFixture<ViewReceiptTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewReceiptTemplateComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewReceiptTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
