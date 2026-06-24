import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Login from '../components/pages/login/login';
import MainStudent from '../components/pages/mainStudent/mainStudent';
import MainTeacher from '../components/pages/mainTeacher/mainTeacher';
import DisciplinePage from '../components/pages/disciplinePage/disciplinePage';
import TeacherGroupPage from '../components/pages/teacherGroupPage/teacherGroupPage';
import { getUserRole, isAuthenticated, type UserRole } from '../utils/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  role: UserRole;
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (getUserRole() !== role) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const Router = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Студент */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <MainStudent />
          </ProtectedRoute>
        }
      />

      {/* Страница дисциплины для студента */}
      <Route
        path="/student/discipline/:id"
        element={
          <ProtectedRoute role="student">
            <DisciplinePage />
          </ProtectedRoute>
        }
      />

      {/* Учитель */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <MainTeacher />
          </ProtectedRoute>
        }
      />

      {/* Страница группы для преподавателя */}
      <Route
        path="/teacher/group/:groupId"
        element={
          <ProtectedRoute role="teacher">
            <TeacherGroupPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};