import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceDetailsDialogComponent } from './space-details-dialog.component';

describe('SpaceDetailsDialogComponent', () => {
  let component: SpaceDetailsDialogComponent;
  let fixture: ComponentFixture<SpaceDetailsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpaceDetailsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpaceDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
