import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { VideoTutorialsComponent } from './video-tutorials.component';
import { TableModule } from '@optimo/ui-table';
import { IconModule } from '@optimo/ui-icon';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { LoadingPopupModule } from '../../../popups/loading-popup/loading-popup.module';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';

const routes: Routes = [
  {
    path: '',
    component: VideoTutorialsComponent,
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./detail/video-tutorial-detail.module').then(
        (m) => m.VideoTutorialDetailModule
      ),
  },
  {
    path: 'edit/:id',
    loadChildren: () =>
      import('./detail/video-tutorial-detail.module').then(
        (m) => m.VideoTutorialDetailModule
      ),
  },
];

@NgModule({
  declarations: [VideoTutorialsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatDialogModule,
    TableModule,
    MatTooltipModule,
    IconModule,
    ApproveDialogModule,
    LoadingPopupModule,
    DynamicSelectModule,
  ],
})
export class VideoTutorialsModule {}
