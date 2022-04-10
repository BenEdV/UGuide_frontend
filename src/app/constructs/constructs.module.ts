import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstructComponent } from './construct/construct.component';
import { KnowledgeMapComponent } from './knowledge-map/knowledge-map.component';
import { ConstructListComponent } from './construct-list/construct-list.component';
import { ConstructOverviewComponent } from './construct-overview/construct-overview.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    ConstructComponent,
    KnowledgeMapComponent,
    ConstructListComponent,
    ConstructOverviewComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
  ]
})
export class ConstructsModule { }
