import { registerLocaleData } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import localeKa from '@angular/common/locales/ka';
import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from '@optimo/core';
import { LoaderBarModule } from '@optimo/ui-loader-bar';
import { NotifierModule } from 'angular-notifier';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpErrorInterceptor } from './core/services/interceptor/http_error_interceptor';
import { HttpDefaultParamInterceptor } from './core/services/interceptor/http_default_param_interceptor';
import { AuthorizedLayoutModule } from './layouts/authorized-layout/authorized-layout.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from './core/factories/ngx-translate-factories';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import * as fromAppState from './state/app.reducer';
registerLocaleData(localeKa);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CoreModule.forRoot({
      authRoute: environment.AUTH_ROUTE,
      mainRoute: environment.INVENTORY_ROUTE,
      reportingRoute: environment.REPORTING_ROUTE,
      refreshAccessTokenEndpoint: 'User/RefreshAccessToken',
      isProduction: environment.production,
      gtagId: environment.GTAG_ID,
      appType: environment.APP_TYPE,
    }),
    AppRoutingModule,
    AuthorizedLayoutModule,
    BrowserAnimationsModule,
    NotifierModule.withConfig({
      behaviour: {
        autoHide: 7000,
        showDismissButton: false,
      },
      position: {
        horizontal: {
          position: 'left',
          distance: 16,
        },
        vertical: {
          position: 'bottom',
          distance: 30,
          gap: 16,
        },
      },
    }),
    HttpClientModule,
    LoaderBarModule,
    StoreModule.forRoot({ [fromAppState.appStateKey]: fromAppState.reducer }),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      defaultLanguage: 'ka',
    }),
  ],
  providers: [
    // Provides interceptor
    // {
    //   provide: ErrorHandler,
    //   useClass: ExceptionHandlerService
    // },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpDefaultParamInterceptor,
      multi: true,
    },
    { provide: LOCALE_ID, useValue: 'ka' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
