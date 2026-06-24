// src/components/pages/mainStudent/mainStudent.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../../../utils/auth';
import styles from './mainStudent.module.scss';

interface Student {
  id: string;
  login: string;
  fullName: string;
  groupId: number;
  role: string;
}

interface Discipline {
  id: string;
  name: string;
  teacherId: string;
}

const MainStudent: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<Student | null>(null);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      setUser(userData as Student);
    }

    const fetchDisciplines = async () => {
      try {
        const response = await fetch('http://localhost:4000/disciplines');
        if (response.ok) {
          const data = await response.json();
          setDisciplines(data);
        } else {
          console.error('Ошибка загрузки дисциплин');
        }
      } catch (error) {
        console.error('Ошибка:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDisciplines();
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleDisciplineClick = (disciplineId: string) => {
    navigate(`/student/discipline/${disciplineId}`);
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.studentContainer}>
      {/* Шапка */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}></div>
          <div className={styles.headerTitles}>
            <h1 className={styles.pageTitle}>Дисциплины</h1>
            <span className={styles.pageSubtitle}>Выбор дисциплины</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.fullName || 'Пользователь'}</span>
            <span className={styles.userRole}>Студент</span>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Выход
          </button>
        </div>
      </header>

      {/* Основной контент */}
      <main className={styles.mainContent}>
        <div className={styles.disciplinesGrid}>
          {disciplines.length > 0 ? (
            disciplines.map((discipline) => (
              <div
                key={discipline.id}
                className={styles.disciplineCard}
                onClick={() => handleDisciplineClick(discipline.id)}
              >
                <span className={styles.disciplineName}>{discipline.name}</span>
              </div>
            ))
          ) : (
            <p className={styles.noDisciplines}>Нет доступных дисциплин</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default MainStudent;