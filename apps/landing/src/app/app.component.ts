import { Component } from '@angular/core';
import { RoutingStateService } from '@optimo/core';
import { LanguageService } from './shared/services/language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(
    public routingState: RoutingStateService,
    private _languageService: LanguageService
  ) {
    this.initApp();
  }

  private initApp() {
    this.routingState.loadRouting();
    this.routingState.trackGoogleAnalitics();
    this._languageService.init();
  }
}
