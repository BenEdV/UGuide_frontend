import { environment } from '../../environments/environment';

export class CollectionStatic {
  static getColectionRoute(maySeeUserResults: boolean): string {
    if (environment.collection_homepage) {
      return environment.collection_homepage;
    }

    if (maySeeUserResults) {
      return 'overview';
    }

    return 'my-progress';
  }
}
