import { AfterViewInit, Component, Input, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { SidebarService } from '../../../core/services/components/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sidebar', { read: ViewContainerRef, static: true }) sidebar;
  @Input() title: string;

  constructor(public sidebarService: SidebarService) {
    this.sidebarService.isVisibleSubject.next(true);
  }

  ngAfterViewInit() {
    // Use setTimeout to enable transition effects after the sidebar is initialised at the right location
    setTimeout(() => this.sidebar.element.nativeElement.classList.add('sidebar-transition'));
  }

  ngOnDestroy(): void {
    this.sidebarService.isVisibleSubject.next(false);
    this.sidebarService.hideBarIfMobile();
  }

  collapseSidebar() {
    this.sidebarService.isCollapsedSubject.next(true);
  }

  showSidebar() {
    this.sidebarService.isCollapsedSubject.next(false);
  }

}
