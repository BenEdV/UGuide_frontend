import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RouteParamsService } from '../../services/route-params.service';
import { Observable } from 'rxjs';
import { User } from '../../interfaces/user';
import { SidenavService } from '../../services/components/sidenav.service';
import { ToolbarService } from '../../services/components/toolbar.service';
import { environment } from 'src/environments/environment';
import { SidebarService } from '../../services/components/sidebar.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  toolbarVisible = true;
  user$: Observable<User>;

  isMenuCollapsed = true;
  projectName = environment.project_name;
  showProjectName = environment.show_project_name;
  productName = environment.product_name;
  showPoweredBy = environment.show_powered_by;

  constructor(public routeParams: RouteParamsService,
              public authService: AuthService,
              public sidenavService: SidenavService,
              public toolbarService: ToolbarService,
              public translate: TranslateService,
              private sidebarService: SidebarService,
              private router: Router) {
      this.user$ = this.authService.user$;

      this.routeParams.dataAsObservable('toolbar').subscribe(value => {
        this.toolbarVisible = value !== false;
      });
    }

  ngOnInit() {
  }

  toggleSidenav() {
    this.sidenavService.toggle();
    this.sidebarService.hideBarIfMobile();
    this.isMenuCollapsed = true; // make sure the menu's don't overlap
  }

  toggleNavbar() {
    this.sidenavService.hideNavIfMobile();
    this.sidebarService.hideBarIfMobile();
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  useLanguage(language: string) {
    this.authService.updateSettings({lang: language}).subscribe();
  }

  goToHomepage() {
    this.router.navigateByUrl(environment.dashboard_homepage || '/');
  }

}
