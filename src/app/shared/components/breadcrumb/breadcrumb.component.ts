import { Component, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { RouteParamsService } from '../../../core/services/route-params.service';
import { Breadcrumb } from '../../../core/interfaces/breadcrumb';
import { ActivatedRouteSnapshot, PRIMARY_OUTLET } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Collection } from 'src/app/core/interfaces/collection';
import { AuthService } from 'src/app/core/services/auth.service';
import { CollectionStatic } from 'src/app/collections/collection.static';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  providers: [TitleCasePipe]
})
export class BreadcrumbComponent implements OnChanges, OnDestroy {
  public breadcrumbs: Breadcrumb[] = [];
  private snapshotSubscription;
  private snapshotRoot;

  constructor(private routeParams: RouteParamsService,
              private titleCasePipe: TitleCasePipe,
              private translate: TranslateService,
              private authService: AuthService) {
    this.snapshotSubscription = this.routeParams.routeSnapshot.subscribe(snapshot => {
      this.snapshotRoot = snapshot.root;
      this.breadcrumbs = this.getBreadcrumbs(this.snapshotRoot);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const key of Object.keys(changes)) {
      this.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.label === changes[key].previousValue) {
          breadcrumb.label = changes[key].currentValue;
        }
      });
    }
  }

  ngOnDestroy() {
    this.snapshotSubscription.unsubscribe();
  }

  getBreadcrumbs(route: ActivatedRouteSnapshot, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) { // for each child route
      if (child.outlet !== PRIMARY_OUTLET) { // verify primary route
        continue;
      }

      url += '/' + child.url.map(segment => segment.path).join('/'); // get the route's URL segment

      if (child.url[0]) {
        breadcrumbs.push( // add breadcrumb
          {
            label: this.getBreadcrumbLabel(child),
            params: child.params,
            url: this.getUrl(child, url)
          }
        );
      }

      return this.getBreadcrumbs(child, url, breadcrumbs);
    }
  }

  getBreadcrumbLabel(route: ActivatedRouteSnapshot): string {
    let path = route.url[0].path;
    const routeVariable = route.routeConfig.path.split(':')[1];

    if (path === 'collections' && route.children.find(r => r.outlet === PRIMARY_OUTLET)?.data.collection?.course_instance_id) {
      path = 'courses';
    }

    if (!routeVariable) {
      return this.titleCasePipe.transform(this.translate.instant('breadcrumb.' + path));
    } else if (routeVariable === 'collectionId' && route.data.collection?.course_instance) {
      return route.data.collection.course_instance.course.name;
    } else {
      const variableWithoutId = routeVariable.slice(0, routeVariable.length - 2);
      return route.data[variableWithoutId] &&
             (route.data[variableWithoutId].name || route.data[variableWithoutId].title) ||
             this.titleCasePipe.transform(path);
    }
  }

  getUrl(route: ActivatedRouteSnapshot, url: string): string {
    const collection: Collection = route.children.find(r => r.outlet === PRIMARY_OUTLET)?.data.collection;
    if (url === '/collections' && collection?.course_instance_id) {
      url = '/courses';
    } else if (route.routeConfig.path === ':collectionId') {
      const maySeeUserResults = this.authService.checkPermissions(['see_user_results'], collection);
      const routeExtension = CollectionStatic.getColectionRoute(maySeeUserResults);
      return `${url}/${routeExtension}`;
    }

    return url;
  }

  reload() {
    location.reload();
  }

}
