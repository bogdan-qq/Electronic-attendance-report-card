// src/types/user.ts

export type UserRole = 'student' | 'teacher';

/** Данные пользователя после входа (без пароля) */
export interface User {
  id: string;
  login: string;
  fullName: string;
  role: UserRole;
  groupId?: number; // только у студентов
}

/** Запись преподавателя в db.json */
export interface DbTeacher {
  id: string;
  login: string;
  password: string;
  fullName: string;
}

/** Запись студента в db.json */
export interface DbStudent {
  id: string;
  login: string;
  password: string;
  fullName: string;
  groupId: number;
}

/** Запись группы в db.json */
export interface DbGroup {
  id: number;
  name: string;
  course: number;
  specialty: string;
}

/** Запись дисциплины в db.json */
export interface DbDiscipline {
  id: number;
  name: string;
  groupId: number;
  teacherId: number;
}

/** Запись посещаемости в db.json */
export interface DbAttendance {
  id: number;
  studentId: number;
  disciplineId: number;
  date: string;
  status: 'P' | 'N' | 'L' | 'E';
  reason?: string;
}