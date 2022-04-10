import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelOverviewComponent } from './model-overview/model-overview.component';
import { ModelListComponent } from './model-list/model-list.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ModelComponent } from './model/model.component';



@NgModule({
  declarations: [
    ModelOverviewComponent,
    ModelListComponent,
    ModelComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule
  ]
})
export class ModelsModule { }
