import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Activity } from 'src/app/core/interfaces/activity';
import { Construct } from 'src/app/core/interfaces/construct';
import { Participant } from 'src/app/core/interfaces/participant';

export interface StudentSetParams {
  title: string;
  titleExtras?: {[key: string]: any};
  studentIds: number[];
  examIds?: number[];
  constructIds?: number[];
}

@Component({
  selector: 'app-student-set',
  templateUrl: './student-set.component.html',
  styleUrls: ['./student-set.component.scss']
})
export class StudentSetComponent implements OnInit {
  title: string;
  titleExtras: {[key: string]: any} = {};
  studentIds: number[] = [];
  studentSet: Participant[];
  students: Participant[];
  exams: Activity[];
  constructs: Construct[];
  examIds: number[];
  constructIds: number[];

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.title = 'student.set.section_title.' + this.route.snapshot.queryParams.title;

    const paramsTitleExtras = this.parseArrayQueryParams(this.route.snapshot.queryParams.titleExtras);
    if (paramsTitleExtras) { // create translate params
      for (let i = 0; i < paramsTitleExtras.length; i++) {
        this.titleExtras['var' + i] = paramsTitleExtras[i];
      }
    }

    const paramsStudentIds = this.parseArrayQueryParams(this.route.snapshot.queryParams.studentIds);
    if (paramsStudentIds) {
      this.studentIds = paramsStudentIds.map(id => +id);
    }

    const paramsExamIds = this.parseArrayQueryParams(this.route.snapshot.queryParams.examIds);
    if (paramsExamIds) {
      this.examIds = paramsExamIds.map(id => +id);
    }

    const paramsConstructIds = this.parseArrayQueryParams(this.route.snapshot.queryParams.constructIds);
    if (paramsConstructIds) {
      this.constructIds = paramsConstructIds.map(id => +id);
    }

    this.students = this.route.snapshot.data.participants.studentList;
    this.exams = this.route.snapshot.data.activities.examList;
    this.constructs = this.route.snapshot.data.constructs;

    this.studentSet = this.students.filter(student => this.studentIds.indexOf(student.id) !== -1);
  }

  parseArrayQueryParams(param): string[] { // refresh with only 1 item in the queryParams will break the array, so we parse
    if (param) {
      if (Array.isArray(param)) {
        return param;
      } else {
        return [param];
      }
    }

    return null;
  }

}
