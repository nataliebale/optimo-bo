import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RoutingStateService } from '@optimo/core';
import { MENU_TREE } from './layouts/authorized-layout/sidebar/nested-menu.mock'

@Component({
  selector: 'admin-panel-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'admin-panel';

  constructor(
    routingState: RoutingStateService,
  ) {
    routingState.loadRouting();
    routingState.updatePageTitle(MENU_TREE);
  }
}
