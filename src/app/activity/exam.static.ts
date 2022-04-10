import { Activity, ActivityResult } from '../core/interfaces/activity';
import { ActivityStatic } from './activity.static';

export class ExamStatic {
  static getQuestions(exam: Activity): Activity[] {
    if (!exam || !exam.head_activities) {
      return [];
    }

    return exam.head_activities.filter(ha => ha.relation_type === 'exam_question');
  }

  static getGradeFromResult(result: ActivityResult): number {
    if (!result) {
      return null;
    }

    let grade = ActivityStatic.findExtensionOfResult(result, 'grade');
    if (!grade) {
      grade = result.result.score?.scaled * 10.0;
    }
    return grade;
  }

  static getAllGrades(exam: Activity): number[] {
    let grades = ActivityStatic.findExtensionOfAllResults(exam, 'grade');
    if (grades.length === 0) {
      grades = exam.latest_results.map(result => result.result.score?.scaled * 10.0);
    }
    return grades;
  }

  static getUserGrade(exam: Activity, userId?: number): number {
    let result: ActivityResult;
    if (!userId) {
      result = exam.my_latest_result;
    } else {
      result = exam.latest_results.find(examResult => examResult.user_id === userId);
    }

    return ExamStatic.getGradeFromResult(result);
  }

  static getUsersAverageGrade(exams: Activity[], userIds: number[]): number {
    if (!exams || exams.length === 0 || !userIds || userIds.length === 0) {
      return null;
    }

    let gradeSum = 0;
    let resultCount = 0;
    for (const exam of exams) {
      for (const userId of userIds) {
        const grade = ExamStatic.getUserGrade(exam, userId);
        if (grade) {
          resultCount++;
          gradeSum += grade;
        }
      }
    }

    if (resultCount === 0) {
      return null;
    }

    return gradeSum / resultCount;
  }
}
