import { Injectable } from '@angular/core';
import { NavItem } from '../../interfaces/nav-item';
import { Route, Router } from '@angular/router';
import { Collection } from '../../interfaces/collection';
import { RouteParamsService } from './../route-params.service';
import { CollectionService } from './../collection/collection.service';
import { AuthService } from './../auth.service';
import { HistoryTab } from '../../interfaces/history-tab';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  mobileBreakpoint = 768; // width in pixels delimiting when to use mobile behavior (bootstrap md)

  visibleNavItems: NavItem[];

  isCollapsed: boolean = window.innerWidth < this.mobileBreakpoint;
  private visible = true;

  collection: Collection;

  private allNavItems: NavItem[];

  private allNavTabs = {};
  private allTabCounters = {};
  private maxTabLength = 3;

  constructor(private authService: AuthService,
              private router: Router,
              private routeParams: RouteParamsService,
              private collectionService: CollectionService) {
    this.authService.user$.subscribe(user => {
      if (!user) { // reset service on logout
        this.reset();
      }
    });

    this.routeParams.dataAsObservable('sidenav').subscribe(value => {
      this.visible = value !== false;
    });

    this.collectionService.activeCollection.subscribe(collection => {
      this.collection = collection;
      this.updateNavItems();
    });

    // Get accessible routes for collections
    const routes = this.router.config.find(route => route.path === 'collections')
      .children.find(route => route.path === ':collectionId').children || [];

    this.allNavItems = this.createNavItemsFromRoutes(routes);
  }

  get isVisible(): boolean {
    return !environment.hide_sidenav && this.visible;
  }

  createNavItemsFromRoutes(routes: Route[], pathPrefix: string[] = null): NavItem[] {
    const result = [];
    if (pathPrefix === null) {
      pathPrefix = [];
    }
    for (const route of routes) {
      route.data = route.data || {}; // to prevent cannot access property of undefined

      // exclude paths that are just router-outlets, are meant for redirection, or are entity viewers and require a parameter
      if (route.path !== '' && route.path[0] !== ':' && !route.data.hideFromNav) {
        const navItem: NavItem = {
          key: route.data.key || [...pathPrefix, route.path].join('/'),
          modules: route.data.modules || [],
          name: route.data.name || route.path,
          iconClasses: route.data.iconClasses || '',
          link: route.path.length === 0 ? [] : pathPrefix ? [...pathPrefix, route.path] : [route.path],
          permissions: route.data.permissions,
          roles: route.data.roles,
          tabs: [],
          children: [],
          data: route.data || {}
        };

        if (route.children) {
          navItem.children = this.createNavItemsFromRoutes(route.children, navItem.link);
        }

        result.push(navItem);
      }
    }

    return result;
  }

  get navTabs() { return this.allNavTabs[this.collection.id]; }
  set navTabs(value) { this.allNavTabs[this.collection.id] = value; }

  get tabCounters() { return this.allTabCounters[this.collection.id]; }
  set tabCounters(value) { this.allTabCounters[this.collection.id] = value; }

  addTab(navItemKey: string, name: string, link: (string | number)[], collection: Collection,
         closeLink?: (string | number)[], iconClasses?: string, removable: boolean = true) {
    const navTab: HistoryTab = {
      name,
      link,
      removable,
      collectionId: collection.id,
      closeLink,
      iconClasses
    };
    const collectionId = navTab.collectionId;

    if (!this.allNavTabs[collectionId]) {
      this.allNavTabs[collectionId] = {};
      this.allTabCounters[collectionId] = {};
    }

    if (!this.allNavTabs[collectionId][navItemKey]) {
      this.allNavTabs[collectionId][navItemKey] = [];
      this.allTabCounters[collectionId][navItemKey] = 0;
    }

    for (const existingTab of this.allNavTabs[collectionId][navItemKey]) { // Check if tab already exists
      if (this.arrayEqual(existingTab.link, navTab.link)) {
        return;
      }
    }

    const insertIndex = this.allTabCounters[collectionId][navItemKey] % this.maxTabLength;
    this.allNavTabs[collectionId][navItemKey][insertIndex] = navTab;
    this.allTabCounters[collectionId][navItemKey]++;
    this.updateNavItems();
  }

  removeTab(navItemKey: string, navTabIndex: number, active: boolean = false) {
    if (active && this.navTabs[navItemKey][navTabIndex].closeLink) {
      this.router.navigate(['collections', this.collection.id].concat(this.navTabs[navItemKey][navTabIndex].closeLink));
    }

    this.navTabs[navItemKey].splice(navTabIndex, 1);
    this.tabCounters[navItemKey] = this.maxTabLength - (this.maxTabLength - this.navTabs[navItemKey].length);
    this.updateNavItems();
  }

  updateNavItems() {
    if (this.collection) {
      this.visibleNavItems = this.getNavItemsWithKeys(this.allNavItems, this.collection.pages);
    }
  }

  private getNavItemsWithKeys(navItems: NavItem[], pageKeys: string[]): NavItem[] {
    const result: NavItem[] = [];
    for (const key of pageKeys) {
      const originalNavItems = navItems.filter(item => item.key === key || item.modules.indexOf(key) !== -1);

      if (originalNavItems.length === 0) {
        continue;
      }

      for (const originalNavItem of originalNavItems) {
        const navItem = {...originalNavItem}; // copy to prevent editing the source
        navItem.tabs = this.navTabs?.[originalNavItem.key] || [];
        if (navItem.children) {
          navItem.children = this.getNavItemsWithKeys(navItem.children, pageKeys);
        }
        if (navItem.data.redirectToFirstChild) {
          if (navItem.children.length === 0) {
            continue; // do not add containers without children
          }
          navItem.routerLinkActiveOverride = navItem.link;
          navItem.link = navItem.children[0].link;
        }
        result.push(navItem);
      }
    }

    return result;
  }

  private arrayEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }

    for (let i = 0; i < arr1.length; i++) { // Check if all items exist and are in the same order
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }

    return true; // Otherwise, return true
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
  }

  hideNavIfMobile() {
    if (window.innerWidth < this.mobileBreakpoint && !this.isCollapsed) {
      this.isCollapsed = true;
    }
  }

  reset() {
    this.allNavTabs = {};
    this.allTabCounters = {};
  }

}
