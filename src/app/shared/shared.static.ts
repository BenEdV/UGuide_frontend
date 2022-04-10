export interface InjectedElementOptions {
  innerHTML?: string;
  bind?: any;
  mouseenter?: (e) => any;
  mouseleave?: (e) => any;
  onclick?: (e) => any;
  classes?: string[];
  properties?: {[key: string]: any};
}

export class SharedStatic {
  static setInjectedElement(element: HTMLElement, options: InjectedElementOptions): HTMLElement {
    if (!element) {
      console.warn(`Could not set options on element ${element}`);
      return null;
    }
    if (options.innerHTML) {
      element.innerHTML = options.innerHTML;
    }
    if (options.mouseenter) {
      element.addEventListener('mouseenter', options.mouseenter.bind(options.bind || this));
    }
    if (options.mouseleave) {
      element.addEventListener('mouseleave', options.mouseleave.bind(options.bind || this));
    }
    if (options.onclick) {
      element.addEventListener('click', options.onclick.bind(options.bind || this));
    }
    if (options.classes) {
      for (const cssClass of options.classes) {
        element.classList.add(cssClass);
      }
    }
    if (options.properties) {
      Object.assign(element, options.properties);
    }
    return element;
  }

  static getDateDMY(timestamp: string): string { // removes the hours, minutes & seconds
    const timestampDate = new Date(timestamp);
    return new Date(timestampDate.getFullYear(), timestampDate.getMonth(), timestampDate.getDate()).toISOString();
  }
}
