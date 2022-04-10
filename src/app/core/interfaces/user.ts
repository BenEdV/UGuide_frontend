export interface User {
  id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  idp: string;
  mail: string;
  institution_id: string;
  settings: {[key: string]: any};
  access_csrf: string;
  refresh_csrf: string;
}
