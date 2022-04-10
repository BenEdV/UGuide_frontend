import { Score } from './score';

export type VisibilityString = 'T' | 'F';

export interface Activity {
  id: number;
  collection_id?: number;
  title: string;
  type: string;
  visible: VisibilityString;
  description: string;
  properties: {[key: string]: any};
  date_added: string;
  start_time: string;
  end_time: string;
  results: ActivityResult[];                        // all results from all users for the activity (sorted descendingly)
  latest_results: ActivityResult[];                 // only the latest result from all users for the activity
  my_results: ActivityResult[];                     // all results of the currently active user (sorted descendingly)
  my_latest_result: ActivityResult;                 // latest result for the acitvity of the currently active user
  constructs: ActivityConstruct[];
  tail_activities: (SimpleActivity & Activity)[];
  head_activities: (SimpleActivity & Activity)[];
  attachments: ActivityAttachment[];
}

export interface SimpleActivity {
  id: number;
  relation_type: string;
  relation_properties: {[key: string]: any};
}

export interface ActivityAttachment {
  id: number;
  name: string;
  extension: string;
}

export interface ActivityType {
  id: number;
  name: string;
}

export interface ActivityConstruct {
  id: number;
  name: string;
  properties: {[key: string]: any};
  relation_type: string;
  relation_properties: {[key: string]: any};
  type: string;
  model_id: number;
  my_latest_score?: Score;          // the construct interface in construct.ts has an explanation on score properties
  my_scores?: Score[];
  user_scores?: Score[];
  latest_user_scores?: Score[];
  average_scores?: Score[];
  latest_average_score?: Score;
}

export interface ActivityResult {
  id: string;                       // UUID assigend to the statement
  user_id?: number;                 // is only available if the user has the right permissions
  verb: {[key: string]: any};
  result: {[key: string]: any};
  timestamp: string;
}
