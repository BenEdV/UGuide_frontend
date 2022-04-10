import { Collection } from './collection';

export interface CourseInstance {
  id: number;
  collection_id: number;
  period: Period;
  course: Course;
}

export interface Course {
  id: number;
  name: string;
  code: string;
}

export interface Period {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}
