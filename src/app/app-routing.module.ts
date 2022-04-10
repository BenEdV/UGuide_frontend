import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { AuthGuard } from './core/guards/auth.guard';
import { HomepageComponent } from './core/components/homepage/homepage.component';
import { CourseResolver } from './core/resolvers/course.resolver';
import { GlobalActivityResolver } from './core/resolvers/activities/global-activity.resolver';
import { CollectionResolver } from './core/resolvers/collection.resolver';

const routes: Routes = [
  {path: '', pathMatch: 'full', component: HomepageComponent, data: {sidenav: false}, canActivate: [AuthGuard],
    resolve: {courses: CourseResolver, collections: CollectionResolver, activities: GlobalActivityResolver}
  },
  {path: 'page-not-found', component: PageNotFoundComponent, data: {toolbar: false, sidenav: false}, runGuardsAndResolvers: 'always'},
  {path: '**', redirectTo: 'page-not-found'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {relativeLinkResolution: 'corrected'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
