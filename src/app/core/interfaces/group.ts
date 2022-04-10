import { Collection } from './collection';
import { Participant } from './participant';

export interface Group extends Collection {
  members: Participant[];
  students: Participant[];
}
