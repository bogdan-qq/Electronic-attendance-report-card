// src/services/attendanceService.ts

import { API_URL, handleResponse, getAuthHeaders } from '../utils';
import type { DbAttendance } from '../types/user';

interface CreateAttendanceDTO {
  studentId: number;
  disciplineId: number;
  date: string;
  status: 'P' | 'N' | 'L' | 'E';
  reason?: string;
}

export const attendanceService = {
  // Получить посещаемость студента
  async getAttendanceByStudent(studentId: number): Promise<DbAttendance[]> {
    const response = await fetch(`${API_URL}/attendance?studentId=${studentId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DbAttendance[]>(response);
  },

  // Получить посещаемость по дисциплине
  async getAttendanceByDiscipline(disciplineId: number): Promise<DbAttendance[]> {
    const response = await fetch(`${API_URL}/attendance?disciplineId=${disciplineId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DbAttendance[]>(response);
  },

  // Получить посещаемость студента по дисциплине
  async getAttendanceByStudentAndDiscipline(
    studentId: number,
    disciplineId: number
  ): Promise<DbAttendance[]> {
    const response = await fetch(
      `${API_URL}/attendance?studentId=${studentId}&disciplineId=${disciplineId}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<DbAttendance[]>(response);
  },

  // Добавить запись посещаемости
  async createAttendance(data: CreateAttendanceDTO): Promise<DbAttendance> {
    const response = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<DbAttendance>(response);
  },

  // Обновить запись посещаемости
  async updateAttendance(
    id: number,
    data: Partial<CreateAttendanceDTO>
  ): Promise<DbAttendance> {
    const response = await fetch(`${API_URL}/attendance/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<DbAttendance>(response);
  },

  // Удалить запись посещаемости
  async deleteAttendance(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/attendance/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete attendance record: ${response.status}`);
    }
  },

  // Получить посещаемость за период
  async getAttendanceByDateRange(
    studentId: number,
    startDate: string,
    endDate: string
  ): Promise<DbAttendance[]> {
    const response = await fetch(
      `${API_URL}/attendance?studentId=${studentId}&date_gte=${startDate}&date_lte=${endDate}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<DbAttendance[]>(response);
  },
};