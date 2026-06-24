// src/components/pages/disciplinePage/disciplinePage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../../../utils/auth';
import { pollService } from '../../../services/pollService';
import styles from './disciplinePage.module.scss';

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

interface AttendanceRecord {
  id: string;
  disciplineId: string;
  studentId: string;
  date: string;
  grade: string;
  status: 'П' | 'Н';
}

const generateMonthDates = (): string[] => {
  const dates: string[] = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (date <= today) {
      const formatted = `${String(day).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${String(year).slice(2)}`;
      dates.push(formatted);
    }
  }
  return dates.reverse();
};

const DisciplinePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<Student | null>(null);
  const [disciplineName, setDisciplineName] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPollActive, setIsPollActive] = useState(false);
  const [isMarked, setIsMarked] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);

      try {
        const userData = getUser();
        if (userData) {
          setUser(userData as Student);
        }

        const disciplineRes = await fetch(`http://localhost:4000/disciplines/${id}`);
        if (disciplineRes.ok) {
          const discipline: Discipline = await disciplineRes.json();
          setDisciplineName(discipline.name);
        }

        const monthDates = generateMonthDates();
        
        let savedRecords: AttendanceRecord[] = [];
        if (userData) {
          const student = userData as Student;
          const attendanceRes = await fetch(
            `http://localhost:4000/attendance?studentId=${student.id}&disciplineId=${id}`
          );
          if (attendanceRes.ok) {
            savedRecords = await attendanceRes.json();
          }
        }

        const poll = pollService.getActivePoll();
        const pollStatus = poll && userData ? pollService.getStudentStatus(userData.id) : null;

        const combinedData: AttendanceRecord[] = monthDates.map((date) => {
          const saved = savedRecords.find((r) => r.date === date);
          if (saved) {
            const status = pollStatus || saved.status;
            return {
              ...saved,
              status: status as 'П' | 'Н',
            };
          } else {
            return {
              id: `${Date.now()}_${date}`,
              disciplineId: id || '',
              studentId: userData?.id || '',
              date: date,
              grade: '-',
              status: pollStatus || 'Н',
            };
          }
        });

        setAttendanceData(combinedData);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        const monthDates = generateMonthDates();
        const fallbackData: AttendanceRecord[] = monthDates.map((date) => ({
          id: `${Date.now()}_${date}`,
          disciplineId: id || '',
          studentId: '',
          date: date,
          grade: '-',
          status: 'Н',
        }));
        setAttendanceData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const checkPoll = () => {
      const poll = pollService.getActivePoll();
      if (poll && poll.isActive && user) {
        setIsPollActive(true);
        const marked = pollService.isStudentMarked(user.id);
        setIsMarked(marked);
        if (!marked) {
          setShowNotification(true);
        }
        const pollStatus = pollService.getStudentStatus(user.id);
        if (pollStatus) {
          setAttendanceData((prev) =>
            prev.map((record) => {
              const today = new Date();
              const formattedDate = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getFullYear()).slice(2)}`;
              if (record.date === formattedDate) {
                return { ...record, status: pollStatus };
              }
              return record;
            })
          );
        }
      } else {
        setIsPollActive(false);
        if (showNotification) {
          setTimeout(() => setShowNotification(false), 3000);
        }
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

  const handleBack = () => {
    navigate('/student');
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const handleMarkAttendance = async () => {
    if (!user || !id) return;

    const poll = pollService.getActivePoll();
    if (!poll || !poll.isActive) {
      alert('Опрос не активен!');
      return;
    }

    const success = pollService.markStudent(user.id);
    if (success) {
      setIsMarked(true);
      setShowNotification(true);

      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getFullYear()).slice(2)}`;

      setAttendanceData((prev) =>
        prev.map((record) => {
          if (record.date === formattedDate) {
            return { ...record, status: 'П' };
          }
          return record;
        })
      );

      const existingRecord = attendanceData.find((r) => r.date === formattedDate);
      if (!existingRecord) {
        const newRecord = {
          disciplineId: id,
          studentId: user.id,
          date: formattedDate,
          grade: '-',
          status: 'П' as const,
        };

        try {
          await fetch('http://localhost:4000/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRecord),
          });
        } catch (error) {
          console.error('Ошибка сохранения:', error);
        }
      } else {
        try {
          await fetch(`http://localhost:4000/attendance/${existingRecord.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'П' }),
          });
        } catch (error) {
          console.error('Ошибка обновления:', error);
        }
      }

      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    } else {
      alert('Опрос уже завершён!');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.disciplinePageContainer}>
      {showNotification && (
        <div className={`${styles.pollNotification} ${isMarked ? styles.marked : ''}`}>
          <button className={styles.notificationClose} onClick={handleCloseNotification}>
            ✕
          </button>
          <div className={styles.pollContent}>
            <div className={styles.pollIcon}>
              {isMarked ? '✅' : '🔔'}
            </div>
            <div className={styles.pollMessage}>
              <div className={styles.pollTitle}>
                {isMarked
                  ? 'Вы отметились на опросе!'
                  : 'Преподаватель начал опрос присутствия!'}
              </div>
              <div className={styles.pollSubtitle}>
                {isMarked ? 'Статус: Присутствует' : 'Нажмите "Отметиться" чтобы подтвердить'}
              </div>
            </div>
            {!isMarked && (
              <button className={styles.pollButton} onClick={handleMarkAttendance}>
                Отметиться
              </button>
            )}
            {isMarked && (
              <div className={styles.markedStatus}>✅ Отмечен</div>
            )}
          </div>
        </div>
      )}

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
            <div className={styles.tableScroll}>
              <table className={styles.attendanceTable}>
                <thead>
                  <tr>
                    <th>ДАТА</th>
                    <th>ОЦЕНКА</th>
                    <th>Н/П</th>
                    <th>ОТМЕТИТЬСЯ</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.length > 0 ? (
                    attendanceData.map((record) => (
                      <tr key={record.id}>
                        <td>{record.date}</td>
                        <td>{record.grade || '-'}</td>
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
                            disabled={record.status === 'П'}
                            onClick={() => {
                              if (isPollActive && !isMarked) {
                                handleMarkAttendance();
                              } else {
                                alert('Опрос не активен или вы уже отметились!');
                              }
                            }}
                          >
                            {record.status === 'П' ? '✅ Отмечен' : 'Отметиться'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className={styles.noData}>
                        Нет данных о посещаемости
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DisciplinePage;