import { Construct } from '../core/interfaces/construct';
import { Score } from '../core/interfaces/score';

export class ConstructStatic {
  static routerLinkHelper(construct: Construct, collectionId: number): (string | number)[] {
    return ['/', 'collections', collectionId, 'constructs', construct.id];
  }

  static isConstructNegative(construct: Construct): boolean {
    const negatives = ['misconception', 'negative_trait'];
    return negatives.indexOf(construct.type) !== -1;
  }

  static isConstructPositive(construct: Construct): boolean {
    const positives = ['concept', 'positive_trait'];
    return positives.indexOf(construct.type) !== -1;
  }

  static isConstructLeaf(construct: Construct): boolean {
    return construct.head_constructs.length === 0; // has no children
  }

  static isConstructRoot(construct: Construct): boolean {
    return construct.tail_constructs.length === 0; // has no parents
  }

  static getPositiveLeafs(constructs: Construct[]): Construct[] {
    return constructs.filter(c => ConstructStatic.isConstructLeaf(c) && ConstructStatic.isConstructPositive(c));
  }

  static getNegativeLeafs(constructs: Construct[]): Construct[] {
    return constructs.filter(c => ConstructStatic.isConstructLeaf(c) && ConstructStatic.isConstructNegative(c));
  }

  static getLatestScore(construct: Construct, userIds?: number[]): number { // get latest user/average score for one construct and n users
    if (!userIds || userIds.length === 1) {
      return ConstructStatic.getLatestUserScore(construct, userIds && userIds[0]);
    }
    return ConstructStatic.getLatestUsersAverage([construct], userIds);
  }

  static getLatestUserScore(construct: Construct, userId?: number): number { // get latest score of a single user
    if (!userId) {
      return construct.my_latest_score?.score;
    }

    return construct.latest_user_scores?.find(userScore => userScore.user_id === userId)?.score;
  }

  static getUsersScores(constructs: Construct[], userIds: number[]): Score[] {
    const result = [];
    for (const construct of constructs) {
      const userScores = construct.user_scores?.filter(score => userIds.indexOf(score.user_id) !== -1);
      if (userScores) {
        result.push(...userScores);
      }
    }
    return result;
  }

  static getLatestUsersAverage(constructs: Construct[], userIds: number[]): number { // get average of multiple constructs and users
    if (!userIds || userIds.length === 0) {
      return null;
    }

    let summation = 0;
    let scoreCount = 0;
    for (const construct of constructs) {
      if (!construct.latest_user_scores || construct.latest_user_scores.length === 0) {
        continue;
      }

      const userScores = userIds.map(userId => ConstructStatic.getLatestUserScore(construct, userId))
                          .filter(res => res !== undefined);
      if (!userScores || userScores.length === 0) {
        continue;
      }

      scoreCount += userScores.length;
      for (const score of userScores) {
        summation += score;
      }
    }

    return scoreCount > 0 ? summation / scoreCount : null;
  }
}
