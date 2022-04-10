import { Component, OnInit } from '@angular/core';
import { BaseAdministrationComponent } from '../base-administration/base-administration.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Activity } from 'src/app/core/interfaces/activity';
import { ActivityService } from 'src/app/core/services/collection/activity.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { switchMap } from 'rxjs/operators';
import { ConstructService } from 'src/app/core/services/collection/constructs/construct.service';

@Component({
  selector: 'app-administration-survey',
  templateUrl: './administration-survey.component.html',
  styleUrls: ['./administration-survey.component.scss']
})
export class AdministrationSurveyComponent extends BaseAdministrationComponent implements OnInit {
  surveys: Activity[];
  visibilityTypes: any[];
  surveyTypeId: number;

  addForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    visibility: new FormControl(null, Validators.required),
    properties: new FormGroup({})
  });

  editForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    visibility: new FormControl(null, Validators.required),
    properties: new FormGroup({})
  });

  visibilityLabel = (item: any) => this.translate.instant('admin.survey.' + item.name);

  constructor(private route: ActivatedRoute,
              modal: NgbModal,
              private router: Router,
              private activityService: ActivityService,
              private constructService: ConstructService,
              private translate: TranslateService) {
    super(route, modal);
  }

  ngOnInit(): void {
    this.surveys = this.route.snapshot.data.activities.surveyList;
    this.visibilityTypes = this.route.snapshot.data.types.visibility;
    this.surveyTypeId = this.route.snapshot.data.types.survey.id;

    this.tableActions.push({
      name: this.translate.instant('admin.survey.manage_content'),
      icon: 'question-link-icon',
      callback: (survey: Activity) => {
        this.router.navigate([survey.id], {relativeTo: this.route});
      }
    });
   }

   add() {
    if (this.validateForm(this.addForm)) {
      this.activityService.addSurvey(
        this.addC.title.value,
        this.addC.description.value,
        this.surveyTypeId,
        this.addC.visibility.value.value,
        this.parseProperties(this.addC.properties),
      ).pipe(
        switchMap(() => this.activityService.surveys()) // override default return value of all activities
      ).subscribe((res: Activity[]) => this.surveys = res);
      this.addForm.patchValue({
        title: '',
        description: '',
        visibility: null
      });
      this.finaliseAdd();
    }
   }

   setEditingItem(survey: Activity) {
    super.setEditingItem(survey);

    this.editForm.patchValue({
      title: survey.title,
      description: survey.description,
      visibility: survey.visible
    });

    const properties = {};
    for (const key of Object.keys(this.editC.properties.value)) {
      properties[key] = survey.properties && survey.properties[key];
    }
    this.editC.properties.patchValue(properties);
  }

   edit() {
    if (this.validateForm(this.editForm)) {
      if (this.editForm.dirty) {
        this.activityService.editSurvey(
          this.editingItem.id,
          this.editC.title.value,
          this.editC.description.value,
          this.surveyTypeId,
          this.editC.visibility.value.value,
          this.parseProperties(this.editC.properties)
        ).subscribe((res: Activity) => this.surveys = this.overwriteMemory(this.surveys, [res]));
      }
      this.finaliseEdit();
    }
   }

   goToQuestionsFromEdit() {
     this.edit();
     this.router.navigate([this.editingItem.id], {relativeTo: this.route});
   }

   delete() {
    this.activityService.delete(this.deletingItem.id).pipe(
      switchMap(() => this.activityService.surveys()) // override default return value of all activities
    ).subscribe((res: Activity[]) => this.surveys = res);
   }

}
