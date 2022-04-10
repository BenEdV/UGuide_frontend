import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseAdministrationComponent } from '../base-administration/base-administration.component';
import { ActivatedRoute } from '@angular/router';
import { Activity, ActivityType } from '../../core/interfaces/activity';
import { ActivityService } from '../../core/services/collection/activity.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { Model } from 'src/app/core/interfaces/model';
import { Construct } from 'src/app/core/interfaces/construct';
import { ConstructService } from 'src/app/core/services/collection/constructs/construct.service';
import { forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-administration-study-material',
  templateUrl: './administration-study-material.component.html',
  styleUrls: ['./administration-study-material.component.scss']
})
export class AdministrationStudyMaterialComponent extends BaseAdministrationComponent implements OnInit {
  @ViewChild('linkConstructModal', {static: true}) linkConstructModal;

  studyMaterial: Activity[];
  activityTypes: ActivityType[];
  visibilityTypes: any[];
  models: Model[];
  constructs: Construct[];
  constructLinkTypes: any[];

  addForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    type: new FormControl(null, Validators.required),
    visibility: new FormControl(null, Validators.required),
    properties: new FormGroup({
      url: new FormControl(null)
    }),
    attachments: new FormControl(null),
    start_time: new FormControl(null)
  });

  editForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    type: new FormControl(null, Validators.required),
    visibility: new FormControl(null, Validators.required),
    properties: new FormGroup({
      url: new FormControl(null)
    }),
    attachments: new FormControl(null),
    start_time: new FormControl(null)
  });

  linkConstructForm = new FormGroup({
    material: new FormControl(null, Validators.required),
    construct: new FormControl(null, Validators.required),
    type: new FormControl(null, Validators.required)
  });
  possibleConstructLinks: Construct[];
  existingConstructLabels = {
    name: null
  };

  getAttachmentName = {
    name: (attachment) => attachment.name + '.' + attachment.extension
  };

  visibilityLabel = (item: any) => this.translate.instant('admin.study_material.' + item.name);
  typeLabel = (item: any) => this.translate.instant('admin.study_material.' + item.name);

  constructor(private route: ActivatedRoute,
              private activityService: ActivityService,
              private constructService: ConstructService,
              private translate: TranslateService,
              modal: NgbModal) {
    super(route, modal);
  }

  ngOnInit() {
    this.studyMaterial = this.route.snapshot.data.activities.studyMaterialList;
    this.activityTypes = this.route.snapshot.data.types.material;
    this.visibilityTypes = this.route.snapshot.data.types.visibility;
    this.models = this.route.snapshot.data.models;
    this.constructs = this.route.snapshot.data.constructs;
    this.constructLinkTypes = this.route.snapshot.data.types.construct_activity_relations;

    this.tableActions.push(
      {
        name: 'table.action.link_constructs',
        icon: 'construct-link-icon',
        callback: item => {
          this.setLinkMaterial(item);
          this.linkConstructModal.open();
        }
      }
    );

    const material = super.resolveEditId(this.studyMaterial);
    if (material) {
      this.setEditingItem(material);
      this.editModal.open();
    }
  }

  get linkConstructC() {
    return this.linkConstructForm.controls;
  }

  add() {
    if (this.validateForm(this.addForm)) {
      this.activityService.addMaterial(
        this.addC.title.value,
        this.addC.description.value,
        this.addC.type.value.id,
        this.addC.visibility.value.value,
        this.getDateISOString(this.addC.start_time.value),
        this.parseProperties(this.addC.properties),
        this.addC.attachments.value
      ).pipe(
        switchMap(() => this.activityService.studyMaterial()) // override default return value of all activities
      ).subscribe((res: Activity[]) => this.studyMaterial = res);
      this.addForm.patchValue({
        title: '',
        description: '',
        type: null,
        visibility: null,
        attachments: null
      });
      this.finaliseAdd();
    }
  }

  setEditingItem(studyMaterial: Activity) {
    super.setEditingItem(studyMaterial);

    const startTimeStopIdx = studyMaterial.start_time.indexOf('T');
    const studyMaterialType = this.activityTypes.find(type => type.name === studyMaterial.type);

    this.editForm.patchValue({
      title: studyMaterial.title,
      description: studyMaterial.description,
      type: studyMaterialType,
      visibility: studyMaterial.visible,
      start_time: studyMaterial.start_time.slice(0, startTimeStopIdx),
      attachments: null
    });

    const properties = {};
    for (const key of Object.keys(this.editC.properties.value)) {
      properties[key] = studyMaterial.properties && studyMaterial.properties[key];
    }
    this.editC.properties.patchValue(properties);
  }

  edit() {
    if (this.validateForm(this.editForm)) {
      if (this.editForm.dirty) {
        this.activityService.editMaterial(
          this.editingItem.id,
          this.editC.title.value,
          this.editC.description.value,
          this.editC.type.value.id,
          this.editC.visibility.value.value,
          this.getDateISOString(this.editC.start_time.value),
          this.parseProperties(this.editC.properties),
          this.editC.attachments.value
        ).subscribe((res: Activity) => this.studyMaterial = this.overwriteMemory(this.studyMaterial, [res]));
      }
      this.finaliseEdit();
    }
  }

  delete() {
    this.activityService.delete(this.deletingItem.id).pipe(
        switchMap(() => this.activityService.studyMaterial()) // override default return value of all activities
      ).subscribe((res: Activity[]) => this.studyMaterial = res);
  }

  resetLinkConstructForm() {
    this.linkConstructForm.patchValue({
      material: null,
      construct: null,
      type: null
    });
    this.resetFormValidation(this.linkConstructForm);
  }

  getPossibleConstructLinks(activity: Activity): Construct[] {
    const constructIds = activity.constructs.map(c => c.id);
    return this.constructs.filter(c => constructIds.indexOf(c.id) === -1);
  }

  setLinkMaterial(material: Activity) {
    this.linkConstructForm.patchValue({material});
    this.resetControls(this.linkConstructForm, {construct: null, type: null});
    this.possibleConstructLinks = this.getPossibleConstructLinks(material);
    this.existingConstructLabels = {
      name: item => this.translate.instant(
        `relation.study_material.${item.relation_type}_a`,
        {construct: item.name, material: material.title}
      )
    };
  }

  linkConstruct() {
    if (this.validateForm(this.linkConstructForm)) {
      const actions = [];
      for (const construct of this.linkConstructC.construct.value) {
        actions.push(
          this.constructService.linkActivity(
            construct.id,
            this.linkConstructC.material.value.id,
            this.linkConstructC.type.value.id
          )
        );
      }
      forkJoin(actions).subscribe();
      this.linkConstructModal.close('Link Clicked');
    }
  }

  deleteConstructLink(material: Activity, construct: Construct) {
    this.constructService.deleteActivityLink(
      construct.id,
      material.id
      ).subscribe((res: any[]) => {
        this.possibleConstructLinks = this.getPossibleConstructLinks(material);
      });
  }

  deleteAttachment(activityId: number, attachmentId: number) {
    this.activityService.deleteAttachment(activityId, attachmentId).subscribe(res => this.editingItem = res);
  }

  getDateISOString(date: string): string {
    const dateObj = new Date(date);
    return dateObj.toISOString();
  }

}
