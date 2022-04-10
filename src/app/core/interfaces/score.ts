export interface Score {
  construct_id: number;
  user_id?: number;
  collection_id?: number;
  activity_id?: number;
  score: number;
  timestamp: string;
}
