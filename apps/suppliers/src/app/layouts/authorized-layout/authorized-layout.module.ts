import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthorizedLayoutComponent } from './authorized-layout.component';
import { NestedMenuModule } from '@optimo/ui-nested-menu';
import { SidebarComponent } from './sidebar/sidebar.component';
import { IconModule } from '@optimo/ui-icon';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { HeadbarComponent } from './headbar/headbar.component';
import { HeadbarMenuComponent } from './headbar/menu/headbar-menu.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NestedMenuModule,
    // UserIdleModule.forRoot({ idle: 1800, timeout: 60, ping: 1 }),
    MatDialogModule,
    MatBottomSheetModule,
    IconModule,
  ],
  declarations: [
    AuthorizedLayoutComponent,
    HeadbarComponent,
    HeadbarMenuComponent,
    SidebarComponent,
  ],
  exports: [AuthorizedLayoutComponent],
})
export class AuthorizedLayoutModule {}
