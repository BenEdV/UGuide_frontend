import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import * as Chart from 'chart.js';
import { durationScale, durationConfig } from 'src/app/shared/charts/chart-scales';
import * as datalabels from 'chartjs-plugin-datalabels';
import { RouteParamsService } from './core/services/route-params.service';
import { SidenavService } from './core/services/components/sidenav.service';
import { SidebarService } from './core/services/components/sidebar.service';
import { NgSelectConfig } from '@ng-select/ng-select';
import { environment } from 'src/environments/environment';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('content', { read: ViewContainerRef, static: true }) content;
  showBreadcrumbs = !environment.hide_breadcrumbs;

  constructor(public routeParams: RouteParamsService,
              public sidenavService: SidenavService,
              public sidebarService: SidebarService,
              private ngSelectConfig: NgSelectConfig,
              private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle(environment.project_name || environment.product_name); // https://angular.io/guide/set-document-title

    // Set mr-0 here rather than in view to handle ExpressionChangedAfterItHasBeenChecked due to *ngIf or *appHasPermission on the sidebar
    this.sidebarService.isVisible$.subscribe(isVisible => {
      if (isVisible && !this.sidebarService.isCollapsed) {
        this.content.element.nativeElement.classList.remove('mr-0');
      } else {
        this.content.element.nativeElement.classList.add('mr-0');
      }
    });

    this.sidebarService.isCollapsed$.subscribe(isCollapsed => {
      if (!this.sidebarService.isVisible || isCollapsed) {
        this.content.element.nativeElement.classList.add('mr-0');
      } else {
        this.content.element.nativeElement.classList.remove('mr-0');
      }
    });

    this.ngSelectConfig.notFoundText = 'Nothing to show'; // TODO: add translation
    this.ngSelectConfig.appendTo = 'body';

    this.unregisterChartPlugins();
  }

  unregisterChartPlugins() {
    // Chart plugins are enabled globally by default, so we need to unregister them if we want to use them only for specific charts
    Chart.plugins.unregister(datalabels as any);
    (Chart.scaleService as any).registerScaleType('duration', durationScale, durationConfig);
  }

}
