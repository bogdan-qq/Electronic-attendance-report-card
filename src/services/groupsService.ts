// src/services/groupsService.ts

import { API_URL, handleResponse, getAuthHeaders } from '../utils';
import type { DbGroup, DbDiscipline } from '../types/user';

export const groupsService = {
  // Получить группу по ID
  async getGroupById(groupId: number): Promise<DbGroup> {
    const response = await fetch(`${API_URL}/groups/${groupId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DbGroup>(response);
  },

  // Получить все группы
  async getAllGroups(): Promise<DbGroup[]> {
    const response = await fetch(`${API_URL}/groups`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DbGroup[]>(response);
  },

  // Получить дисциплины группы
  async getDisciplinesByGroup(groupId: number): Promise<DbDiscipline[]> {
    const response = await fetch(`${API_URL}/disciplines?groupId=${groupId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DbDiscipline[]>(response);
  },

  // Получить все дисциплины
  async getAllDisciplines(): Promise<DbDiscipline[]> {
    const response = await fetch(`${API_URL}/disciplines`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DbDiscipline[]>(response);
  },

  // Создать группу
  async createGroup(group: Omit<DbGroup, 'id'>): Promise<DbGroup> {
    const response = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(group),
    });
    return handleResponse<DbGroup>(response);
  },
};