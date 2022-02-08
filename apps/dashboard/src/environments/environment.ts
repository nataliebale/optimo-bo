// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  preProduction: false,
  AUTH_ROUTE: 'https://identity.dev.optimo.ge/V1/',
  INVENTORY_ROUTE: 'https://inventory.dev.optimo.ge/api/V1/',
  REPORTING_ROUTE: 'https://reporting.dev.optimo.ge/api/V1/',
  MIXPANEL_TOKEN: '8bb8a15d0fe0b03022674be966880878',
  GTAG_ID: '',
  APP_TYPE: 'Staff',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
