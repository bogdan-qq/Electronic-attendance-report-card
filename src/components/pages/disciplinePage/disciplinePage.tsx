// src/components/pages/disciplinePage/disciplinePage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../../../utils/auth';
import styles from './disciplinePage.module.scss';

interface Student {
  id: string;
  login: string;
  fullName: string;
  groupId: number;
  role: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  grade: string;
  status: 'П' | 'Н';
}

const DisciplinePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<Student | null>(null);
  const [disciplineName, setDisciplineName] = useState<string>('');

  // Временные данные для демонстрации
  const attendanceData: AttendanceRecord[] = [
    { id: '1', date: '12.12.26', grade: '-', status: 'Н' },
    { id: '2', date: '13.12.26', grade: '5', status: 'П' },
    { id: '3', date: '14.12.26', grade: '5', status: 'П' },
  ];

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      setUser(userData as Student);
    }

    const fetchDiscipline = async () => {
      try {
        const response = await fetch(`http://localhost:4000/disciplines/${id}`);
        if (response.ok) {
          const data = await response.json();
          setDisciplineName(data.name);
        } else {
          setDisciplineName('Дисциплина не найдена');
        }
      } catch (error) {
        console.error('Ошибка загрузки дисциплины:', error);
        setDisciplineName('Ошибка загрузки');
      }
    };

    if (id) {
      fetchDiscipline();
    }
  }, [id]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/student');
  };

  const handleMarkAttendance = (recordId: string) => {
    console.log('Отметиться для записи:', recordId);
  };

  return (
    <div className={styles.disciplinePageContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backButton} onClick={handleBack}>
            ← Назад
          </button>
          <div className={styles.headerTitles}>
            <h1 className={styles.pageTitle}>Дисциплины</h1>
            <span className={styles.pageSubtitle}>Информация по дисциплине</span>
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
        <div className={styles.contentWrapper}>
          <h2 className={styles.disciplineTitle}>{disciplineName}</h2>

          <div className={styles.tableWrapper}>
            <table className={styles.attendanceTable}>
              <thead>
                <tr>
                  <th>ДАТА</th>
                  <th>ОЦЕНКА</th>
                  <th>Н/П</th>
                  <th className={styles.markColumn}>ОТМЕТИТЬСЯ</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record) => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>{record.grade}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          record.status === 'П' ? styles.statusPresent : styles.statusAbsent
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`${styles.markButton} ${
                          record.status === 'Н' ? styles.markButtonAbsent : ''
                        }`}
                        onClick={() => handleMarkAttendance(record.id)}
                      >
                        Отметиться
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DisciplinePage;