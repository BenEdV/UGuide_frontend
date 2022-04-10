import { Component, OnInit } from '@angular/core';
import { Participant } from 'src/app/core/interfaces/participant';
import { ActivatedRoute } from '@angular/router';
import { BaseAdministrationComponent } from '../base-administration/base-administration.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { GroupService } from 'src/app/core/services/collection/participants/group.service';
import { Group } from 'src/app/core/interfaces/group';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-administration-group',
  templateUrl: './administration-group.component.html',
  styleUrls: ['./administration-group.component.scss']
})
export class AdministrationGroupComponent extends BaseAdministrationComponent implements OnInit {
  groups: Group[];
  participants: Participant[];
  roles: string[];

  addForm = new FormGroup({
    name: new FormControl('', Validators.required),
    members: new FormControl([]),
    role: new FormControl(null)
  });

  editForm = new FormGroup({
    name: new FormControl('', Validators.required),
    members: new FormControl([]),
    role: new FormControl(null)
  });
  editingItemMembers: Participant[] = [];
  possibleMemberLinks: Participant[] = [];
  editingMembersOverride = {
    role: (member: Participant) => {
      return member.groups.find(group => group.id === this.editingItem.id)?.roles.filter(r => r !== 'member').join(', ');
    }
  };
  roleDropdownLabelOverride = (item: string) => this.translate.instant('admin.group.roles.' + item);

  constructor(private route: ActivatedRoute,
              private modal: NgbModal,
              private groupService: GroupService,
              private authService: AuthService,
              private translate: TranslateService) {
    super(route, modal);
  }

  ngOnInit(): void {
    this.groups = this.route.snapshot.data.groups;
    this.participants = this.route.snapshot.data.participants?.studentList;
    this.roles = this.route.snapshot.data.types?.user_roles?.filter(r => r !== 'member');

    const group = super.resolveEditId(this.groups);
    if (group) {
      this.setEditingItem(group);
      this.editModal.open();
    }
  }

  add() {
    if (this.validateForm(this.addForm)) {
      this.groupService.add(
        this.addC.name.value,
        this.addC.members.value,
        this.resolveRoles(this.addC.role.value)
      ).subscribe(res => this.groups = res.all);
      this.addForm.patchValue({
        name: '',
        members: null
      });
      this.finaliseAdd();
    }
  }

  getExistingMemberLinks(group: Group) {
    return group.members.filter(participant => participant.id !== this.authService.user.id);
  }

  getPossibleMemberLinks(group: Group) {
    if (!group.members || group.members.length === 0) {
      return this.participants;
    }

    return this.participants.filter(participant => group.members.findIndex(member => member.id === participant.id) === -1);
  }

  setEditingItem(group: Group) {
    super.setEditingItem(group);

    this.editForm.patchValue({
      name: group.name,
      members: [],
      role: null
    });
    this.editingItemMembers = this.getExistingMemberLinks(this.editingItem);
    this.possibleMemberLinks = this.getPossibleMemberLinks(this.editingItem);
  }

  edit() {
    if (this.validateForm(this.editForm)) {
      if (this.editForm.dirty) {
        this.groupService.edit(
          this.editingItem.id,
          this.editC.name.value,
          this.editC.members.value,
          this.resolveRoles(this.editC.role.value)
        ).subscribe((res: Group[]) => this.groups = this.overwriteMemory(this.groups, [res]));
      }
      this.finaliseEdit();
    }
  }

  delete() {
    this.groupService.delete(this.deletingItem.id).subscribe((res: Group[]) => this.groups = res);
  }

  deleteUserLink(groupId: number, participantId: number) {
    this.groupService.deleteUserFromGroup(groupId, participantId).subscribe(res => {
      this.groups = this.overwriteMemory(this.groups, [res]);
      this.editingItemMembers = this.getExistingMemberLinks(this.editingItem);
      this.possibleMemberLinks = this.getPossibleMemberLinks(this.editingItem);
    });
  }

  resolveRoles(role: string): string[] {
    const roles = [role];
    if (role === 'student') {
      roles.push('member');
    }
    return roles;
  }

}
