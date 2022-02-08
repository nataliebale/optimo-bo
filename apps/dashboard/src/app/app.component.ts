import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RoutingStateService } from '@optimo/core';
import { MixpanelService } from '@optimo/mixpanel';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(
    routingState: RoutingStateService,
    translate: TranslateService,
    _mixpanelService: MixpanelService
  ) {
    routingState.loadRouting();
    routingState.trackGoogleAnalitics();

    translate.addLangs(['en', 'ka']);
    translate.setDefaultLang('ka');

    // const browserLang = translate.getBrowserLang();
    // translate.use(browserLang.match(/en|ka/) ? browserLang : 'ka');
    _mixpanelService.init(environment.MIXPANEL_TOKEN);
  }
}
