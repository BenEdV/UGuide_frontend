import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Construct } from '../../core/interfaces/construct';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedStatic } from '@shared/shared.static';

@Component({
  selector: 'app-construct-list',
  templateUrl: './construct-list.component.html',
  styleUrls: ['./construct-list.component.scss']
})
export class ConstructListComponent implements OnInit, AfterViewInit {
  constructs: Construct[];

  constructor(private route: ActivatedRoute, private router: Router) {
    this.constructs = this.route.snapshot.data.constructs;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    SharedStatic.setInjectedElement(document.querySelector('.administration-link'), {
      bind: this,
      onclick: this.goToAdministration
    });
  }

  goToAdministration() {
    this.router.navigate(['/', 'collections', this.route.snapshot.data.collection.id, 'administration', 'constructs']);
  }

}
