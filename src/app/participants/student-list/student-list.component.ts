import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Participant } from 'src/app/core/interfaces/participant';
import { Activity } from 'src/app/core/interfaces/activity';
import { Construct } from 'src/app/core/interfaces/construct';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit {
  students: Participant[];
  exams: Activity[];
  constructs: Construct[];

  constructor(private route: ActivatedRoute) {
    this.students = this.route.snapshot.data.participants.studentList;
    this.exams = this.route.snapshot.data.activities.examList;
    this.constructs = this.route.snapshot.data.constructs;
  }

  ngOnInit() {
  }

}
