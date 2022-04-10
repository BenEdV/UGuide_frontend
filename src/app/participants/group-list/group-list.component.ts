import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Collection } from 'src/app/core/interfaces/collection';
import { Construct } from 'src/app/core/interfaces/construct';
import { Activity } from 'src/app/core/interfaces/activity';
import { SharedStatic } from '@shared/shared.static';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss']
})
export class GroupListComponent implements OnInit, AfterViewInit {
  groups: Collection[];
  constructs: Construct[];
  exams: Activity[];

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.groups = this.route.snapshot.data.groups;
    this.constructs = this.route.snapshot.data.constructs;
    this.exams = this.route.snapshot.data.activities.examList;
  }

  ngAfterViewInit() {
    SharedStatic.setInjectedElement(document.querySelector('.administration-link'), {
      bind: this,
      onclick: this.goToAdministration
    });
  }

  goToAdministration() {
    this.router.navigate(['/', 'collections', this.route.snapshot.data.collection.id,  'administration', 'groups']);
  }

}
