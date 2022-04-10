export interface Participant {
  id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  institution_id: string;
  mail: string;
  roles: string[];
  groups: {id: number, roles: string[]}[];
}
