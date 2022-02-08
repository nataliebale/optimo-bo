import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from './services/client.service';
import { StorageService } from './services/storage.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientInterceptor } from './interceptors/http_client_interceptor';
import { RoutingStateService } from './services/routing-state.service';
import { GoogleAnalyticsService } from './services/google-analytics.service';
import { PageTitleService } from './services/page-title.service';
import { SidebarStateService } from './services/sidebar-state.service';
import { RoleService } from './services/role.service';

const PROVIDERS = [
  ClientService,
  StorageService,
  RoutingStateService,
  GoogleAnalyticsService,
  PageTitleService,
  SidebarStateService,
  RoleService
];

export interface CoreLibConfig {
  authRoute?: string;
  reportingRoute?: string;
  mainRoute: string;
  refreshAccessTokenEndpoint?: string;
  gtagId?: string;
  isProduction: boolean;
  appType: string;
}

// export const CONFIG = new InjectionToken<CoreLibConfig>('CoreLibConfig');

@NgModule({
  imports: [CommonModule],
})
export class CoreModule {
  static forRoot(config: CoreLibConfig): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        { provide: 'CONFIG', useValue: config },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpClientInterceptor,
          multi: true,
        },
        ...PROVIDERS,
      ],
    };
  }
}
