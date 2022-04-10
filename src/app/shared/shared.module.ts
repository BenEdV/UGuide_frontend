import { NgModule } from '@angular/core';
import { CommonModule, PercentPipe } from '@angular/common';
import { BaseTableComponent } from './tables/base-table/base-table.component';
import { ChartsModule } from 'ng2-charts';
import { ReadMoreComponent } from './components/read-more/read-more.component';
import { LoadingIconComponent } from './components/loading-icon/loading-icon.component';
import { RouterModule } from '@angular/router';
import { HasPermissionDirective } from './directives/has-permission.directive';
import { DistributionChartComponent } from './charts/distribution-chart.component';
import { HeatmapChartComponent } from './charts/heatmap-chart.component';
import { LineChartComponent } from './charts/line-chart.component';
import { ViolinChartComponent } from './charts/violin-chart.component';
import { ScatterChartComponent } from './charts/scatter-chart.component';
import { GradeDistributionChartComponent } from './charts/grade-distribution-chart.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { CheckboxGroupComponent } from './components/checkbox-group/checkbox-group.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PolarChartComponent } from './charts/polar-chart.component';
import { BaseChartComponent } from './charts/base-chart/base-chart.component';
import { GaugeChartComponent } from './charts/gauge-chart.component';
import { CardComponent } from './components/card/card.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSliderModule } from '@m0t0r/ngx-slider';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TranslateModule} from '@ngx-translate/core';
import { HierarchicalChartComponent } from './charts/hierarchical-chart.component';
import { BarChartComponent } from './charts/bar-chart.component';
import { ConstructTableComponent } from './tables/construct-table.component';
import { ActivityTableComponent } from './tables/activity-table/activity-table.component';
import { ConnectorTableComponent } from './tables/connector-table.component';
import { ExamTableComponent } from './tables/activity-table/exam-table.component';
import { QuestionTableComponent } from './tables/activity-table/question-table.component';
import { StudyMaterialTableComponent } from './tables/activity-table/study-material-table.component';
import { MultilineDirective } from './directives/multiline.directive';
import { RouteTransformerDirective } from './directives/route-transformer.directive';
import { SurveyTableComponent } from './tables/activity-table/survey-table.component';
import { ConstructDropdownComponent } from './dropdowns/construct-dropdown.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { BaseDropdownComponent } from './dropdowns/base-dropdown/base-dropdown.component';
import { ModalComponent } from './components/modal/modal.component';
import { ModelTableComponent } from './tables/model-table.component';
import { FormControlErrorComponent } from './components/form-control-error/form-control-error.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ListComponent } from './components/list/list.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { ParticipantTableComponent } from './tables/participant-table.component';
import { GroupTableComponent } from './tables/group-table.component';
import { DurationPipe } from './pipes/duration.pipe';
import { ContentTranslatePipe } from './pipes/contentTranslate.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { DatePipe } from './pipes/date.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { VideoComponent } from './components/video/video.component';
import { TitleSectionComponent } from './components/title-section/title-section.component';
import { RadarChartComponent } from './charts/radar-chart.component';
import { ConstructChartComponent } from './charts/construct-chart.component';
import { GradePipe } from './pipes/grade.pipe';
import { HasRoleDirective } from './directives/has-role.directive';
import { CollectionTableComponent } from './tables/collection-table.component';
import { CourseTableComponent } from './tables/course-table.component';
import { ConstructProgressChartComponent } from './charts/construct-progress-chart.component';


@NgModule({
  declarations: [
    HasPermissionDirective,
    BaseTableComponent,
    ReadMoreComponent,
    LoadingIconComponent,
    BaseChartComponent,
    DistributionChartComponent,
    LineChartComponent,
    ViolinChartComponent,
    ScatterChartComponent,
    BarChartComponent,
    GradeDistributionChartComponent,
    SearchBarComponent,
    CheckboxGroupComponent,
    PolarChartComponent,
    GaugeChartComponent,
    HierarchicalChartComponent,
    CardComponent,
    SidebarComponent,
    ConstructTableComponent,
    ActivityTableComponent,
    ExamTableComponent,
    QuestionTableComponent,
    StudyMaterialTableComponent,
    ConnectorTableComponent,
    MultilineDirective,
    RouteTransformerDirective,
    SurveyTableComponent,
    ConstructDropdownComponent,
    BaseDropdownComponent,
    ModalComponent,
    ModelTableComponent,
    HeatmapChartComponent,
    FormControlErrorComponent,
    FileUploadComponent,
    ListComponent,
    BreadcrumbComponent,
    ParticipantTableComponent,
    GroupTableComponent,
    DurationPipe,
    SafePipe,
    SafeHtmlPipe,
    DatePipe,
    ContentTranslatePipe,
    VideoComponent,
    TitleSectionComponent,
    RadarChartComponent,
    ConstructChartComponent,
    GradePipe,
    HasRoleDirective,
    CollectionTableComponent,
    CourseTableComponent,
    ConstructProgressChartComponent
  ],
  imports: [
    CommonModule,
    ChartsModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    NgxSliderModule,
    TranslateModule,
    NgSelectModule
  ],
  exports: [
    HasPermissionDirective,
    BaseTableComponent,
    ReadMoreComponent,
    LoadingIconComponent,
    ScatterChartComponent,
    LineChartComponent,
    ViolinChartComponent,
    BarChartComponent,
    DistributionChartComponent,
    GradeDistributionChartComponent,
    SearchBarComponent,
    CheckboxGroupComponent,
    PolarChartComponent,
    GaugeChartComponent,
    HierarchicalChartComponent,
    CardComponent,
    SidebarComponent,
    TranslateModule,
    ConstructTableComponent,
    ActivityTableComponent,
    ExamTableComponent,
    QuestionTableComponent,
    ConnectorTableComponent,
    StudyMaterialTableComponent,
    MultilineDirective,
    RouteTransformerDirective,
    SurveyTableComponent,
    NgbModule,
    ConstructDropdownComponent,
    BaseDropdownComponent,
    ModalComponent,
    ModelTableComponent,
    HeatmapChartComponent,
    FormControlErrorComponent,
    FileUploadComponent,
    ListComponent,
    BreadcrumbComponent,
    ParticipantTableComponent,
    GroupTableComponent,
    SafePipe,
    SafeHtmlPipe,
    DatePipe,
    ContentTranslatePipe,
    VideoComponent,
    TitleSectionComponent,
    RadarChartComponent,
    ConstructChartComponent,
    DurationPipe,
    GradePipe,
    HasRoleDirective,
    CollectionTableComponent,
    CourseTableComponent,
    ConstructProgressChartComponent
  ],
  providers: [DatePipe, GradePipe, PercentPipe, DurationPipe]
})
export class SharedModule { }
