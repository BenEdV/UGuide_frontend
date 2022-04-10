import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseAdministrationComponent } from '../base-administration/base-administration.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from 'src/app/core/services/collection/activity.service';
import { Activity } from 'src/app/core/interfaces/activity';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-administration-exam',
  templateUrl: './administration-exam.component.html',
  styleUrls: ['./administration-exam.component.scss']
})
export class AdministrationExamComponent extends BaseAdministrationComponent implements OnInit {
  @ViewChild('importResultsModal', {static: true}) importResultsModal;
  exams: Activity[];
  visibilityTypes: any[];
  remotes: any[];
  remoteNames$: Observable<any>;
  previousRemoteName = '';
  remoteMoments$: Observable<any>;
  importResultsItem: Activity;

  addForm = new FormGroup({
    title: new FormControl(''),
    description: new FormControl(''),
    visibility: new FormControl(null, Validators.required),
    remote: new FormControl(null, Validators.required),
    remoteName: new FormControl(null, Validators.required),
    remoteMoment: new FormControl(null, Validators.required),
    importExamResultsOnCompletion: new FormControl(true),
    importQuestionResultsOnCompletion: new FormControl(true),
    importResultsOnClose: new FormControl(true),
    updateGroupScoresOnClose: new FormControl(true)
  });

  editForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    visibility: new FormControl(null, Validators.required)
  });

  visibilityLabel = (item: any) => this.translate.instant('admin.exam.' + item.name);


  constructor(private route: ActivatedRoute,
              private router: Router,
              public activityService: ActivityService,
              private translate: TranslateService,
              modal: NgbModal) {
    super(route, modal);
  }

  ngOnInit() {
    this.exams = this.route.snapshot.data.activities.examList;
    this.visibilityTypes = this.route.snapshot.data.types.visibility;
    this.remotes = this.route.snapshot.data.remotes;
    this.tableActions.push({
      name: 'table.action.import_results',
      icon: 'import-icon',
      callback: (entry) => {
        this.importResultsItem = entry;
        this.importResultsModal.open();
      }
    }, {
      name: 'table.action.link_constructs',
      icon: 'construct-link-icon',
      callback: (entry) => {
        this.router.navigate(['..', 'mapping'], {relativeTo: this.route, queryParams: {editId: entry.id}});
      }
    });

    const exam = super.resolveEditId(this.exams);
    if (exam) {
      this.setEditingItem(exam);
      this.editModal.open();
    }
  }

  add() {
    if (this.validateForm(this.addForm)) {
      const properties = {
        import_exam_result_on_completion: this.addC.importExamResultsOnCompletion.value,
        import_question_result_on_completion: this.addC.importQuestionResultsOnCompletion.value,
        import_results_on_close: this.addC.importResultsOnClose.value,
        update_group_scores_on_close: this.addC.updateGroupScoresOnClose.value
      };
      this.activityService.importExam(
        this.addC.remote.value.code,
        this.addC.remoteName.value.remote_exam_id,
        this.addC.title.value,
        this.addC.visibility.value.value,
        [this.addC.remoteMoment.value.id],
        properties
      ).pipe(
        switchMap(() => this.activityService.exams()) // override default return value of all activities
      ).subscribe((res: Activity[]) => this.exams = res);
      this.addForm.patchValue({
        title: '',
        description: '',
        visibility: null,
        remote: null,
        remoteName: null,
        remoteMoment: null,
        importExamResultsOnCompletion: true,
        importQuestionResultsOnCompletion: true,
        importResultsOnClose: true,
        updateGroupScoresOnClose: true
      });
      this.finaliseAdd();
    }
  }

  setEditingItem(exam: Activity) {
    super.setEditingItem(exam);

    this.editForm.patchValue({
      title: exam.title,
      description: exam.description,
      visibility: exam.visible
    });
  }

  edit() {
    if (this.validateForm(this.editForm)) {
      if (this.editForm.dirty) {
        this.activityService.editExam(
          this.editingItem.id,
          this.editC.title.value,
          this.editC.description.value,
          this.editC.visibility.value.value
        ).subscribe((res: Activity) => this.exams = this.overwriteMemory(this.exams, [res]));
      }
      this.finaliseEdit();
    }
  }

  delete() {
    this.activityService.delete(this.deletingItem.id).pipe(
      switchMap(() => this.activityService.exams()) // override default return value of all activities
    ).subscribe((res: Activity[]) => this.exams = res);
  }

  setRemoteNames() {
    this.addForm.patchValue({
      remoteName: null
    });

    if (this.addC.remote.value) {
      this.remoteNames$ = this.activityService.getRemoteNames(this.addC.remote.value.code);
    }
  }

  setRemoteMoments() {
    this.addForm.patchValue({
      remoteMoment: null
    });

    if (this.addC.remoteName.value) {
      if (this.addC.title.value === '' || this.addC.title.value === this.previousRemoteName) {
        this.addForm.patchValue({
          title: this.addC.remoteName.value.title
        });
      }
      this.previousRemoteName = this.addC.remoteName.value.title;
      this.remoteMoments$ = this.activityService.getRemoteMoments(this.addC.remote.value.code, this.addC.remoteName.value.remote_exam_id);
    }
  }

  importResults() {
    this.activityService.loadExamResults(this.importResultsItem.id).subscribe();
  }

}
