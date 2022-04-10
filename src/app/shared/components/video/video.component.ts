import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnChanges {
  static storageKey = 'acceptedResources';

  @Input() src: string;
  @Input() skipPrivacyWarning = false;
  parsedSource: string;
  parsedHost: string;

  resourceLoaded = false;
  resourceAccepted = false;
  rememberResourceAccepted = true;

  validUrl = true;

  constructor(private authService: AuthService) { }

  get localStorageKey(): string { return VideoComponent.storageKey + this.authService.user.id.toString(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.src) {
      const parsedUrl = this.parseUrl(changes.src.currentValue);
      if (!parsedUrl) {
        this.validUrl = false;
        return;
      }
      this.parsedHost = this.parseHost(parsedUrl[3]);
      this.parsedSource = this.parseSource(parsedUrl, this.parsedHost);

      if (!this.parsedSource) {
        this.validUrl = false;
        return;
      }

      if (this.src.startsWith('/assets/') || this.skipPrivacyWarning) { // no need to accept locally hosted content
        this.resourceAccepted = true;
      } else {
        this.resourceLoaded = false;
        const acceptedResources: string[] = JSON.parse(localStorage.getItem(this.localStorageKey)) || [];
        this.resourceAccepted = acceptedResources.indexOf(this.parsedHost) !== -1;
      }
    }
  }

  parseUrl(src: string): string[] {
    // RexEx positions: [url, .., protocol, host, path, .., file, query, hash]
    const regex = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/;
    return src.match(regex);
  }

  parseHost(hostname: string): string {
    const hostParts = hostname.split('.');
    if (hostParts[0] !== 'www') {
      return hostParts[0].toLowerCase();
    }

    return hostParts[1].toLowerCase();
  }

  parseSource(parsedUrl: string[], host: string): string {
    if (host === 'youtube') {
      if (parsedUrl[6] === 'watch') {
        if (!parsedUrl[7] || parsedUrl[7].length === 0) {
          return null;
        }

        const queryParams = parsedUrl[7].slice(1).split('&');
        let videoId: string;
        const otherParams: string[] = [];
        for (const param of queryParams) {
          if (param[0] === 'v') {
            videoId = param.slice(2);
          } else {
            otherParams.push(param);
          }
        }

        if (!videoId) {
          return null;
        }

        if (otherParams.length > 0) {
          return `https://www.youtube.com/embed/${videoId}?${otherParams.join('&')}`;
        }

        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return parsedUrl[0];
  }

  acceptResource() {
    this.resourceAccepted = true;
    if (this.rememberResourceAccepted) {
      const acceptedResources: string[] = JSON.parse(localStorage.getItem(this.localStorageKey)) || [];
      acceptedResources.push(this.parsedHost);
      localStorage.setItem(this.localStorageKey, JSON.stringify(acceptedResources));
    }
  }

}
