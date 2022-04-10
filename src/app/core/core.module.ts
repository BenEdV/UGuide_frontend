import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ToastGlobalComponent } from './components/toast-global/toast-global.component';
import { TokenInterceptor} from './interceptors/jwt.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HomepageComponent } from './components/homepage/homepage.component';

@NgModule({
  declarations: [
    PageNotFoundComponent,
    ToolbarComponent,
    SidenavComponent,
    ToastGlobalComponent,
    HomepageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
  ],
  exports: [
    ToolbarComponent,
    SidenavComponent,
    ToastGlobalComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ]
})
export class CoreModule { }
