import { HistoryTab } from './history-tab';

export interface NavItem {
  name: string;                       // display name in the side-nav
  key: string;                        // unique key to identify a page with
  modules: string[];                  // list of modules (module = set of pages) the page belongs to
  link: any[];                        // router link
  data: any;                          // the route data for the route that corresponds to this NavItem
  children: NavItem[];                // permanent sub menu items
  tabs: HistoryTab[];                 // list of tabs that will appear below the children
  routerLinkActiveOverride?: any[];   // link that will make the NavItem active, if none is provide link will be used
  iconClasses?: string;               // css icon classes that will be displayed in front of the name
  permissions?: string[];             // permissions required for the NavItem to show up in the sidenav
  roles?: string[];                   // roles required for the NavItem to show up in the sidenav
}
