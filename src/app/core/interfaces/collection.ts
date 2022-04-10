import { CourseInstance } from './course';

export interface Collection {
  id: number;
  name: string;
  permissions: string[];
  settings: any;
  user_settings: any;
  pages: string[];
  subcollections: SimpleCollection & Collection[];
  activity_count: number;
  construct_model_count: number;
  member_count: number;
  roles: string[];
  connectors_count: number;
  parent?: SimpleCollection & Collection;
  course_instance_id: number;
  course_instance?: CourseInstance;
}

export interface SimpleCollection {
  id: number;
}
