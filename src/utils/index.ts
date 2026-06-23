// src/utils/index.ts

import type { User } from '../types/user';

export const API_URL = 'http://localhost:4000';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(error?.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const getUser = (): User | null => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    return JSON.parse(userData);
  } catch {
    return null;
  }
};

export const saveUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const saveToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const clearAuth = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('user');
};