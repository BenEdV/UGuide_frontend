import { Injectable, TemplateRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: any[] = [];

  show(textOrTemplate: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTemplate, ...options });
  }

  showSuccess(textOrTemplate: string | TemplateRef<any>) {
    this.show(textOrTemplate, { className: 'bg-success text-light', delay: 5000 });
  }

  showDanger(textOrTemplate: string | TemplateRef<any>) {
    this.show(textOrTemplate, { className: 'bg-danger text-light', delay: 5000 });
  }

  remove(toast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
