import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { CollectionOverviewComponent } from './collection-overview/collection-overview.component';
import { PrivacyOverviewComponent } from './privacy-overview/privacy-overview.component';
import { ChartTestComponent } from '../test/chart-test/chart-test.component';
import { TableTestComponent } from '../test/table-test/table-test.component';
import { ReadMoreTestComponent } from '../test/read-more-test/read-more-test.component';
import { TabTestComponent } from '../test/tab-test/tab-test.component';
import { PermissionTestComponent } from '../test/permission-test/permission-test.component';
import { LineChartTestComponent } from '../test/line-chart-test/line-chart-test.component';
import { DistChartTestComponent } from '../test/dist-chart-test/dist-chart-test.component';
import { HeatmapChartTestComponent } from '../test/heatmap-chart-test/heatmap-chart-test.component';
import { CheckboxGroupTestComponent } from '../test/checkbox-group-test/checkbox-group-test.component';
import { PolarTestComponent } from '../test/polar-test/polar-test.component';
import { CollectionResolver } from '../core/resolvers/collection.resolver';
import { PermissionGuard } from '../core/guards/permission.guard';
import { RoleGuard } from '../core/guards/role.guard';
import { PageInCollectionGuard } from '../core/guards/page-in-collection.guard';
import { ModelResolver} from '../core/resolvers/constructs/model.resolver';
import { ModelIdResolver } from '../core/resolvers/constructs/model-id.resolver';
import { ActivityResolver } from '../core/resolvers/activities/activity.resolver';
import { ModelOverviewComponent } from '../models/model-overview/model-overview.component';
import { ModelListComponent } from '../models/model-list/model-list.component';
import { CollectionIdResolver } from '../core/resolvers/collection-id.resolver';
import { KnowledgeMapComponent } from '../constructs/knowledge-map/knowledge-map.component';
import { ConstructComponent } from '../constructs/construct/construct.component';
import { ModelComponent } from '../models/model/model.component';
import { ConstructResolver } from '../core/resolvers/constructs/construct.resolver';
import { ConstructIdResolver } from '../core/resolvers/constructs/construct-id.resolver';
import { ConnectorResolver } from '../core/resolvers/connector.resolver';
import { ConstructListComponent } from '../constructs/construct-list/construct-list.component';
import { AdministrationConstructComponent } from '../administration/administration-construct/administration-construct.component';
import { ConstructOverviewComponent } from '../constructs/construct-overview/construct-overview.component';
import { CourseResolver } from '../core/resolvers/course.resolver';
import { CourseListComponent } from './course-list/course-list.component';
import { GlobalActivitiesListComponent } from './global-activities-list/global-activities-list.component';
import { GlobalActivityResolver } from '../core/resolvers/activities/global-activity.resolver';
import { ExamOverviewComponent } from '../activity/exam-overview/exam-overview.component';
import { ActivityListComponent } from '../activity/activity-list/activity-list.component';
import { ActivityIdResolver } from '../core/resolvers/activities/activity-id.resolver';
import { ExamComponent } from '../activity/exam/exam.component';
import { ExamQuestionComponent } from '../activity/exam-question/exam-question.component';
import { StudyMaterialComponent } from '../activity/study-material/study-material.component';
import { SurveyComponent } from '../activity/survey/survey.component';
import { SurveyFormComponent } from '../activity/survey-form/survey-form.component';
import { AdministrationModelComponent } from '../administration/administration-model/administration-model.component';
import { AdministrationCourseComponent } from '../administration/administration-course/administration-course.component';
import { ThermosResultComponent } from '../activity/thermos-result/thermos-result.component';
import { TypeResolver } from '../core/resolvers/type.resolver';
import { AdministrationStudyMaterialComponent } from '../administration/administration-study-material/administration-study-material.component';
import { AdministrationConnectorComponent } from '../administration/administration-connector/administration-connector.component';
import { AdministrationExamComponent } from '../administration/administration-exam/administration-exam.component';
import { AdministrationMappingComponent } from '../administration/administration-mapping/administration-mapping.component';
import { GroupListComponent } from '../participants/group-list/group-list.component';
import { GroupComponent } from '../participants/group/group.component';
import { StudentListComponent } from '../participants/student-list/student-list.component';
import { StudentComponent } from '../participants/student/student.component';
import { ParticipantResolver } from '../core/resolvers/participants/participant.resolver';
import { ParticipantIdResolver } from '../core/resolvers/participants/participant-id.resolver';
import { GroupResolver } from '../core/resolvers/participants/group.resolver';
import { GroupIdResolver } from '../core/resolvers/participants/group-id.resolver';
import { GroupInCollectionGuard } from '../core/guards/group-in-collection.guard';
import { GroupOverviewComponent } from '../participants/group-overview/group-overview.component';
import { StudentOverviewComponent } from '../participants/student-overview/student-overview.component';
import { ScoreResolver } from '../core/resolvers/constructs/score.resolver';
import { environment } from 'src/environments/environment';
import { AdministrationGroupComponent } from '../administration/administration-group/administration-group.component';
import { AdministrationSurveyComponent } from '../administration/administration-survey/administration-survey.component';
import { AdministrationSurveyFormComponent } from '../administration/administration-survey-form/administration-survey-form.component';
import { AdministrationCollectionComponent } from '../administration/administration-collection/administration-collection.component';
import { CollectionListComponent } from './collection-list/collection-list.component';
import { PeriodResolver } from '../core/resolvers/period.resolver';
import { StudentSetComponent } from '../participants/student-set/student-set.component';
import { CollectionStudentOverviewComponent } from './collection-student-overview/collection-student-overview.component';


// All children of :collectionId (and their children) will be automatically added to the sidenav
// Additional data may be added to help with generation of the NavItems in the sidenav (check NavItem interface for options)
// Make sure parameters end with "Id" if they should be replaced with the entity name in the breadcrumbs
const routes: Routes = [
  {path: 'courses', component: CourseListComponent, canActivate: [AuthGuard],
    resolve: {collections: CollectionResolver}, data: {sidenav: false}
  },
  {path: 'activities', component: GlobalActivitiesListComponent, canActivate: [AuthGuard], resolve: {activities: GlobalActivityResolver},
    data: {sidenav: false}
  },
  {path: 'collections', canActivate: [AuthGuard], resolve: {collections: CollectionResolver},
    children: [
      {path: '', pathMatch: 'full', component: CollectionListComponent, data: {sidenav: false}},
      {path: ':collectionId', canActivateChild: [PageInCollectionGuard, PermissionGuard, RoleGuard],
        resolve: {collection: CollectionIdResolver},
        children: [
          {path: '', pathMatch: 'full', redirectTo: environment.collection_homepage || 'exams/overview'},
          // Teacher Course Overview
          {path: 'overview', component: CollectionOverviewComponent,
            resolve: {constructs: ConstructResolver, activities: ActivityResolver, participants: ParticipantResolver},
            data: {modules: ['overview'], key: 'overview', iconClasses: 'fas fa-chalkboard',
                   activityKeys: ['exam', 'studyMaterial'], participantKeys: ['student'], permissions: ['see_users']}
          },
          // Student Personal Overview
          {path: 'my-progress', component: CollectionStudentOverviewComponent,
            resolve: {constructs: ConstructResolver, activities: ActivityResolver},
            data: {modules: ['overview'], key: 'progress', iconClasses: 'fas fa-chalkboard-teacher',
                   roles: ['student'], activityKeys: ['exam', 'studyMaterial']}
          },
          // Constructs
          {path: 'constructs', resolve: {constructs: ConstructResolver},
            data: {modules: ['module.constructs'], key: 'constructs.container', iconClasses: 'construct-icon',
                   permissions: ['see_constructs'], redirectToFirstChild: true},
            children: [
              {path: '', pathMatch: 'full', redirectTo: 'list'},
              {path: 'overview', component: ConstructOverviewComponent, data: {modules: ['module.constructs'], key: 'constructs.overview'}},
              {path: 'list', component: ConstructListComponent, data: {modules: ['module.constructs'], key: 'constructs.list'}},
              {path: 'knowledge-map', component: KnowledgeMapComponent, resolve: {constructs: ConstructResolver},
                data: {modules: ['module.constructs'], key: 'constructs.knowledge_map', name: 'knowledge_map'}
              },
              {path: ':constructId', component: ConstructComponent, resolve: {construct: ConstructIdResolver}, data: {modules: ['module.constructs'], key: 'constructs.entity'}},
            ]
          },
          // Models
          {path: 'models', resolve: {models: ModelResolver},
            data: {modules: ['module.models'], key: 'models.container', iconClasses: 'model-icon', permissions: ['see_models'],
                   redirectToFirstChild: true, hideFromNav: true},
            children: [
              {path: '', pathMatch: 'full', redirectTo: 'list'},
              {path: 'overview', component: ModelOverviewComponent, data: {modules: ['module.models'], key: 'models.overview'}},
              {path: 'list', component: ModelListComponent, data: {modules: ['module.models'], key: 'models.list'}},
              {path: ':modelId', component: ModelComponent, resolve: {model: ModelIdResolver}, data: {modules: ['module.models'], key: 'models.entity'}},
            ]
          },
          // Exam Activities
          {path: 'exams', resolve: {activities: ActivityResolver},
            data: {modules: ['module.exams'], key: 'exams.container', iconClasses: 'exam-icon', activityKeys: ['exam'],
                   redirectToFirstChild: true},
            children: [
              {path: '', pathMatch: 'full', redirectTo: 'list'},
              {path: 'overview', component: ExamOverviewComponent, data: {modules: ['module.exams'], key: 'exams.overview'}},
              {path: 'list', component: ActivityListComponent, data: {modules: ['module.exams'], key: 'exams.list'}},
              {path: ':examId', resolve: {exam: ActivityIdResolver}, children: [
                  {path: '', pathMatch: 'full', component: ExamComponent, data: {modules: ['module.exams'], key: 'exams.entity'}},
                  {path: 'questions/:questionId', component: ExamQuestionComponent, resolve: {question: ActivityIdResolver},
                    data: {activityKeys: ['question'], modules: ['module.exams'], key: 'exams.questions.entity'}
                  }
                ]
              }
            ]
          },
          // Study Material Activities
          {path: 'material', resolve: {activities: ActivityResolver},
            data: {modules: ['module.study_material'], key: 'study_material.container', name: 'study_material',
                   iconClasses: 'study-material-icon', activityKeys: ['studyMaterial'], redirectToFirstChild: true},
            children: [
              {path: '', pathMatch: 'full', redirectTo: 'list'},
              // {path: 'overview', component: ExamOverviewComponent},
              {path: 'list', component: ActivityListComponent, data: {modules: ['module.study_material'], key: 'study_material.list'}},
              {path: ':studyMaterialId', component: StudyMaterialComponent, resolve: {studyMaterial: ActivityIdResolver},
                data: {modules: ['module.study_material'], key: 'study_material.entity'}
              }
            ]
          },
          // Survey Activities
          {path: 'surveys', resolve: {activities: ActivityResolver},
          data: {modules: ['module.surveys'], key: 'surveys.container', iconClasses: 'survey-icon', activityKeys: ['survey'],
                 redirectToFirstChild: true},
            children: [
              {path: '', pathMatch: 'full', redirectTo: 'list'},
              {path: 'list', component: ActivityListComponent, data: {modules: ['module.surveys'], key: 'surveys.list'}},
              {path: ':surveyId', resolve: {survey: ActivityIdResolver},
                children: [
                  {path: '', pathMatch: 'full', component: SurveyComponent, data: {modules: ['module.surveys'], key: 'surveys.entity'}},
                  {path: 'questions', children: [
                    {path: '', pathMatch: 'full', component: SurveyFormComponent, data: {modules: ['module.surveys'], key: 'surveys.questions.entity'}},
                    {path: ':questionId', component: SurveyFormComponent, data: {modules: ['module.surveys'], key: 'surveys.questions.entity'}}
                  ]},
                  {path: 'thermos-result', component: ThermosResultComponent, data: {modules: ['module.surveys'], key: 'surveys.thermos_result'}}
                ]
              }
            ]
          },
          // Groups
          {path: 'groups',
            resolve: {activities: ActivityResolver, constructs: ConstructResolver, groups: GroupResolver},
            data: {modules: ['module.groups'], key: 'groups.container', iconClasses: 'group-icon', permissions: ['see_users'],
                   activityKeys: ['exam'], redirectToFirstChild: true},
            children: [
              {path: '', pathMatch: 'full', redirectTo: 'list'},
              // {path: 'overview', component: GroupOverviewComponent},
              {path: 'list', component: GroupListComponent, data: {modules: ['module.groups'], key: 'groups.list'}},
              {path: ':groupId', component: GroupComponent, canActivate: [GroupInCollectionGuard],
                resolve: {group: GroupIdResolver}, data: {modules: ['module.groups'], key: 'groups.entity'}
              }
            ]
          },
          // Students
          {path: 'students', data: {modules: ['module.students'], key: 'students.container', iconClasses: 'student-icon', permissions: ['see_users'],
                                    activityKeys: ['exam', 'studyMaterial'], participantKeys: ['student'], redirectToFirstChild: true},
            resolve: {participants: ParticipantResolver, constructs: ConstructResolver, activities: ActivityResolver},
            children: [
              {path: '', pathMatch: 'full', redirectTo: 'list'},
              // {path: 'overview', component: StudentOverviewComponent},
              {path: 'list', component: StudentListComponent, data: {modules: ['module.students'], key: 'students.list'}},
              {path: 'set', component: StudentSetComponent, data: {modules: ['module.students'], key: 'students.set', hideFromNav: true}},
              {path: ':studentId', component: StudentComponent, resolve: {student: ParticipantIdResolver, groups: GroupResolver},
                data: {modules: ['module.students'], key: 'students.entity'}
              },
            ]
          },
          // Administration
          {path: 'administration',
            data: {modules: ['module.administration'], key: 'administration.container', iconClasses: 'settings-icon',
                   permissions: ['manage_collection'], redirectToFirstChild: true},
            children: [
              {path: '', pathMatch: 'full', redirectTo: 'course'},
              {path: 'course', component: AdministrationCourseComponent,
                resolve: {},
                data: {permissions: ['manage_collection'], modules: ['module.administration'], key: 'administration.course'}
              },
              {path: 'collections', component: AdministrationCollectionComponent, resolve: {periods: PeriodResolver},
                data: {permissions: ['manage_collection'], modules: ['module.administration'], key: 'administration.collections'}
              },
              {path: 'models', component: AdministrationModelComponent,
                resolve: {models: ModelResolver, types: TypeResolver},
                data: {permissions: ['manage_construct_models'], types: ['models'], modules: ['module.administration', 'module.models'],
                       key: 'administration.models'}
              },
              {path: 'constructs', component: AdministrationConstructComponent,
                resolve: {constructs: ConstructResolver, models: ModelResolver, types: TypeResolver, activities: ActivityResolver},
                data: {permissions: ['manage_construct_models'], types: ['construct_relations', 'construct_activity_relations'],
                       activityKeys: ['studyMaterial'], modules: ['module.administration', 'module.constructs'], key: 'administration.constructs'}
              },
              {path: 'exams', component: AdministrationExamComponent,
                resolve: {activities: ActivityResolver, types: TypeResolver, remotes: ConnectorResolver},
                data: {activityKeys: ['exam'], types: ['visibility'], permissions: ['manage_activities'],
                       modules: ['module.administration', 'module.exams'], key: 'administration.exams'}
              },
              {path: 'mapping', component: AdministrationMappingComponent,
                resolve: {constructs: ConstructResolver, models: ModelResolver, activities: ActivityResolver, types: TypeResolver},
                data: {activityKeys: ['exam'], types: ['construct_activity_relations'], permissions: ['manage_activities'],
                       modules: ['module.administration', 'module.constructs'], key: 'administration.mapping'}
              },
              {path: 'material', component: AdministrationStudyMaterialComponent,
                resolve: {activities: ActivityResolver, types: TypeResolver, models: ModelResolver, constructs: ConstructResolver},
                data: {name: 'study_material', activityKeys: ['studyMaterial'],
                      types: ['material', 'visibility', 'construct_activity_relations'], permissions: ['manage_activities'],
                      modules: ['module.administration', 'module.study_material'], key: 'administration.study_material'}
              },
              {path: 'groups', component: AdministrationGroupComponent,
                resolve: {groups: GroupResolver, participants: ParticipantResolver, types: TypeResolver},
                data: {participantKeys: ['student'], permissions: ['manage_collection'], types: ['user_roles'],
                       modules: ['module.administration', 'module.groups'], key: 'administration.groups'}
              },
              {path: 'connector', component: AdministrationConnectorComponent,
                resolve: {connectors: ConnectorResolver},
                data: {name: 'connector', permissions: ['manage_activities'], modules: ['module.administration', 'module.exams'],
                       key: 'administration.connector'}
              },
              {path: 'surveys',
                resolve: {activities: ActivityResolver, types: TypeResolver},
                data: {activityKeys: ['survey'], types: ['visibility', 'survey'], permissions: ['manage_activities'],
                       modules: ['module.administration', 'module.surveys'], key: 'administration.surveys'},
                children: [
                  {path: '', pathMatch: 'full', component: AdministrationSurveyComponent},
                  {path: ':surveyId',
                    resolve: {survey: ActivityIdResolver, constructs: ConstructResolver, models: ModelResolver, types: TypeResolver},
                    data: {types: ['activity_relations', 'activities'], modules: ['module.administration', 'module.surveys'], key: 'administration.surveys.entity'},
                    component: AdministrationSurveyFormComponent
                  }
                ]
              }
            ]
          },
          // Test
          {path: 'test', data: {modules: ['module.test'], key: 'test.container'},
            children: [
              {path: '', pathMatch: 'full', redirectTo: 'table'},
              {path: 'table', component: TableTestComponent, resolve: {constructs: ConstructResolver},
                data: {modules: ['module.test'], key: 'test.table'}
              },
              {path: 'read-more', component: ReadMoreTestComponent,
                data: {modules: ['module.test'], key: 'test.read_more'}
              },
              {path: 'tab-test', component: TabTestComponent,
                data: {modules: ['module.test'], key: 'test.tab'}
              },
              {path: 'permission-test', component: PermissionTestComponent, data: {modules: ['module.test'], key: 'test.permission'}},
              {path: 'chart', data: {name: 'Construct Chart', iconClasses: 'fas fa-chart-pie'},
                children: [
                  {path: '', pathMatch: 'full', redirectTo: 'something'},
                  {path: 'something', component: ChartTestComponent, data: {modules: ['module.test'], key: 'test.chart'},
                    children: [
                      {path: 'something2', component: TableTestComponent, data: {modules: ['module.test'], key: 'test.something2'}},
                    ]
                  },
                  {path: 'something3', component: ReadMoreTestComponent, data: {modules: ['module.test'], key: 'test.something3'}}
                ]
              },
              {path: 'line-chart-test', component: LineChartTestComponent, data: {modules: ['module.test'], key: 'test.line_chart'}},
              {path: 'dist-chart-test', component: DistChartTestComponent, data: {modules: ['module.test'], key: 'test.dist_chart'}},
              {path: 'heatmap-chart-test', component: HeatmapChartTestComponent,
                data: {modules: ['module.test'], key: 'test.heatmap_chart'}
              },
              {path: 'checkbox-group-test', component: CheckboxGroupTestComponent,
                data: {modules: ['module.test'], key: 'test.checkbox_group'}
              },
              {path: 'polar-test', component: PolarTestComponent, data: {modules: ['module.test'], key: 'test.polar_chart'}}
            ]
          },
          // Privacy
          {path: 'privacy', component: PrivacyOverviewComponent, resolve: {constructs: ConstructResolver, activities: ActivityResolver},
            data: {modules: ['privacy'], key: 'privacy', name: 'privacy', iconClasses: 'privacy-icon', hideFromNav: true}
          },
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollectionRoutingModule { }
