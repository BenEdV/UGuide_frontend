import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ExamQuestionComponent } from 'src/app/activity/exam-question/exam-question.component';

type TitleSectionTypes = 'construct' | 'model' | 'exam' | 'question' | 'studyMaterial' | 'group';

@Component({
  selector: 'app-title-section',
  templateUrl: './title-section.component.html',
  styleUrls: ['./title-section.component.scss']
})
export class TitleSectionComponent implements OnChanges {
  @Input() item: any;
  @Input() type: TitleSectionTypes;
  @Input() title: string;
  @Input() description: string;

  key: string;
  displayTitle: string;
  administrationPermissions: string[];
  administrationLink: string[];
  administrationQueryParams: object;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.item) {
      if (!this.title) {
        this.displayTitle = this.item.title || this.item.name;
      }

      if (!this.description) {
        this.description = this.item.description;
      }

      this.setPermissions();
      this.setAdministrationLink();
    }

    if (!this.displayTitle) {
      this.displayTitle = this.title;
    }
  }

  setAdministrationLink() {
    const prefix = ['/', 'collections', this.route.snapshot.params.collectionId, 'administration'];
    this.administrationQueryParams = null;
    if (this.type === 'construct') {
      this.administrationLink = [...prefix, 'constructs'];
    } else if (this.type === 'exam') {
      this.administrationLink = [...prefix, 'exams'];
    } else if (this.type === 'question') {
      this.administrationLink = [...prefix, 'exams'];
      const exam = ExamQuestionComponent.getExam(this.item);
      if (exam) {
        this.administrationQueryParams = {editId: exam.id};
      }
    } else if (this.type === 'studyMaterial') {
      this.administrationLink = [...prefix, 'material'];
    } else if (this.type === 'group') {
      this.administrationLink = [...prefix, 'groups'];
    }

    if (!this.administrationQueryParams) {
      this.administrationQueryParams = {editId: this.item.id};
    }
  }

  setPermissions() {
    if (this.type === 'construct') {
      this.administrationPermissions = ['manage_constructs'];
    } else if (this.type === 'exam' || this.type === 'question') {
      this.administrationPermissions = ['manage_activities'];
    } else if (this.type === 'studyMaterial') {
      this.administrationPermissions = ['manage_activities'];
    }
  }

}
