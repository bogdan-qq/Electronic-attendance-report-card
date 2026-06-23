import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Login } from '../components/pages/login/login.tsx';
import { MainStudent } from '../components/pages/mainStudent/mainStudent.tsx';
import { MainTeacher } from '../components/pages/mainTeacher/mainTeacher.tsx';
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
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <MainStudent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <MainTeacher />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
