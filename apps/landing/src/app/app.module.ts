import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
// import { RequestComponent } from './request/request.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { IconModule } from './icon/icon.module';
import { LandingComponent } from './landing/landing.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './footer/footer.component';
import { RequestFormComponent } from './request/form/request-form.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from './shared/shared.module';
import { PackagesTabsComponent } from './packages/tabs/packages-tabs.component';
import { DemoComponent } from './demo/demo.component';
import { RequestDemoFormComponent } from './demo/form/request-demo-form.component';
import { IsInViewportDirective } from './shared/directives/is-in-viewport.directive';
import { NgxMaskModule } from 'ngx-mask';
import { PushPipeModule } from './shared/pipes/push.pipe';
import { PackagesComponent } from './packages/packages.component';
import { PackagesTableComponent } from './packages/table/packages-table.component';
import { CoreModule } from '@optimo/core';
import { LoaderBarModule } from '@optimo/ui-loader-bar';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FaqComponent } from './faq/faq.component';
import { FaqSearchBoxComponent } from './faq/search-box/faq-search-box.component';
import { FaqCategoriesComponent } from './faq/categories/faq-categories.component';
import { FaqListComponent } from './faq/list/faq-list.component';
import { FaqResolver } from './faq/faq.resolver';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'ka',
    pathMatch: 'full',
  },
  {
    path: ':language',
    component: LandingComponent,
    data: {
      title: 'PageTitleAndMetaTags.MainPage.title',
      meta: 'PageTitleAndMetaTags.MainPage.meta',
    },
  },
  // {
  //   path: ':language/request',
  //   component: RequestComponent,
  //   data: {
  //     title: 'PageTitleAndMetaTags.RequestPage.title',
  //     meta: 'PageTitleAndMetaTags.RequestPage.meta',
  //   },
  // },
  {
    path: ':language/faq/:categorySlug',
    component: FaqComponent,
    data: {
      title: 'PageTitleAndMetaTags.FaqPage.title',
      meta: 'PageTitleAndMetaTags.FaqPage.meta',
    },
    resolve: {
      FAQs: FaqResolver,
    },
  },
  {
    path: ':language/packages',
    component: PackagesComponent,
    data: {
      title: 'PageTitleAndMetaTags.PackagesPage.title',
      meta: 'PageTitleAndMetaTags.PackagesPage.meta',
    },
  },
  {
    path: ':language/request-demo',
    component: DemoComponent,
    data: {
      title: 'PageTitleAndMetaTags.RequestDemoPage.title',
      meta: 'PageTitleAndMetaTags.RequestDemoPage.meta',
    },
  },
  { path: '**', redirectTo: '' },
];

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    // RequestComponent,
    LandingComponent,
    FooterComponent,
    RequestFormComponent,
    PackagesComponent,
    PackagesTabsComponent,
    PackagesTableComponent,
    DemoComponent,
    RequestDemoFormComponent,
    IsInViewportDirective,
    FaqComponent,
    FaqSearchBoxComponent,
    FaqCategoriesComponent,
    FaqListComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      scrollOffset: [0, 90],
      initialNavigation: 'enabled',
    }),
    ReactiveFormsModule,
    HttpClientModule,
    NgSelectModule,
    IconModule,
    SharedModule,
    NgxMaskModule.forRoot(),
    PushPipeModule,
    LoaderBarModule,
    CoreModule.forRoot({
      mainRoute: environment.API_ENDPOINT,
      gtagId: environment.GTAG_ID,
      isProduction: environment.production,
      appType: environment.APP_TYPE,
    }),
    BrowserAnimationsModule,
    MatDialogModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [FaqResolver],
  exports: [HeaderComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
