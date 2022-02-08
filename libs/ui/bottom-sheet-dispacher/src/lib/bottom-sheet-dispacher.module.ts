import { NgModule, ModuleWithProviders, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomSheetDispacherComponent } from './bottom-sheet-dispacher.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: BottomSheetDispacherComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), MatBottomSheetModule],
  declarations: [BottomSheetDispacherComponent]
})
export class BottomSheetDispacherModule {
  static forRoot(dispatchedComponent: Type<any>): ModuleWithProviders<BottomSheetDispacherModule> {
    return {
      ngModule: BottomSheetDispacherModule,
      providers: [
        { provide: 'DISPATCHED_COMPONENT', useValue: dispatchedComponent }
      ]
    };
  }
}
