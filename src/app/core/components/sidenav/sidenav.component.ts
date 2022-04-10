import { Component, OnInit } from '@angular/core';
import { SidenavService } from '../../services/components/sidenav.service';
import { RouteParamsService } from '../../services/route-params.service';
import { NavItem } from '../../interfaces/nav-item';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  navItemsExpanded = {};

  constructor(public sidenavService: SidenavService,
              public routeParams: RouteParamsService,
              private router: Router) {
    this.routeParams.routeSnapshot.subscribe(() => {
      this.navItemsExpanded = {};
    });
  }

  ngOnInit() {
  }

  toggleNavItemCollapse(key: string) {
    this.navItemsExpanded[key] = !this.navItemsExpanded[key];
  }

  isSubmenuOpen(navItem: NavItem, active: boolean = false): boolean {
    if (this.navItemsExpanded[navItem.key] !== undefined) {
      return this.navItemsExpanded[navItem.key];
    }

    active = this.isRouteActive(navItem, active);
    if (active) {
      this.navItemsExpanded[navItem.key] = active;
    }

    return active;
  }

  isRouteActive(navItem: NavItem, active: boolean = false): boolean {
    if (navItem.routerLinkActiveOverride) {
      return this.router.isActive(
        this.router.createUrlTree(['collections', this.sidenavService.collection.id].concat(navItem.routerLinkActiveOverride)),
        false
      );
    }

    return active;
  }

}
