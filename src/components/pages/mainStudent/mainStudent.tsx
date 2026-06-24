// src/components/pages/mainStudent/mainStudent.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../../../utils/auth';
import { pollService } from '../../../services/pollService';
import styles from './mainStudent.module.scss';

interface Student {
  id: string;
  login: string;
  password: string;
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
  const [pollNotification, setPollNotification] = useState<{
    show: boolean;
    disciplineName: string;
    remainingTime: number;
    isActive: boolean;
    isMarked: boolean;
  }>({
    show: false,
    disciplineName: '',
    remainingTime: 0,
    isActive: false,
    isMarked: false,
  });

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

  useEffect(() => {
    const checkPoll = () => {
      const poll = pollService.getActivePoll();
      if (poll && poll.isActive && user) {
        const remaining = Math.max(0, Math.floor((poll.endTime - Date.now()) / 1000));
        const isMarked = pollService.isStudentMarked(user.id);
        setPollNotification({
          show: true,
          disciplineName: poll.disciplineName,
          remainingTime: remaining,
          isActive: remaining > 0,
          isMarked,
        });
      } else {
        setPollNotification((prev) => ({
          ...prev,
          show: false,
        }));
      }
    };

    checkPoll();
    const interval = setInterval(checkPoll, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleDisciplineClick = (disciplineId: string) => {
    navigate(`/student/discipline/${disciplineId}`);
  };

  const handleMarkAttendance = () => {
    if (!user) return;
    const success = pollService.markStudent(user.id);
    if (success) {
      setPollNotification((prev) => ({
        ...prev,
        isMarked: true,
      }));
      alert('Вы успешно отметились!');
    } else {
      alert('Опрос уже завершён!');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.studentContainer}>
      {pollNotification.show && pollNotification.isActive && (
        <div className={`${styles.pollNotification} ${pollNotification.isMarked ? styles.marked : ''}`}>
          <div className={styles.pollContent}>
            <div className={styles.pollIcon}>
              {pollNotification.isMarked ? '✅' : '🔔'}
            </div>
            <div className={styles.pollMessage}>
              <div className={styles.pollTitle}>
                {pollNotification.isMarked
                  ? 'Вы отметились на опросе!'
                  : 'Преподаватель начал опрос присутствия!'}
              </div>
              <div className={styles.pollSubtitle}>
                Дисциплина: {pollNotification.disciplineName}
              </div>
              <div className={styles.pollTimer}>
                ⏱ Осталось: {formatTime(pollNotification.remainingTime)}
              </div>
            </div>
            {!pollNotification.isMarked && pollNotification.isActive && (
              <button className={styles.pollButton} onClick={handleMarkAttendance}>
                Отметиться
              </button>
            )}
            {pollNotification.isMarked && (
              <div className={styles.markedStatus}>✅ Отмечен</div>
            )}
          </div>
        </div>
      )}

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