import { Activity, ActivityResult } from '../core/interfaces/activity';
import { ConstructActivity } from '../core/interfaces/construct';

export class ActivityStatic {
  static routerLinkHelper(activity: Activity, collectionId: number, relative: boolean = false, options: any = {}): (string | number)[] {
    let result = [];
    const prefix = relative ? [] : ['/', 'collections', activity.collection_id || collectionId];
    const activityType = activity.type.split('.')[0];

    switch (activityType) {
      case 'exam':
        result = [...prefix, 'exams', activity.id];
        break;
      case 'survey':
        prefix.push('surveys', activity.id);
        const completedRedirect = [...prefix, ...(activity.properties?.redirect_on_complete || [])];
        const questionRedirect = [...prefix, 'questions'];

        if (options.force_results) {
          result = completedRedirect;
          break;
        }

        if (options.force_questions) {
          result = questionRedirect;
          break;
        }

        if (activity.properties?.see_results_before_completion || ActivityStatic.isCompleted(activity)) {
          result = completedRedirect;
          break;
        }

        result = questionRedirect;
        break;
      case 'question':
        const parentLink = ActivityStatic.routerLinkHelper(activity.tail_activities[0], collectionId, true)[0];
        result = [...prefix, parentLink, activity.tail_activities[0].id, 'questions', activity.id];
        break;
      case 'material':
        result = [...prefix, 'material', activity.id];
        break;
      default:
        console.warn(`Received unknown activity type: ${activityType}`);
        result = [...prefix, activityType + 's', activity.id];
    }

    return ActivityStatic.doubleDotRouteFix(result);
  }

  static doubleDotRouteFix(routeList: (string | number)[]): (string | number)[] {
    const result = [];
    let i = 0;
    for (const routePart of routeList) {
      if (routePart === '..' && i > 0) {
        i--;
      } else {
        result[i] = routePart;
        i++;
      }
    }

    return result;
  }

  static findExtensionOfResult(result: ActivityResult, key: string, separator: string = '/') {
    if (!result || !result.result || !result.result.extensions) {
      return null;
    }

    const extensionKey = Object.keys(result.result.extensions).find(fullExtensionKey => {
      const splitKey = fullExtensionKey.split(separator);
      return splitKey[splitKey.length - 1] === key;
    });

    return extensionKey ? result.result.extensions[extensionKey] : null;
  }

  static findExtensionOfMyResult(activity: Activity, key: string, separator: string = '/') {
    if (!activity || !activity.my_latest_result) {
      return null;
    }

    return ActivityStatic.findExtensionOfResult(activity.my_latest_result, key, separator);
  }

  static findExtensionOfAllResults(activity: Activity, key: string, separator: string = '/') {
    if (!activity || !activity.latest_results || activity.latest_results.length === 0) {
      return [];
    }

    return activity.latest_results
            .map(result => ActivityStatic.findExtensionOfResult(result, key, separator))
            .filter(result => result !== null);
  }

  static amountSuccess(activity: Activity) {
    if (!activity || !activity.latest_results || activity.latest_results.length === 0) {
      return null;
    }

    const amountPassed = activity.latest_results.map(result => result.result.success ? 1 : 0).reduce((a, b) => a + b, 0);
    return amountPassed / activity.latest_results.length;
  }

  static isInitialized(activity: Activity, userId?: number): boolean {
    const results = ActivityStatic.getUserResults(activity, userId);
    return ActivityStatic.indexOfInitialized(results) !== -1;
  }

  static isCompleted(activity: Activity, userId?: number): boolean {
    const results = ActivityStatic.getUserResults(activity, userId);
    const completedIdx = ActivityStatic.indexOfCompleted(results);
    const initializedIdx = ActivityStatic.indexOfInitialized(results);
    return completedIdx !== -1 && completedIdx < initializedIdx;
  }

  static indexOfInitialized(results: ActivityResult[]): number {
    return ActivityStatic.indexOfVerb(results, 'initialized');
  }

  static indexOfCompleted(results: ActivityResult[]): number {
    return ActivityStatic.indexOfVerb(results, 'completed');
  }

  static indexOfVerb(results: ActivityResult[], verb: string, separator: string = '/'): number {
    if (!results) {
      return -1;
    }

    for (let i = 0; i < results.length; i++) {
      if (!results[i].verb || !results[i].verb.id) {
        continue;
      }

      const verbIdParts = results[i].verb.id.split(separator);
      if (verbIdParts[verbIdParts.length - 1] === verb) {
        return i;
      }
    }

    return -1;
  }

  static isActivityOfType(activity: Activity | ConstructActivity, type: string) {
    return activity.type.startsWith(type);
  }

  static getLatestUserResult(activity: Activity, userId: number): ActivityResult {
    if (!userId) {
      return activity.my_latest_result;
    }

    return activity.latest_results?.find(result => result.user_id === userId);
  }

  static getUserResults(activity: Activity, userId?: number): ActivityResult[] {
    if (!userId) {
      return activity.my_results;
    }

    return activity.results?.filter(result => result.user_id === userId);
  }
}
