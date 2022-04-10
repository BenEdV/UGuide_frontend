import { Component, OnInit, TemplateRef } from '@angular/core';
import { ToastService } from '../../services/components/toast.service';

@Component({
  selector: 'app-toast-global',
  templateUrl: './toast-global.component.html',
  styleUrls: ['./toast-global.component.scss']
})
export class ToastGlobalComponent implements OnInit {

  constructor(public toastService: ToastService) { }

  ngOnInit() {
  }

  isTemplate(toast) { return toast.textOrTpl instanceof TemplateRef; }

}
