import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';

import { CoreModule } from '@optimo/core';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { NotifierModule } from 'angular-notifier';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthorizedLayoutModule } from './layouts/authorized-layout/authorized-layout.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import localeKa from '@angular/common/locales/ka';
import { registerLocaleData } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorInterceptor } from './core/services/inteceptors/http_error_interceptor';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from './core/factories/ngx-translate-factories';
registerLocaleData(localeKa);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CoreModule.forRoot({
      authRoute: environment.AUTH_ROUTE,
      mainRoute: environment.INVENTORY_ROUTE,
      refreshAccessTokenEndpoint: 'User/RefreshAccessToken',
      isProduction: environment.production,
      gtagId: environment.GTAG_ID,
      appType: environment.APP_TYPE,
    }),
    AppRoutingModule,
    HttpClientModule,
    AuthorizedLayoutModule,
    NotifierModule,
    BrowserAnimationsModule,
    FormsModule,
    MatTooltipModule,
	TranslateModule.forRoot({
		loader: {
		  provide: TranslateLoader,
		  useFactory: HttpLoaderFactory,
		  deps: [HttpClient]
		},
		defaultLanguage: 'ka',
	  }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    { provide: LOCALE_ID, useValue: 'ka' }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
