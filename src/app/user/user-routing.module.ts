import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { SamlLogoutComponent } from './saml-logout/saml-logout.component';


const routes: Routes = [
  {path: 'login', component: LoginComponent, data: { toolbar: false, sidenav: false}, runGuardsAndResolvers: 'always'},
  {path: 'register', component: RegisterComponent, data: { toolbar: false, sidenav: false}, runGuardsAndResolvers: 'always'},
  {path: 'saml-logout', component: SamlLogoutComponent, data: {toolbar: false, sidenav: false}, runGuardsAndResolvers: 'always'},
  {path: 'user-settings', component: UserSettingsComponent, data: { sidenav: false }, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
