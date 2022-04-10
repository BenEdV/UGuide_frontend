import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-saml-logout',
  templateUrl: './saml-logout.component.html',
  styleUrls: ['./saml-logout.component.scss']
})
export class SamlLogoutComponent implements OnInit {
  SAMLLogoutUrl = environment.saml_logout_url;
  projectName = environment.project_name;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    if (!sessionStorage.getItem('SAMLlogin')) {
      this.router.navigate(['login'], {queryParams: this.route.snapshot.queryParams});
    }
  }

  SAMLlogout() {
    window.open(this.SAMLLogoutUrl, '_blank');
    sessionStorage.removeItem('nonce');
    sessionStorage.removeItem('SAMLlogin');
    this.router.navigate(['login']);
  }

}
