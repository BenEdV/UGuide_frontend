import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToHomepage() {
    this.router.navigateByUrl(environment.dashboard_homepage || '/');
  }

}
