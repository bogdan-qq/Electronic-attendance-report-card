// src/utils/auth.ts

import type { User } from '../types/user';

export type UserRole = 'teacher' | 'student' | null;

export const setAuth = (user: User, token: string): void => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
};

export const clearAuth = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
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

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('user');
};

export const getUserRole = (): UserRole => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    const user: User = JSON.parse(userData);
    return (user.role as UserRole) || null;
  } catch {
    return null;
  }
};