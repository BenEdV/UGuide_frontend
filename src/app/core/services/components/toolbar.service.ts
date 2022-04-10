import { Injectable } from '@angular/core';
import { HistoryTab } from '../../interfaces/history-tab';
import { AuthService } from './../auth.service';
import { Collection } from '../../interfaces/collection';

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {
  historyTabs: HistoryTab[] = [];
  private maxLength = 10;
  private storageName: string;

  constructor(private authService: AuthService) {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.storageName = 'history' + user.id;
        const history = localStorage.getItem(this.storageName);
        if (history !== null) {
          this.historyTabs = JSON.parse(history);
        }
      } else {
        this.historyTabs = [];
      }
    });
  }

  addTab(historyTab: HistoryTab, collection: Collection = null) {
    if (collection) {
      Object.assign(historyTab, {
        collectionId: collection.id,
        collectionName: collection.course_instance ? collection.course_instance.course.name : collection.name});
    }

    if (!historyTab.iconClasses) {
      this.assignIcon(historyTab);
    }
    const idx = this.indexOfTab(historyTab);
    if (idx === -1) {
      this.historyTabs = [historyTab, ...this.historyTabs.slice(0, this.maxLength - 1)];
    } else {
      this.historyTabs = [historyTab, ...this.historyTabs.slice(0, idx), ...this.historyTabs.slice(idx + 1, this.maxLength - 1)];
    }

    localStorage.setItem(this.storageName, JSON.stringify(this.historyTabs));
  }

  assignIcon(historyTab: HistoryTab) {
    if (historyTab.link.includes('exams')) {
      historyTab.iconClasses = 'exam-icon';
    } else if (historyTab.link.includes('constructs')) {
      historyTab.iconClasses = 'construct-icon';
    } else if (historyTab.link.includes('surveys')) {
      historyTab.iconClasses = 'survey-icon';
    } else if (historyTab.link.includes('material')) {
      historyTab.iconClasses = 'study-material-icon';
    } else if (historyTab.link.includes('groups')) {
      historyTab.iconClasses = 'group-icon';
    } else if (historyTab.link.includes('students')) {
      historyTab.iconClasses = 'student-icon';
    }
  }

  indexOfTab(historyTab: HistoryTab): number {
    for (let i = 0; i < this.historyTabs.length; i++) {
      if (this.historyTabs[i].link.length !== historyTab.link.length) {
        continue;
      }

      let equal = true;
      for (let j = 0; j < this.historyTabs[i].link.length && equal; j++) {
        if (this.historyTabs[i].link[j] !== historyTab.link[j]) {
          equal = false;
        }
      }

      if (equal) {
        return i;
      }
    }

    return -1;
  }

}
