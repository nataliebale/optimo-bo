// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// export const environment = {
//   production: false,
// };


// TODO to be replaced
export const environment = {
  production: false,
  preProduction: false,
  AUTH_ROUTE: 'https://identity.staging.optimo.ge/V1/',
  INVENTORY_ROUTE: 'https://admin-api.staging.optimo.ge/api/v1/',
  MIXPANEL_TOKEN: 'b7f914a3c2e15cf54daff1528ec2052a',
  GTAG_ID: '',
  APP_TYPE: 'Admin',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
