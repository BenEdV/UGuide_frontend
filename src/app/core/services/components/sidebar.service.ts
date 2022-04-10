import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  mobileBreakpoint = 1200;


  isCollapsedSubject = new BehaviorSubject<boolean>(window.innerWidth < this.mobileBreakpoint);
  isCollapsed$ = this.isCollapsedSubject.asObservable();

  isVisibleSubject = new BehaviorSubject<boolean>(false);
  isVisible$ = this.isVisibleSubject.asObservable();

  constructor() { }

  get isCollapsed() { return this.isCollapsedSubject.value; }

  get isVisible() { return this.isVisibleSubject.value; }

  hideBarIfMobile() {
    if (window.innerWidth < this.mobileBreakpoint) {
      this.isCollapsedSubject.next(true);
    }
  }

}
