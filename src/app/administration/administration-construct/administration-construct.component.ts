import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Construct, ConstructActivity, SimpleConstruct } from '../../core/interfaces/construct';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Model } from '../../core/interfaces/model';
import { ConstructService } from '../../core/services/collection/constructs/construct.service';
import { BaseAdministrationComponent } from '../base-administration/base-administration.component';
import { Activity } from 'src/app/core/interfaces/activity';
import { ActivityStatic } from 'src/app/activity/activity.static';
import { forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-administration-construct-list',
  templateUrl: './administration-construct.component.html',
  styleUrls: ['./administration-construct.component.scss']
})
export class AdministrationConstructComponent extends BaseAdministrationComponent implements OnInit {
  @ViewChild('linkConstructModal', {static: true}) linkConstructModal;
  @ViewChild('linkMaterialModal', {static: true}) linkMaterialModal;

  models: Model[];
  constructs: Construct[];
  constructLinkTypes: any[];
  studyMaterial: Activity[];
  materialLinkTypes: any[];

  addForm = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl(''),
    model: new FormControl(null, Validators.required),
    type: new FormControl(null, Validators.required),
  });

  editForm = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl(''),
    model: new FormControl(null, Validators.required),
    type: new FormControl(null, Validators.required),
  });

  csvForm = new FormGroup({
    model: new FormControl(null, Validators.required),
    file: new FormControl(null, Validators.required)
  });

  linkConstructForm = new FormGroup({
    aConstruct: new FormControl(null, Validators.required),
    type: new FormControl(null, Validators.required),
    bConstruct: new FormControl(null, Validators.required)
  });
  possibleConstructLinks: Construct[] = [];

  linkMaterialForm = new FormGroup({
    construct: new FormControl(null, Validators.required),
    material: new FormControl(null, Validators.required),
    type: new FormControl(null, Validators.required)
  });
  existingMaterialLinks: ConstructActivity[] = [];
  existingMaterialLabels = {
    name: null
  };
  possibleMaterialLinks: Activity[] = [];

  getExistingConstructLabels = (direction: string) => ({
    name: null
  })

  constructor(private route: ActivatedRoute,
              private router: Router,
              private constructService: ConstructService,
              private translate: TranslateService,
              modal: NgbModal) {
    super(route, modal);
  }

  get linkConstructC() {
    return this.linkConstructForm.controls;
  }

  get linkMaterialC() {
    return this.linkMaterialForm.controls;
  }

  ngOnInit() {
    this.models = this.route.snapshot.data.models;
    this.constructs = this.route.snapshot.data.constructs;

    this.constructLinkTypes = this.getConstructRelationTypes(this.route.snapshot.data.types.construct_relations);

    this.studyMaterial = this.route.snapshot.data.activities.studyMaterialList;
    this.materialLinkTypes = this.getMaterialRelationTypes(this.route.snapshot.data.types.construct_activity_relations);

    this.tableActions.push(
      {
        name: 'table.action.link_constructs',
        icon: 'construct-link-icon',
        callback: item => {
          this.setLinkConstructItem(item);
          this.linkConstructModal.open();
        }
      },
      {
        name: 'table.action.link_study_material',
        icon: 'material-link-icon',
        callback: item => {
          this.setLinkMaterialItem(item);
          this.linkMaterialModal.open();
        }
      },
      {
        name: 'table.action.link_questions',
        icon: 'question-link-icon',
        callback: item => {
          this.router.navigate(['..', 'mapping'], {relativeTo: this.route});
        }
      },
    );

    const construct = super.resolveEditId(this.constructs);
    if (construct) {
      this.setEditingItem(construct);
      this.editModal.open();
    }
  }

  add() {
    if (this.validateForm(this.addForm)) {
      this.constructService.add(
        this.addC.name.value,
        this.addC.description.value,
        this.addC.model.value.id,
        this.addC.type.value.id).subscribe(res => this.constructs = res.all);
      this.addForm.patchValue({
        name: '',
        description: ''
      });
      this.finaliseAdd();
    }
  }

  setEditingItem(construct: Construct) {
    super.setEditingItem(construct);
    const constructModel = this.models.find(model => model.id === construct.model_id);

    this.editForm.patchValue({
      name: construct.name,
      description: construct.description,
      model: constructModel,
      type: construct.type,
    });
  }

  edit() {
    if (this.validateForm(this.editForm)) {
      if (this.editForm.dirty) {
        this.constructService.edit(
          this.editingItem.id,
          this.editC.name.value,
          this.editC.description.value,
          this.editC.model.value.id,
          this.editC.type.value.id
        ).subscribe((res: Construct) => this.constructs = this.overwriteMemory(this.constructs, [res]));
      }
      this.finaliseEdit();
    }
  }

  setLinkConstructItem(construct: Construct) {
    this.linkConstructForm.patchValue({
      aConstruct: construct
    });
    this.resetControls(this.linkConstructForm, {bConstruct: null, type: null});
    this.possibleConstructLinks = this.getPossibleConstructLinks(construct);
    this.getExistingConstructLabels = (direction: string) => ({
      name: (linkedConstruct: SimpleConstruct & Construct) => this.translate.instant(
        `relation.construct.${linkedConstruct.relation_type}${direction}`,
        {aConstruct: construct.name, bConstruct: linkedConstruct.name}
      )
    });
  }

  getConstructRelationTypes(types: any) {
    const sTypes = [];

    for (const type of types) {
      const phraseA = {
        id: type.id,
        direction: 'a->b',
        name: this.translate.instant(
          `relation.construct.${type.name}_a`,
          {aConstruct: '', bConstruct: ''}
        )
      };
      sTypes.push(phraseA);

      const phraseB = {
        id: type.id,
        direction: 'b->a',
        name: this.translate.instant(
          `relation.construct.${type.name}_b`,
          {aConstruct: '', bConstruct: ''}
        )
      };
      sTypes.push(phraseB);
    }
    return sTypes;
  }

  getMaterialRelationTypes(types: any) {
    const sTypes = [];

    for (const type of types) {
      const phrase = {
        id: type.id,
        direction: 'b->a',
        name: this.translate.instant(
          `relation.study_material.${type.name}_b`,
          {construct: '', material: ''})
      };
      sTypes.push(phrase);
    }
    return sTypes;
  }

  getPossibleConstructLinks(construct: Construct) {
    if (!construct) {
      return [];
    }

    return this.constructs.filter(c => {
      if (c.id === construct.id) {
        return false;
      }
      if (construct.head_constructs.find(hc => hc.id === c.id)) {
        return false;
      }
      if (construct.tail_constructs.find(tc => tc.id === c.id)) {
        return false;
      }
      return true;
    });
  }

  resetLinkConstructForm() {
    this.linkConstructForm.patchValue({
      aConstruct: null,
      bConstruct: null,
      type: null
    });
    this.resetFormValidation(this.linkConstructForm);
  }

  resetLinkMaterialForm() {
    this.linkMaterialForm.patchValue({
      construct: null,
      material: null,
      type: null
    });
    this.existingMaterialLinks = [];
    this.resetFormValidation(this.linkMaterialForm);
  }

  linkConstructs() {
    if (this.validateForm(this.linkConstructForm)) {
      let tailConstruct;
      let headConstruct;
      if (this.linkConstructC.type.value.direction === 'a->b') {
        tailConstruct = this.linkConstructC.aConstruct.value;
        headConstruct = this.linkConstructC.bConstruct.value;
      } else {
        tailConstruct = this.linkConstructC.bConstruct.value;
        headConstruct = this.linkConstructC.aConstruct.value;
      }

      this.constructService.linkConstruct(
        headConstruct.id,
        tailConstruct.id,
        this.linkConstructC.type.value.id,
      ).subscribe((res: Construct[]) => this.constructs = this.overwriteMemory(this.constructs, res));

      this.linkConstructModal.close('Link Click');
    }
  }

  deleteConstructLink(headConstruct: Construct, tailConstruct: Construct) {
    this.constructService.deleteConstructLink(
      headConstruct.id,
      tailConstruct.id
    ).subscribe((res: Construct[]) => {
      this.constructs = this.overwriteMemory(this.constructs, res);
      this.possibleConstructLinks = this.getPossibleConstructLinks(this.linkConstructC.aConstruct.value);
    });
  }

  getPossibleMaterialLinks(construct: Construct): Activity[] {
    const activityIds = construct.activities.map(a => a.id);
    return this.studyMaterial.filter(m => activityIds.indexOf(m.id) === -1);
  }

  setLinkMaterialItem(construct: Construct) {
    this.linkMaterialForm.patchValue({construct});
    this.resetControls(this.linkMaterialForm, {material: null, type: null});
    this.existingMaterialLinks = construct.activities.filter(a => ActivityStatic.isActivityOfType(a, 'material'));
    this.possibleMaterialLinks = this.getPossibleMaterialLinks(construct);
    this.existingMaterialLabels = {
      name: item => this.translate.instant(
        `relation.study_material.${item.relation_type}_b`,
        {construct: construct.name, material: item.title}
      )
    };
  }

  linkMaterial() {
    if (this.validateForm(this.linkMaterialForm)) {
      const actions = [];
      for (const activity of (this.linkMaterialC.material.value as Activity[])) {
        actions.push(
          this.constructService.linkActivity(
            this.linkMaterialC.construct.value.id,
            activity.id,
            this.linkMaterialC.type.value.id
          )
        );
      }
      forkJoin(actions).subscribe();
      this.linkMaterialModal.close('Link Click');
    }
  }

  deleteMaterialLink(construct: Construct, activity: Activity) {
    this.constructService.deleteActivityLink(
      construct.id,
      activity.id
    ).subscribe((res: any[]) => {
      this.existingMaterialLinks = construct.activities.filter(a => ActivityStatic.isActivityOfType(a, 'material'));
      this.possibleMaterialLinks = this.getPossibleMaterialLinks(construct);
    });
  }

  delete() {
    this.constructService.delete(this.deletingItem.id).subscribe((res: Construct[]) => this.constructs = res);
  }

}
