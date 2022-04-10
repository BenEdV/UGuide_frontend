import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { VideoComponent } from 'src/app/shared/components/video/video.component';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
  acceptedResources: string[];

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.acceptedResources = this.getAcceptedResources();
  }

  getAcceptedResources(): string[] {
    const key = VideoComponent.storageKey + this.authService.user.id.toString();
    return JSON.parse(localStorage.getItem(key)) || [];
  }

  deleteAcceptedResource(resource: string) {
    const idx = this.acceptedResources.findIndex(r => r === resource);
    this.acceptedResources.splice(idx, 1);
    if (this.acceptedResources.length === 0) {
      localStorage.removeItem(`${VideoComponent.storageKey}${this.authService.user.id}`);
    } else {
      localStorage.setItem(`${VideoComponent.storageKey}${this.authService.user.id}`, JSON.stringify(this.acceptedResources));
    }
    this.acceptedResources = this.getAcceptedResources();
  }

}
