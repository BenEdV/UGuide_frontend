import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { environment } from 'src/environments/environment';
import { RouteParamsService } from 'src/app/core/services/route-params.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-launch',
  templateUrl: './launch.component.html',
  styleUrls: ['./launch.component.scss']
})
export class LaunchComponent implements OnInit, OnDestroy {
  @ViewChild('passwordField') passwordField: ElementRef;
  form: FormGroup;
  loading = false;
  checkingToken = false;
  submitted = false;
  error: string;
  returnUrl: string;
  allowRegistration = false;
  isIE: boolean;

  logoutTimer;
  showLogoutBtn = false;
  projectName = environment.project_name;
  isPasswordVisible = false;

  private routeParamsSubscription: Subscription;

  constructor(public authService: AuthService,
              public route: ActivatedRoute,
              public router: Router,
              public formBuilder: FormBuilder,
              private routeParams: RouteParamsService) {
    this.routeParamsSubscription = this.routeParams.routeSnapshot.subscribe(() => this.init());
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.routeParamsSubscription.unsubscribe();
  }

  init() {
    this.loading = false;
    this.checkingToken = false;
    this.submitted = false;
    if ((window.document as any).documentMode) { // property only exists in IE: https://www.w3schools.com/jsref/prop_doc_documentmode.asp
      this.isIE = true;
    }

    this.returnUrl = this.route.snapshot.queryParams.returnUrl || environment.dashboard_homepage || '/';
    const authCode = this.route.snapshot.queryParams.code;

    if (this.authService.user) { // If the user information is already available locally
      this.router.navigateByUrl(this.returnUrl);
    } else if (authCode && sessionStorage.getItem('nonce')) { // If SAML launch returned with code parameter
      this.checkingToken = true;
      this.showLogoutBtn = false;
      this.logoutTimer = this.showLogoutBtnAfterTimeout();

      this.authService.setUserFromSAMLToken(authCode, sessionStorage.getItem('nonce'), 'UU').subscribe(
        res => {
          if (res) {
            this.router.navigateByUrl(this.returnUrl);
          }
          this.checkingToken = false;
        },
        error => {
          this.checkingToken = false;
          clearTimeout(this.logoutTimer);
          this.error = error;
        }
      );
    } else if (authCode && sessionStorage.getItem('state')) { // If SAML launch returned with code parameter
      this.checkingToken = true;
      this.showLogoutBtn = false;
      this.logoutTimer = this.showLogoutBtnAfterTimeout();

      this.authService.setUserFromSAMLToken(authCode, sessionStorage.getItem('state'), 'OAuth').subscribe(
        res => {
          if (res) {
            this.router.navigateByUrl(this.returnUrl);
          }
          this.checkingToken = false;
        },
        error => {
          this.checkingToken = false;
          clearTimeout(this.logoutTimer);
          this.error = error;
        }
      );
    } else if (this.authService.hasCookie) { // Otherwise check if the HttpOnly cookie has been set
      this.checkingToken = true;
      this.showLogoutBtn = false;
      this.logoutTimer = this.showLogoutBtnAfterTimeout();

      this.authService.setUserFromRefreshToken().subscribe(
        res => {
          if (res) {
            this.router.navigateByUrl(this.returnUrl);
          }
          this.checkingToken = false;
        },
        error => {
          this.checkingToken = false;
          clearTimeout(this.logoutTimer);
          this.error = error;
        }
      );
    }

    this.form = this.formBuilder.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });

    this.allowRegistration = environment.allow_registration;
  }

  get f() { return this.form.controls; }

  launch() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.showLogoutBtn = false;
    this.authService.launch(this.f.username.value, this.f.password.value)
      .subscribe(
        () => {
          this.router.navigateByUrl(this.returnUrl);
          this.showLogoutBtnAfterTimeout();
        },
        err => {
          this.loading = false;
          this.error = err;
          }
        );
  }

  showLogoutBtnAfterTimeout() {
    setTimeout(() => this.showLogoutBtn = true, 8000);
  }

  logout() {
    this.loading = false;
    this.authService.logout();
    location.href = location.origin + location.pathname; // remove queryParams & reload
  }

  encodeQueryData(data: {[key: string]: any}): string {
    const ret = [];
    for (const d of Object.keys(data)) {
      ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    }
    return ret.join('&');
  }

  generateNonce(): string {
    const randomNumbers = new Uint32Array(8);
    crypto.getRandomValues(randomNumbers);

    let total = '';
    for (const n of randomNumbers) {
      total += n.toString(16);
    }
    return total;
  }

  launchWithSaml() {
    const NONCE = this.generateNonce();
    const CLIENTID = environment.saml_client_id;
    const CALLBACK = window.location.protocol + '//' + window.location.host + '/launch';

    const params = {
      scope: 'openid',
      response_type: 'code',
      redirect_uri: CALLBACK,
      nonce: NONCE,
      client_id: CLIENTID
    };
    const url = environment.saml_auth_url + '/authorize?' + this.encodeQueryData(params);
    sessionStorage.setItem('nonce', NONCE);
    sessionStorage.setItem('SAMLlaunch', 'true');

    window.location.href = url;
  }

  launchWithOAuth() {
    const NONCE = this.generateNonce();
    const CLIENTID = environment.oauth_client_id;
    const CALLBACK = window.location.protocol + '//' + window.location.host + '/launch';

    const params = {
      scope: 'openid profile email',
      response_type: 'code',
      redirect_uri: CALLBACK,
      state: NONCE,
      client_id: CLIENTID
    };
    const url = environment.oauth_auth_url + '/authorize?' + this.encodeQueryData(params);
    sessionStorage.setItem('state', NONCE);
    sessionStorage.setItem('OAuthlaunch', 'true');

    window.location.href = url;
  }


  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
    if (this.isPasswordVisible) {
      this.passwordField.nativeElement.type = 'text';
    } else {
      this.passwordField.nativeElement.type = 'password';
    }
  }

}
