// src/components/pages/teacherGroupPage/teacherGroupPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../../../utils/auth';
import { pollService } from '../../../services/pollService';
import styles from './teacherGroupPage.module.scss';

interface Teacher {
  id: string;
  login: string;
  fullName: string;
  role: string;
}

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
  studentId: string;
  disciplineId: string;
  date: string;
  grade: string;
  status: 'П' | 'Н';
}

interface StudentWithAttendance {
  student: Student;
  records: AttendanceRecord[];
}

interface SavedData {
  groupId: string;
  disciplineId: string;
  date: string;
  records: Omit<AttendanceRecord, 'id'>[];
}

const TeacherGroupPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<Teacher | null>(null);
  const [groupName, setGroupName] = useState<string>('');
  const [students, setStudents] = useState<StudentWithAttendance[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPollActive, setIsPollActive] = useState(false);
  const [pollRemainingTime, setPollRemainingTime] = useState<number>(0);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const gradeOptions = ['-', '2', '3', '4', '5'];

  const loadStudentsFromDB = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:4000/students');
      if (response.ok) {
        const data: Student[] = await response.json();
        return data;
      }
      return [];
    } catch {
      return [];
    }
  }, []);

  const loadDisciplinesFromDB = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:4000/disciplines');
      if (response.ok) {
        const data: Discipline[] = await response.json();
        return data;
      }
      return [];
    } catch {
      return [];
    }
  }, []);

  const getStorageKey = useCallback(() => {
    return `attendance_${groupId}_${selectedDiscipline}_${selectedDate}`;
  }, [groupId, selectedDiscipline, selectedDate]);

  const loadSavedData = useCallback(() => {
    if (!groupId || !selectedDiscipline || !selectedDate) return null;
    const key = getStorageKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data: SavedData = JSON.parse(saved);
        return data.records;
      } catch {
        return null;
      }
    }
    return null;
  }, [groupId, selectedDiscipline, selectedDate, getStorageKey]);

  const saveToStorage = useCallback((records: Omit<AttendanceRecord, 'id'>[]) => {
    if (!groupId || !selectedDiscipline || !selectedDate) return;
    const key = getStorageKey();
    const data: SavedData = {
      groupId,
      disciplineId: selectedDiscipline,
      date: selectedDate,
      records,
    };
    localStorage.setItem(key, JSON.stringify(data));
  }, [groupId, selectedDiscipline, selectedDate, getStorageKey]);

  const loadDataForSelection = useCallback(async () => {
    if (!groupId || !selectedDiscipline || !selectedDate) return;
    setIsLoading(true);

    const allStudents = await loadStudentsFromDB();
    const groupStudents = allStudents.filter((s) => s.groupId === Number(groupId));
    const savedRecords = loadSavedData();

    const poll = pollService.getActivePoll();
    const pollStatuses: { [key: string]: 'П' | 'Н' } = {};
    if (poll) {
      for (const [studentId, data] of Object.entries(poll.studentStatuses)) {
        pollStatuses[studentId] = data.status;
      }
    }

    const grouped = groupStudents.map((student) => {
      let record: AttendanceRecord;

      if (savedRecords) {
        const saved = savedRecords.find((r) => r.studentId === student.id);
        if (saved) {
          const pollStatus = pollStatuses[student.id];
          record = {
            id: `${student.id}_${selectedDiscipline}_${selectedDate}`,
            studentId: student.id,
            disciplineId: selectedDiscipline,
            date: selectedDate,
            grade: saved.grade || '-',
            status: pollStatus || saved.status || 'Н',
          };
        } else {
          record = {
            id: `${student.id}_${selectedDiscipline}_${selectedDate}`,
            studentId: student.id,
            disciplineId: selectedDiscipline,
            date: selectedDate,
            grade: '-',
            status: pollStatuses[student.id] || 'Н',
          };
        }
      } else {
        record = {
          id: `${student.id}_${selectedDiscipline}_${selectedDate}`,
          studentId: student.id,
          disciplineId: selectedDiscipline,
          date: selectedDate,
          grade: '-',
          status: pollStatuses[student.id] || 'Н',
        };
      }

      return {
        student,
        records: [record],
      };
    });

    setStudents(grouped);
    setIsLoading(false);
  }, [groupId, selectedDiscipline, selectedDate, loadStudentsFromDB, loadSavedData]);

  const checkPollStatus = useCallback(() => {
    const poll = pollService.getActivePoll();
    if (poll && poll.isActive) {
      setIsPollActive(true);
      const remaining = Math.max(0, Math.floor((poll.endTime - Date.now()) / 1000));
      setPollRemainingTime(remaining);
      if (selectedDiscipline && selectedDate) {
        loadDataForSelection();
      }
    } else {
      setIsPollActive(false);
      setPollRemainingTime(0);
    }
  }, [selectedDiscipline, selectedDate, loadDataForSelection]);

  useEffect(() => {
    checkPollStatus();
    const interval = setInterval(checkPollStatus, 1000);
    return () => clearInterval(interval);
  }, [checkPollStatus]);

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      setUser(userData as Teacher);
    }

    const fetchGroups = async () => {
      try {
        const response = await fetch('http://localhost:4000/groups');
        if (response.ok) {
          const groups = await response.json();
          const group = groups.find((g: any) => g.id === groupId);
          setGroupName(group?.name || 'Группа');
        } else {
          const groups = [
            { id: '1', name: 'ИС11' },
            { id: '2', name: 'ИС12' },
            { id: '3', name: 'ИС21' },
            { id: '4', name: 'ИС22' },
            { id: '5', name: 'ИС31' },
            { id: '6', name: 'ИС32' },
          ];
          const group = groups.find((g) => g.id === groupId);
          setGroupName(group?.name || 'Группа');
        }
      } catch {
        const groups = [
          { id: '1', name: 'ИС11' },
          { id: '2', name: 'ИС12' },
          { id: '3', name: 'ИС21' },
          { id: '4', name: 'ИС22' },
          { id: '5', name: 'ИС31' },
          { id: '6', name: 'ИС32' },
        ];
        const group = groups.find((g) => g.id === groupId);
        setGroupName(group?.name || 'Группа');
      }
    };

    fetchGroups();

    const fetchDisciplines = async () => {
      const data = await loadDisciplinesFromDB();
      if (data.length > 0) {
        setDisciplines(data);
        setSelectedDiscipline(data[0]?.id || '');
      }
    };
    fetchDisciplines();

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getFullYear()).slice(2)}`;
    setSelectedDate(formattedDate);
    setSelectedDay(today.getDate());
    setCurrentMonth(today);
  }, [groupId, loadDisciplinesFromDB]);

  useEffect(() => {
    if (selectedDiscipline && selectedDate) {
      loadDataForSelection();
    }
  }, [selectedDiscipline, selectedDate, loadDataForSelection]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const days = [];
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    for (let i = 0; i < totalCells; i++) {
      let day: number | null = null;
      let isCurrentMonth = true;
      if (i < firstDay) {
        day = daysInPrevMonth - firstDay + i + 1;
        isCurrentMonth = false;
      } else if (i >= firstDay + daysInMonth) {
        day = i - (firstDay + daysInMonth) + 1;
        isCurrentMonth = false;
      } else {
        day = i - firstDay + 1;
        isCurrentMonth = true;
      }
      days.push({ day, isCurrentMonth });
    }
    return days;
  };

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const selectDate = (day: number) => {
    if (day === null) return;
    setSelectedDay(day);
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const formatted = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getFullYear()).slice(2)}`;
    setSelectedDate(formatted);
    setShowCalendar(false);
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/teacher');
  };

  const handleDisciplineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDiscipline(e.target.value);
  };

  const handleGradeChange = (studentId: string, newGrade: string) => {
    setStudents((prev) =>
      prev.map((item) => {
        if (item.student.id === studentId) {
          return {
            ...item,
            records: item.records.map((record) => ({
              ...record,
              grade: newGrade,
            })),
          };
        }
        return item;
      })
    );
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const allRecords = students.flatMap((item) =>
        item.records.map((record) => ({
          studentId: item.student.id,
          disciplineId: selectedDiscipline,
          date: selectedDate,
          grade: record.grade,
          status: record.status,
        }))
      );
      saveToStorage(allRecords);
      alert('Данные успешно сохранены!');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка при сохранении данных');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartPoll = () => {
    const discipline = disciplines.find((d) => d.id === selectedDiscipline);
    if (!discipline) return;
    const poll = pollService.createPoll(groupId || '', selectedDiscipline, discipline.name);
    setIsPollActive(true);
    setPollRemainingTime(10 * 60);
    alert(`Опрос по дисциплине "${discipline.name}" начат! Длительность: 10 минут.`);
  };

  const handleEndPoll = () => {
    const poll = pollService.getActivePoll();
    if (!poll) return;
    poll.isActive = false;
    localStorage.setItem('active_poll', JSON.stringify(poll));
    setIsPollActive(false);
    setPollRemainingTime(0);
    alert('Опрос завершён досрочно!');
    loadDataForSelection();
  };

  const handleDownloadReport = () => {
    console.log('Скачать отчет');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (isLoading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.groupPageContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backButton} onClick={handleBack}>
            ← Назад
          </button>
          <div className={styles.headerTitles}>
            <h1 className={styles.pageTitle}>Группа {groupName}</h1>
            <span className={styles.pageSubtitle}>Табель посещаемости</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.fullName || 'Преподаватель'}</span>
            <span className={styles.userRole}>Преподаватель</span>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Выход
          </button>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <div className={styles.viewButtons}>
                <button
                  className={`${styles.viewButton} ${viewMode === 'daily' ? styles.active : ''}`}
                  onClick={() => setViewMode('daily')}
                >
                  Ежедневный
                </button>
                <button
                  className={`${styles.viewButton} ${viewMode === 'weekly' ? styles.active : ''}`}
                  onClick={() => setViewMode('weekly')}
                >
                  Еженедельный
                </button>
                <button
                  className={`${styles.viewButton} ${viewMode === 'monthly' ? styles.active : ''}`}
                  onClick={() => setViewMode('monthly')}
                >
                  Ежемесячный
                </button>
              </div>
            </div>

            <div className={styles.filterGroup}>
              <div className={styles.datePickerWrapper}>
                <button
                  className={styles.dateButton}
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <span>{selectedDate || 'Выберите дату'}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M7 10L12 15L17 10" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showCalendar && (
                  <div className={styles.calendarDropdown}>
                    <div className={styles.calendarHeader}>
                      <button onClick={prevMonth} className={styles.calendarNav}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M15 18L9 12L15 6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <span className={styles.calendarMonth}>
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                      </span>
                      <button onClick={nextMonth} className={styles.calendarNav}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M9 18L15 12L9 6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    <div className={styles.calendarGrid}>
                      {dayNames.map((day) => (
                        <div key={day} className={styles.calendarDayName}>{day}</div>
                      ))}
                      {getDaysInMonth(currentMonth).map((item, index) => (
                        <div
                          key={index}
                          className={`${styles.calendarDay} ${
                            !item.isCurrentMonth ? styles.calendarDayOther : ''
                          } ${
                            selectedDay === item.day && item.isCurrentMonth
                              ? styles.calendarDaySelected
                              : ''
                          }`}
                          onClick={() => item.isCurrentMonth && item.day && selectDate(item.day)}
                        >
                          {item.day}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <select
                className={styles.disciplineSelect}
                value={selectedDiscipline}
                onChange={handleDisciplineChange}
              >
                {disciplines.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              {isPollActive ? (
                <button
                  className={`${styles.startPollButton} ${styles.pollActive}`}
                  onClick={handleEndPoll}
                >
                  Завершить опрос ({formatTime(pollRemainingTime)})
                </button>
              ) : (
                <button
                  className={styles.startPollButton}
                  onClick={handleStartPoll}
                >
                  Начать опрос
                </button>
              )}
              <button className={styles.downloadReportButton} onClick={handleDownloadReport}>
                Скачать отчет Word
              </button>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.attendanceTable}>
              <thead>
                <tr>
                  <th>№</th>
                  <th>ФИО</th>
                  <th>ОЦЕНКА</th>
                  <th>СТАТУС ПРИСУТСТВИЯ</th>
                </tr>
              </thead>
              <tbody>
                {students.map((item, index) => {
                  const record = item.records[0];
                  return (
                    <tr key={item.student.id}>
                      <td>{index + 1}</td>
                      <td>{item.student.fullName}</td>
                      <td>
                        <select
                          className={styles.gradeSelect}
                          value={record?.grade || '-'}
                          onChange={(e) => handleGradeChange(item.student.id, e.target.value)}
                        >
                          {gradeOptions.map((grade) => (
                            <option key={grade} value={grade}>
                              {grade}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            record?.status === 'П' ? styles.statusPresent : styles.statusAbsent
                          }`}
                        >
                          {record?.status || 'Н'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.saveWrapper}>
            <button className={styles.saveButton} onClick={handleSaveAll} disabled={isSaving}>
              {isSaving ? 'Сохранение...' : 'Сохранить все изменения'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherGroupPage;