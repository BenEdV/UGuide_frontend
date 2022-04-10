import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/core/interfaces/user';
import { switchMap } from 'rxjs/operators';
import { RecaptchaComponent } from 'ng-recaptcha';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  @ViewChild('captcha', {static: false}) captcha: RecaptchaComponent;
  registerForm: FormGroup;
  submitted = false;
  loading = false;
  captchaSiteKey = environment.captcha_site_key;
  errorMessage: string = null;
  returnUrl: string;

  userAgreementText = environment.user_agreement_i18n_key;

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) { }

  get c() { return this.registerForm.controls; }

  ngOnInit() {
    if (!environment.allow_registration) {
      this.router.navigate(['/', 'page-not-found']);
    }

    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';

    this.registerForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      institutionId: new FormControl(null, Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwordConf: new FormControl(''),
      userAgree: new FormControl(false, Validators.requiredTrue),
      recaptcha: new FormControl(null, Validators.required)
    }, this.mustMatch('password', 'passwordConf'));
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup): ValidationErrors => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
          // return if another validator has already found an error on the matchingControl
          return;
      }

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
          matchingControl.setErrors({ mustMatch: true });
      } else {
          matchingControl.setErrors(null);
      }
    };
  }

  register() {
    this.submitted = true;
    this.loading = true;
    this.errorMessage = null;

    if (this.registerForm.valid) {
      this.authService.register(
        this.c.firstName.value,
        this.c.lastName.value,
        this.c.email.value,
        this.c.password.value,
        this.c.institutionId.value,
        this.c.recaptcha.value
      )
        .pipe(
          switchMap(() => this.authService.login(this.c.email.value, this.c.password.value))
        ).subscribe(
          (res) => {
            this.authService.setUser(res as unknown as User);
            this.router.navigate([this.returnUrl]);
          },
          (error) => {
            this.loading = false;
            this.errorMessage = error;
            this.captcha.reset();
          }
        );
    } else {
      this.loading = false;
    }
  }

  resolved($event) {
  }

}
