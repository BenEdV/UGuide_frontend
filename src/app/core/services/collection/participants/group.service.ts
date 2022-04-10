import { Injectable } from '@angular/core';
import { CollectionDataService } from './../collection-data.service';
import { ApiService } from '../../api.service';
import { RouteParamsService } from '../../route-params.service';
import { AuthService } from '../../auth.service';
import { switchMap, map, shareReplay } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { ParticipantService } from './participant.service';
import { CollectionService } from './../collection.service';
import { Group } from '../../../interfaces/group';
import { Participant } from '../../../interfaces/participant';
import { Collection } from '../../../interfaces/collection';

@Injectable({
  providedIn: 'root'
})
export class GroupService extends CollectionDataService {

  constructor(private api: ApiService,
              private routeParamService: RouteParamsService,
              private authService: AuthService,
              private collectionService: CollectionService,
              private participantService: ParticipantService) {
    super(api, routeParamService, authService);
    this.resource = 'groups';
    this.participantService.groupService = this;
  }

  all(): Observable<Group[]> {
    if (!this.cache[this.collectionId]) {
      this.cache[this.collectionId] = this.collectionService.withId(this.collectionId).pipe(
        switchMap(res => {
          const groups = res?.subcollections || [];
          const membersPerGroup = [];
          const studentsPerGroup = [];
          if (groups.length > 0) {
            for (const group of groups) {
              membersPerGroup.push(this.participantService.getUsers(group.id));
              studentsPerGroup.push(this.participantService.students(group.id));
            }
            return forkJoin([of(groups), forkJoin(membersPerGroup), forkJoin(studentsPerGroup)]);
          }

          return forkJoin([of(groups), of(membersPerGroup), of(studentsPerGroup)]);
        }),
        map(res => {
          const groups = res[0] as Group[];
          const membersPerGroup = res[1] as Participant[][];
          const studentsPerGroup = res[2] as Participant[][];

          for (let i = 0; i < groups.length; i++) {
            groups[i].members = membersPerGroup[i];
            groups[i].students = studentsPerGroup[i];
          }
          return groups;
        }),
        shareReplay()
      );
    }

    return this.cache[this.collectionId];
  }

  protected addData(payload) {
    const actions = [
      this.api.post(`${this.collectionId}/${this.resource}/`, payload),
      this.collectionService.withId(this.collectionId)
    ];

    return forkJoin(actions).pipe(
      map(res => {
        const group = res[0] as Group;
        const collection = res[1] as Collection;

        group.students = [];
        group.members = [];
        collection.subcollections.push(group);

        return {
          all: [...collection.subcollections] as Group[],
          added: [group]
        };
      })
    );
  }

  add(name: string, members?: Participant[], roles?: string[]) {
    const payload = {
      name
    };

    if (members && members.length > 0) {
      return this.addData(payload).pipe(
        switchMap((groups) => {
          return forkJoin([of(groups.all), this.participantService.addUsersToGroup(groups.added[0], members, roles)]);
        }),
        map(res => ({
          all: res[0] as Group[],
          added: res[1] as Group[]
        }))
      );
    }

    return this.addData(payload);
  }

  edit(id: number, name: string, members?: Participant[], roles?: string[]) {
    const payload = {
      name
    };

    if (members && members.length > 0) {
      return this.editData(id, payload).pipe(
        switchMap((group: Group) => {
          return forkJoin([of(group), this.participantService.addUsersToGroup(group, members, roles)]);
        }),
        map(res => res[0] as Group)
      );
    }

    return this.editData(id, payload);
  }

  deleteUserFromGroup(groupId: number, memberId: number) {
    const actions = [
      this.api.delete(`${this.collectionId}/${this.resource}/${groupId}/users/${memberId}`),
      this.withId(groupId),
      this.participantService.withId(memberId)
    ];

    return forkJoin(actions).pipe(
      map(res => {
        const group = res[1] as Group;
        const participant = res[2] as Participant;

        const memberIdx = group.members.findIndex(m => m.id === memberId);
        if (memberIdx !== -1) {
          group.members.splice(memberIdx, 1);
        }

        const studentIdx = group.students.findIndex(s => s.id === memberId);
        if (studentIdx !== -1) {
          group.students.splice(studentIdx, 1);
          group.member_count = group.students.length; // TODO: should be student_count?
        }

        const groupIdx = participant.groups.map(g => g.id).indexOf(groupId);
        if (groupIdx !== -1) {
          participant.groups.splice(groupIdx, 1);
        }

        return group;
      })
    );
  }

  delete(id: number) {
    const actions = [
      this.api.delete(`${this.collectionId}/${this.resource}/${id}`),
      this.all()
    ];

    return forkJoin(actions)
      .pipe(
        map(res => {
          const groups = res[1] as Group[];

          const deletedIdx = groups.findIndex(group => group.id === id);
          if (deletedIdx !== -1) {
            groups.splice(deletedIdx, 1);
          }

          return [...groups];
        })
      );
  }
}
