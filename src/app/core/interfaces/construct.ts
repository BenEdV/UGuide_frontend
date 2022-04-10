import { Score } from './score';

export interface Construct {
  id: number;
  name: string;
  description: string;
  type: string;
  model_id: number;
  properties: any;
  head_constructs: (SimpleConstruct & Construct)[];
  tail_constructs: (SimpleConstruct & Construct)[];
  activities: ConstructActivity[];
  my_latest_score?: Score;                          // latest score obtained by the currently active user
  my_scores?: Score[];                              // all scores obtained by the currently active user sorted on timestamp
  user_scores?: Score[];                            // all scores of all users for this construct
  latest_user_scores?: Score[];                     // only the latest score of all users for this construct
  average_scores?: Score[];                         // average scores retrieved from the backend for the currently active collection
  latest_average_score?: Score;                     // latest average score from average_scores
}

export interface SimpleConstruct {
  id: number;
  relation_type: string;
  relation_properties: {[key: string]: any};
}

export interface ConstructActivity {
  title: string;
  id: number;
  type: string;
  properties: any;
  relation_type: string;
}
