import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { SamlLogoutComponent } from './saml-logout/saml-logout.component';


@NgModule({
  declarations: [
    RegisterComponent,
    LoginComponent,
    UserSettingsComponent,
    SamlLogoutComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    SharedModule
  ]
})
export class UserModule { }
