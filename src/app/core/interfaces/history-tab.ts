export interface HistoryTab {
  name: string;             // display name in the side-nav
  link: any[];              // router link
  removable?: boolean;      // can it be removed from the sidenav?
  collectionId?: number;
  collectionName?: string;
  iconClasses?: string;     // (Font-Awesome) icon classes to display in front of the name (e.g. fa fa-clipboard)
  closeLink?: any[];        // router link to navigate to when the tab is closed
}
