// src/types/index.ts

export interface User {
    id: number;
    login: string;
    password: string;
    role: 'student' | 'teacher';
    groupId?: number; // для студента
    fullName?: string;
  }
  
  export interface Group {
    id: number;
    name: string; // например "ИС-21"
    course: number;
    specialty: string;
  }
  
  export interface Discipline {
    id: number;
    name: string;
    groupId: number;
    teacherId: number;
  }
  
  export interface Attendance {
    id: number;
    studentId: number;
    disciplineId: number;
    date: string; // "2026-06-20"
    status: 'P' | 'N' | 'L' | 'E'; // P - присутствовал, N - отсутствовал, L - опоздал, E - уважительная причина
    reason?: string;
  }
  
  export interface Student {
    id: number;
    fullName: string;
    groupId: number;
    email?: string;
  }
  
  export interface Teacher {
    id: number;
    fullName: string;
    email?: string;
  }
  
  export interface AuthResponse {
    user: User;
    token: string;
  }