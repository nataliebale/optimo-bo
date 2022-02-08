import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TutorialsComponent } from './tutorials.component';
import { RouterModule, Routes } from '@angular/router';
import { IconModule } from '@optimo/ui-icon';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: TutorialsComponent,
  },
];

@NgModule({
  declarations: [TutorialsComponent],
  imports: [CommonModule, RouterModule.forChild(routes), IconModule, TranslateModule.forChild()],
})
export class TutorialsModule {}
