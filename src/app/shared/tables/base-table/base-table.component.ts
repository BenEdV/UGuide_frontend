import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CardAction } from '../../../core/interfaces/card-action';
import { Options } from '@m0t0r/ngx-slider';
import { ToastService } from '../../../core/services/components/toast.service';
import { LoggingService } from '../../../core/services/logging.service';
import { TableAction } from '../../../core/interfaces/table-action';

@Component({
  selector: 'app-table',
  templateUrl: './base-table.component.html',
  styleUrls: ['./base-table.component.scss']
})
export class BaseTableComponent implements OnChanges {
  @Input() data: object[];              // list of objects to display in the table
  @Input() keys: string[];              // The properties/keys that will be shown in the base-table (unset shows all)
  // per key that needs an override the string that should override it
  @Input() headerOverrides: {[key: string]: string} = {};
  // per key a value that will be used for sorting, useful for types such as dates
  @Input() sortValueOverrides: {[key: string]: (_: any) => any} = {};
  // per key a value that will be shown in the table, can be used to resolve nested objects
  @Input() valueOverrides: {[key: string]: (_: any) => any} = {};
  // per key a lambda expression that return the css-classes the should be applied
  @Input() classes: {[key: string]: (_: any) => string} = {};
  // per key a lambda that returns the icon css-classes
  @Input() iconify: {[key: string]: (_: any) => string} = {};
  // per key a lambda expression that resolves to the routerLink it needs to navigate to
  @Input() routerLinks: {[key: string]: (_: any) => (string | number)[]} = {};
  // used to pass parameters to the translate pipe
  @Input() translateExtras: {[key: string]: {[key: string]: any}} = {};
  @Input() limit: number;               // number of rows to display per page of pagination
  @Input() sortKey: string;             // key that will be used to sort the table
  @Input() sortReverse: boolean;        // whether the table will be sorted in reverse order

  @Input() minimal = false;             // quick settings for minimalistic style (can still be overridden)
  @Input() pagesEnabled: boolean;       // show pagination
  @Input() sortEnabled: boolean;        // allow user to change sorting
  @Input() searchEnabled: boolean;      // object property that will be used for filtering

  @Input() sliderKey: string;           // key for which to show the slider
  @Input() sliderMin = 0;
  @Input() sliderMax = 100;
  @Input() sliderOptions: Options;

  @Input() actions: TableAction[] = []; // list of actions that can be performed on items in the table

  @Input() childKey: string;            // key in which the child items are stored
  @Input() filter: string;              // to set the filter text in the searchbar
  @Output() filterChange = new EventEmitter<string>();

  @Input() loggingSubject = 'Table';    // subject that is used to store logging events for

  currentPage = 1;
  pages: any[] = [];
  dataFilter = '';                      // text used to filter the data with
  dataFilterExact = false;              // filter must be an exact match
  filteredData: object[] = [];

  cardActions: CardAction[] = [
    {
      name: 'Export as .csv',
      permissions: ['use_card_actions'],
      callback: (() => {
        if (this.keys) {
          const csvData = [this.keys.map(key => this.headerOverrides[key] || key).join(',')];
          for (const data of this.filteredData) {
            const dataAsCsv = [];
            for (const key of this.keys) {
              dataAsCsv.push(this.valueOverrides[key](data));
            }
            csvData.push(dataAsCsv.join(','));
          }

          const url = `data:attachment/csv,${csvData.join('%0A')}`;
          const link = document.createElement('a');   // create 'a' element
          link.setAttribute('href', url);             // set link target to csv data
          link.setAttribute('download', 'file.csv');  // download file as file.csv
          link.click();                               // start the download
        } else {
          this.toastService.showDanger('The base-table could not be converted to a csv file.');
        }
      })
    }
  ];

  constructor(private loggingService: LoggingService, private toastService: ToastService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.sliderOptions) {
      this.sliderOptions = {
        floor: this.sliderMin,
        ceil: this.sliderMax,
        animate: false
      };
    }

    if (this.data && this.data.length > 0) {
      if (!this.keys) {
        this.keys = Object.keys(this.data[0]);
      }

      if (!this.sortKey) {
        this.sortKey = this.keys[0];
      }

      if (!this.limit || this.limit < 0) {
        this.limit = this.minimal ? 5 : this.data.length;
      }

      if (this.pagesEnabled === undefined) {
        this.pagesEnabled = !this.minimal;
      }

      if (this.sortEnabled === undefined) {
        this.sortEnabled = !this.minimal;
      }

      if (this.searchEnabled === undefined) {
        this.searchEnabled = !this.minimal;
      }

      if (this.sliderKey && this.keys.indexOf(this.sliderKey) === -1) { // if sliderKey is not in columns
        this.sliderKey = undefined;
      }

      // Handle null and undefined
      this.headerOverrides = this.headerOverrides || {};
      this.classes = this.classes || {};
      this.routerLinks = this.routerLinks || {};
      this.iconify = this.iconify || {};
      this.sortValueOverrides = this.sortValueOverrides || {};
      this.valueOverrides = this.valueOverrides || {};
      this.translateExtras = this.translateExtras || {};

      for (const key of this.keys) {
        this.valueOverrides[key] = this.valueOverrides[key] || (obj => obj[key]);
      }

      if (!changes.filter || !changes.filter.currentValue) { // if filter is set, then setFilter will call updateData
        this.updateData();
      }

      if (!this.pages[this.currentPage]) { // if user is on a non-existing page, then go to last (may happen on row deletion)
        this.currentPage = this.pages.length;
      }
    } else {
      this.data = [];
      this.filteredData = [];
    }
  }

  // Add key-value pairs of overrides from base-table implementation into base-table
  injectDefaults(baseDefaults, implementationDefaults) {
    for (const key of Object.keys(implementationDefaults)) {
      // Favor user set defaults over table implementation defaults
      baseDefaults[key] = baseDefaults[key] || implementationDefaults[key];
    }
  }

  setSort(key: string) {
    if (this.sortKey === key) {
      this.sortReverse = !this.sortReverse;
    } else {
      this.sortKey = key;
    }

    this.logEvent('SortChange', {key, reverse: this.sortReverse});
    this.updateData();
  }

  setFilter($event: {text: string, exact: boolean, raw: string}) {
    this.currentPage = 1;
    this.dataFilter = $event.text.toLowerCase();
    this.dataFilterExact = $event.exact;
    this.filterChange.emit($event.raw);
    this.updateData();
  }

  recursivelyFilter(item, filterText: string, filterExact: boolean = false): boolean {
    if (item[this.childKey] && item[this.childKey].length > 0) {
      let found = false;
      for (const child of item[this.childKey]) {
        found = this.recursivelyFilter(child, filterText, filterExact) || found;
      }

      item.isExpanded = found;
      if (found) {
        return found;
      }
    }

    for (const key of this.keys) {
      if (!filterExact && ('' + this.valueOverrides[key](item)).toLowerCase().includes(filterText)) {
        return true;
      }

      if (filterExact && ('' + this.valueOverrides[key](item)).toLowerCase() === filterText) {
        return true;
      }
    }

    return false;
  }

  updateData() {
    this.filteredData = this.data.map(x => ({...x})); // copy each element to not reference the original data

    if (this.sliderKey && (this.sliderOptions.floor !== this.sliderMin || this.sliderOptions.ceil !== this.sliderMax)) {
      this.filteredData = this.filteredData.filter(item => {
        const value = this.sortValueOverrides[this.sliderKey] ?
          this.sortValueOverrides[this.sliderKey](item) :
          this.valueOverrides[this.sliderKey](item);

        return value >= this.sliderMin && value <= this.sliderMax;
      });
    }

    if (this.dataFilter !== '') {
      this.filteredData = this.filteredData.filter(item => {
        return this.recursivelyFilter(item, this.dataFilter, this.dataFilterExact);
      });
    }

    this.filteredData.sort((a, b) => {
      a = this.sortValueOverrides[this.sortKey] ? this.sortValueOverrides[this.sortKey](a) : this.valueOverrides[this.sortKey](a);
      b = this.sortValueOverrides[this.sortKey] ? this.sortValueOverrides[this.sortKey](b) : this.valueOverrides[this.sortKey](b);
      return +(b === null) - +(a === null) || a < b ? -1 : 1;
    });

    if (this.sortReverse) {
      this.filteredData.reverse();
    }

    this.pages = new Array(Math.ceil(this.filteredData.length / this.limit)).fill([]);

    for (let i = 0; i < this.pages.length; i++) {
      this.pages[i] = this.filteredData.slice(i * this.limit, (i + 1) * this.limit);
    }
  }

  showAction(actionList: HTMLDivElement, action: TableAction, obj): boolean {
    const res = !action.condition || action.condition(obj);
    if (actionList.hidden && res) {
      actionList.hidden = false;
    }

    return res;
  }

  addColumn(key: string, header?: string, translateExtras?: {[key: string]: any}, value?: (item: any) => any,
            sortValue?: (item: any) => number, iconify?: (item: any) => string) {
    this.keys.push(key);
    if (header) {
      this.headerOverrides[key] = header;
    }
    if (translateExtras) {
      this.translateExtras[key] = translateExtras;
    }
    if (value) {
      this.valueOverrides[key] = value;
    }
    if (sortValue) {
      this.sortValueOverrides[key] = sortValue;
    }
    if (iconify) {
      this.iconify[key] = iconify;
    }
  }

  logSliderChange() {
    this.logEvent('SliderChange', {key: this.sliderKey, min: this.sliderMin, max: this.sliderMax});
  }

  logClick(obj) {
    const logObj = {};
    for (const key of this.keys) {
      logObj[key] = obj[key];
    }
    this.logEvent('Click', logObj);
  }

  logEvent(eventName: string, details: any) {
    this.loggingService.event(this.loggingSubject, eventName, details);
  }

}
