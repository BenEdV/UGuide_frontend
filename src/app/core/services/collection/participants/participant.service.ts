import { Injectable } from '@angular/core';
import { CollectionDataService } from './../collection-data.service';
import { ApiService } from '../../api.service';
import { RouteParamsService } from '../../route-params.service';
import { AuthService } from '../../auth.service';
import { map } from 'rxjs/operators';
import { Participant } from '../../../interfaces/participant';
import { GroupService } from './group.service';
import { Group } from '../../../interfaces/group';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService extends CollectionDataService {
  groupService: GroupService;
  private studentRole = 'member';

  constructor(private api: ApiService,
              private routeParamService: RouteParamsService,
              private authService: AuthService) {
    super(api, routeParamService, authService);
    this.resource = 'users';
  }

  students(groupId?: number) {
    return this.getUsers(groupId, this.studentRole);
  }

  getUsers(groupId?: number, role?: string) {
    return this.all().pipe(
      map((members: Participant[]) => {
        return members.filter(member => {
          if (!groupId) {
            return !role || member.roles.includes(role);
          }

          for (const group of member.groups) {
            if (group.id === groupId && (!role || group.roles.includes(role))) {
              return true;
            }
          }
        });
      })
    );
  }

  addUsersToGroup(group: Group, members: Participant[], roles: string[]): any {
    const payload = members.map(member => ({id: member.id, roles}));
    const actions = [
      this.api.post(`${this.collectionId}/groups/${group.id}/${this.resource}`, payload),
      this.withIds(members.map(member => member.id))
    ];

    return forkJoin(actions).pipe(
      map(res => {
        const addedMembers = res[1] as Participant[];

        if (!group.members) {
          group.members = [];
        }

        if (!group.students) {
          group.students = [];
        }

        for (const member of addedMembers) {
          let groupIdx = member.groups.findIndex(g => g.id === group.id);
          if (groupIdx === -1) {
            member.groups.push({id: group.id, roles});
            groupIdx = member.groups.length - 1;
          }

          for (const role of roles) {
            if (!member.groups[groupIdx].roles.includes(role)) {
              member.groups[groupIdx].roles.push(role);
            }
          }

          if (group.members.findIndex(m => m.id === member.id) === -1) {
            group.members.push(member);
            if (member.groups[groupIdx].roles.includes(this.studentRole)) {
              group.students.push(member);
            }
          }
        }

        group.member_count = group.students.length;

        return group;
      })
    );
  }
}
