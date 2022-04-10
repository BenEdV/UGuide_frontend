// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  api_url: 'http://127.0.0.1:4200/api/',
  allow_registration: true,
  hide_sidenav: false,
  hide_breadcrumbs: false,
  collection_homepage: '',
  dashboard_homepage: '',
  user_agreement_i18n_key: 'thermos.user_agreement',
  captcha_site_key: '',
  product_name: 'UGuide',
  project_name: 'Thermos',
  show_powered_by: true,
  show_project_name: false,
  saml_client_id: 0,
  saml_auth_url: '',
  saml_logout_url: '',
  hover_log_timeout: 1000
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
