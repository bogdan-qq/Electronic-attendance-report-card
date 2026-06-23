// src/services/studentsService.ts

import { API_URL, handleResponse, getAuthHeaders } from '../utils';
import type { DbStudent } from '../types/user';

export const studentsService = {
  // Получить студентов группы
  async getStudentsByGroup(groupId: number): Promise<DbStudent[]> {
    const response = await fetch(`${API_URL}/students?groupId=${groupId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DbStudent[]>(response);
  },

  // Получить всех студентов
  async getAllStudents(): Promise<DbStudent[]> {
    const response = await fetch(`${API_URL}/students`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DbStudent[]>(response);
  },

  // Получить студента по ID
  async getStudentById(studentId: number): Promise<DbStudent> {
    const response = await fetch(`${API_URL}/students/${studentId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DbStudent>(response);
  },

  // Создать студента
  async createStudent(student: Omit<DbStudent, 'id'>): Promise<DbStudent> {
    const response = await fetch(`${API_URL}/students`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(student),
    });
    return handleResponse<DbStudent>(response);
  },

  // Обновить студента
  async updateStudent(id: number, student: Partial<DbStudent>): Promise<DbStudent> {
    const response = await fetch(`${API_URL}/students/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(student),
    });
    return handleResponse<DbStudent>(response);
  },
};