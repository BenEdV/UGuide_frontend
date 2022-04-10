import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableTestComponent } from './table-test/table-test.component';
import { ChartTestComponent } from './chart-test/chart-test.component';
import { CheckboxGroupTestComponent } from './checkbox-group-test/checkbox-group-test.component';
import { DistChartTestComponent } from './dist-chart-test/dist-chart-test.component';
import { LineChartTestComponent } from './line-chart-test/line-chart-test.component';
import { HeatmapChartTestComponent } from './heatmap-chart-test/heatmap-chart-test.component';
import { PermissionTestComponent } from './permission-test/permission-test.component';
import { PolarTestComponent } from './polar-test/polar-test.component';
import { ReadMoreTestComponent } from './read-more-test/read-more-test.component';
import { TabTestComponent } from './tab-test/tab-test.component';
import { SharedModule } from '../shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    ChartTestComponent,
    CheckboxGroupTestComponent,
    DistChartTestComponent,
    LineChartTestComponent,
    PermissionTestComponent,
    PolarTestComponent,
    ReadMoreTestComponent,
    TabTestComponent,
    TableTestComponent,
    HeatmapChartTestComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgSelectModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    NgbModule
  ],
  exports: [
    ChartTestComponent,
    CheckboxGroupTestComponent,
    DistChartTestComponent,
    LineChartTestComponent,
    PermissionTestComponent,
    PolarTestComponent,
    ReadMoreTestComponent,
    TabTestComponent,
    TableTestComponent,
    HeatmapChartTestComponent
  ]
})
export class TestModule { }
