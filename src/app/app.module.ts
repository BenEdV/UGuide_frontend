import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CollectionModule } from './collections/collection.module';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LOCATION_INITIALIZED, registerLocaleData } from '@angular/common';
import localeNl from '@angular/common/locales/nl';
import localeNlExtra from '@angular/common/locales/extra/nl';
import { UserModule } from './user/user.module';

// Setup HTTP loader for translation files
registerLocaleData (localeNl, localeNlExtra);
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

// Wait for locale data to be loaded before showing the app
export function appInitializerFactory(translate: TranslateService, injector: Injector) {
  return () => new Promise<any>((resolve: any) => {
    const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
    locationInitialized.then(() => {
      translate.addLangs(['en', 'nl']);
      translate.setDefaultLang('en');

      const browserLang = translate.getBrowserLang();

      const lang = translate.getLangs().includes(browserLang) ? browserLang : translate.getDefaultLang();

      translate.use(lang).subscribe(() => {
        // console.info(`Successfully initialized '${browserLang}' language.'`);
      }, err => {
        console.error(`Problem with '${browserLang}' language initialization.'`);
      }, () => {
        resolve(null);
      });
    });
  });
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    SharedModule,
    CoreModule,
    HttpClientModule,
    UserModule,
    CollectionModule,
    LoadingBarModule,
    LoadingBarHttpClientModule,
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
        }
    }),
    AppRoutingModule, // Must be imported after all other route declarations to handle wildcard.
  ],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService, Injector],
      multi: true
    }
  ]
})
export class AppModule { }
